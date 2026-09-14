import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ensureSchema } from "../lib/ensureSchema";
import { ensureDefaultUsers } from "../lib/seedUsers";
import { config } from "../config";
import { AppError } from "../utils/appError";
import { AuthPayload } from "../middleware/auth";

export function signToken(payload: AuthPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

function isMissingTableError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: string }).code)
      : "";
  const message = error instanceof Error ? error.message : "";
  return code === "P2021" || message.includes("does not exist");
}

async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

export async function login(email: string, password: string) {
  let user;
  try {
    user = await findUserByEmail(email);
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
    await ensureSchema();
    await ensureDefaultUsers();
    user = await findUserByEmail(email);
  }

  if (!user) {
    throw new AppError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
  }

  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    token: signToken(payload),
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export function publicUser(user: { id: string; email: string; role: Role }) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

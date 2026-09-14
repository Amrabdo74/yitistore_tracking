import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { AppError } from "../utils/appError";
import { AuthPayload } from "../middleware/auth";

export function signToken(payload: AuthPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

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

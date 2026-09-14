# نظام تتبع التوصيل — يتي ستور

تطبيق بسيط لإدارة طلبات التوصيل لنشاط لديه مندوب واحد.

- لوحة الإدارة: إنشاء الطلبات ومتابعتها
- واجهة المندوب: عرض الطلب وتغيير حالته

## التشغيل المحلي

المتطلبات: Node.js 20+ و PostgreSQL.

1. أنشئ قاعدة البيانات `yitistore_tracking`.
2. حدّث `backend/.env` بقيمة `DATABASE_URL`.
3. شغّل:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

الإدارة: http://localhost:3000/login  
المندوب: نفس صفحة الدخول ثم التحويل إلى `/driver/orders`

### الحسابات الافتراضية

- الإدارة: `admin@yitistore.com` / `Admin123!`
- المندوب: `driver@yitistore.com` / `Driver123!`

## الرفع على Hostinger

Hostinger يحتاج `package.json` في جذر المشروع مع سكربت `start`.

في لوحة Hostinger:

- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`
- Entry: `server.js`

أضف متغيرات البيئة:

```
NODE_ENV=production
FRONTEND_URL=https://tracking.yitistore.com
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=ضع-مفتاح-قوي-هنا
JWT_EXPIRES_IN=7d
COOKIE_NAME=yt_session
ADMIN_EMAIL=admin@yitistore.com
ADMIN_PASSWORD=Admin123!
DRIVER_EMAIL=driver@yitistore.com
DRIVER_PASSWORD=Driver123!
```

ملاحظات:

- استخدم PostgreSQL (من Hostinger أو خدمة مثل Neon).
- لا تضف `PORT` يدوياً؛ Hostinger يضبطه تلقائياً.
- `FRONTEND_URL` يكون رابط الموقع على Hostinger.
- أول تشغيل ينشئ الجداول وحساب الإدارة والمندوب تلقائياً. لا تشغّل `prisma migrate` من سكربت `start`.

## الحالات

`NEW` → `RECEIVED` → `ARRIVED` → `DELIVERED` أو `FAILED`

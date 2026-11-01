// Safe singleton Prisma client with runtime fallback

let prismaInstance: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client");
  if (PrismaClient) {
    prismaInstance =
      (global as any).prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    if (process.env.NODE_ENV !== "production") {
      (global as any).prisma = prismaInstance;
    }
  }
} catch (e) {
  // Prisma client will be instantiated once 'npx prisma generate' is run with PostgreSQL
}

export const prisma = prismaInstance;

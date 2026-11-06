import prisma from "./src/lib/prisma.js";

try {
  await prisma.$connect();
  console.log("Database connected successfully!");
} catch (error) {
  console.error("Database connection failed:", error);
} finally {
  await prisma.$disconnect();
}
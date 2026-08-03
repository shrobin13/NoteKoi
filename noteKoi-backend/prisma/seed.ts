import bcrypt from "bcrypt";
import { prisma } from "@prisma/prisma";
import { env } from "@config/env";

async function main() {
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {},
    create: {
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: "PLATFORM_ADMIN",
      isVerified: true,
    },
  });
}

main()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.argv[2] || "admin@zenflow.yoga";
const ADMIN_NAME = process.argv[3] || "Platform Administrator";

async function main() {
  console.log(`\n==================================================`);
  console.log(`🌿 ZenFlow — Admin RBAC Provisioning Tool`);
  console.log(`==================================================\n`);
  console.log(`Target Admin Email: ${ADMIN_EMAIL}`);
  console.log(`Target Admin Name:  ${ADMIN_NAME}\n`);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: "ADMIN",
      name: ADMIN_NAME,
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: "ADMIN",
    },
  });

  console.log(`✅ Success! User updated in database:`);
  console.log(`   - ID:    ${user.id}`);
  console.log(`   - Name:  ${user.name}`);
  console.log(`   - Email: ${user.email}`);
  console.log(`   - Role:  ${user.role} (ADMIN)\n`);

  try {
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "admin.cli_provision",
        entity: "User",
        entityId: user.id,
        metadata: {
          email: ADMIN_EMAIL,
          role: "ADMIN",
          script: "scripts/create-admin.ts",
        },
      },
    });
    console.log(`🔒 Audit log entry created.`);
  } catch {
    // Non-blocking
  }

  console.log(`\n==================================================`);
  console.log(`🔑 Login at: http://localhost:3000/admin/login`);
  console.log(`==================================================\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error provisioning admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


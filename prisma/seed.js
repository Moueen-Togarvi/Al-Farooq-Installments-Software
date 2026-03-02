import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'alfarooq@software.com';
    const adminPassword = 'AF!#9988';

    // Hash the password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN'
        }
    });

    console.log('Admin user created/updated with hashed password');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

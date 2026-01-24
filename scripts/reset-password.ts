import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function resetPassword() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    if (users.length === 0) {
      console.log('No users found in the database.');
      process.exit(1);
    }

    console.log('\nFound the following user(s):');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
    });

    rl.question('\nEnter the email of the user to reset password: ', async (email) => {
      const user = users.find((u) => u.email === email);

      if (!user) {
        console.log('User not found!');
        rl.close();
        await prisma.$disconnect();
        process.exit(1);
      }

      rl.question('Enter new password (minimum 6 characters): ', async (newPassword) => {
        if (newPassword.length < 6) {
          console.log('Password must be at least 6 characters long!');
          rl.close();
          await prisma.$disconnect();
          process.exit(1);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: hashedPassword,
          },
        });

        console.log(`\n✅ Password successfully reset for ${email}`);
        console.log('You can now log in with your new password!');

        rl.close();
        await prisma.$disconnect();
      });
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetPassword();

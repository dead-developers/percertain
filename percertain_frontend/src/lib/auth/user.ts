import { prisma } from "@/lib/prisma";

// Simple function to store the password as plaintext for now
// In a real application, you would use a proper hashing mechanism
export async function createUser({ name, email, password }: { name: string; email: string; password: string }) {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword: password, // Storing plaintext for simplicity
    },
  });
  
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  
  return user;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  
  return user;
}

import { prisma } from "@/lib/prisma";

export async function createUser({ name, email, password }: { name: string; email: string; password: string }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
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

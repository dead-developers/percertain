import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return null;
  }
  
  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email as string,
    },
  });
  
  if (!currentUser) {
    return null;
  }
  
  return {
    ...currentUser,
    hashedPassword: undefined,
  };
}

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * The `session.user.id` is populated by the `session` callback in
   * auth-options.ts (database strategy), so augment the default Session type
   * to include it.
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

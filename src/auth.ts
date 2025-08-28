import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import client from "@/lib/db/client";
import User from "@/lib/db/models/user.model";

import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "../auth.config";
import Google from "next-auth/providers/google";
declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      role: string;
      mobile?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: MongoDBAdapter(client),
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      credentials: {
        email: {
          type: "email",
        },
        password: { type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Authorize called with:", credentials?.email);

          await connectToDatabase();
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const user = await User.findOne({ email: credentials.email });
          console.log("User found:", user ? "Yes" : "No");

          if (!user || !user.password) {
            console.log("User not found or no password");
            return null;
          }

          const isMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );
          console.log("Password match:", isMatch);

          if (isMatch) {
            console.log("Authentication successful for:", user.email);
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              mobile: user.mobile,
            };
          }

          console.log("Password does not match");
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        // Keep JWT minimal to prevent oversized cookies (HTTP 431)
        token.role = (user as { role?: string }).role;
      }

      // When session is updated (e.g., after avatar upload), merge provided fields
      if (trigger === "update") {
        if (session?.name) {
          token.name = session.name as string;
        }
      }
      return token;
    },
    session: async ({ session, user, trigger, token }) => {
      session.user.id = token.sub as string;
      session.user.role = (token.role as string) || "User";
      // Fetch user profile fields from database instead of storing in JWT
      try {
        if (token.sub) {
          await connectToDatabase();
          const freshUser = await User.findById(token.sub).select(
            "name mobile image role"
          );
          if (freshUser) {
            session.user.name = freshUser.name;
            session.user.mobile = freshUser.mobile as string;
            // Avoid very large base64 avatars in session payload
            const imageValue = (freshUser.image || undefined) as
              | string
              | undefined;
            if (imageValue && imageValue.length > 2048) {
              session.user.image = undefined as unknown as string;
            } else {
              session.user.image = imageValue as string;
            }
            session.user.role = freshUser.role || session.user.role;
          }
        }
      } catch (error) {
        // Non-fatal if avatar cannot be fetched
      }
      return session;
    },
  },
});

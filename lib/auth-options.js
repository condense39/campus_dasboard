import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail, createUser, updateUser } from "./user-store"
import { verifyOTP } from "./otp-store"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;
        
        const isValid = await verifyOTP(credentials.email, credentials.otp);
        if (!isValid) return null;

        let user = await getUserByEmail(credentials.email);
        if (!user) {
          user = await createUser({
            email: credentials.email,
            provider: 'email',
          });
        } else {
          await updateUser(credentials.email, { lastLogin: Date.now() });
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username || '',
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        let existingUser = await getUserByEmail(user.email);
        if (!existingUser) {
          await createUser({
            email: user.email,
            username: user.name || '',
            provider: 'google',
          });
        } else {
          await updateUser(user.email, { lastLogin: Date.now() });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await getUserByEmail(session.user.email);
        if (user) {
          session.user.id = user._id.toString();
          session.user.username = user.username;
          session.user.branch = user.branch;
          session.user.year = user.year;
          session.user.semester = user.semester;
          session.user.clubs = user.clubs;
          session.user.favDishes = user.favDishes;
          session.user.isOnboarded = user.isOnboarded;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await getUserByEmail(user.email);
        if (dbUser) {
          token.isOnboarded = dbUser.isOnboarded;
        }
      }
      // When session update is triggered
      if (trigger === "update") {
        // Re-fetch from DB to get the latest isOnboarded status
        const dbUser = await getUserByEmail(token.email);
        if (dbUser) {
          token.isOnboarded = dbUser.isOnboarded;
        }
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
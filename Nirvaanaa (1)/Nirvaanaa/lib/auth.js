import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Environment guards
if (!process.env.NEXTAUTH_URL) {
  console.warn('[lib/auth] NEXTAUTH_URL is not set. Set it to your site URL (e.g. https://nirvaanaa.in)');
}
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('[lib/auth] NEXTAUTH_SECRET is not set. Authentication will be less secure in production.');
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.passwordHash) {
          throw new Error('Please sign in with your social account');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();

        const existingUser = await User.findOne({
          $or: [
            { email: user.email },
            { googleId: profile.sub },
          ],
        });

        if (existingUser) {
          if (!existingUser.googleId) {
            existingUser.googleId = profile.sub;
            existingUser.image = user.image;
            await existingUser.save();
          }
          return existingUser.isActive;
        }

        const newUser = new User({
          name: user.name,
          email: user.email,
          image: user.image,
          googleId: profile.sub,
          emailVerified: true,
        });

        await newUser.save();
        return true;
      }

      try {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          dbUser.lastLogin = new Date();
          await dbUser.save();
        }
      } catch (e) {}

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;

        if (user.role === 'admin') {
          token.maxAge = 2 * 60 * 60;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};


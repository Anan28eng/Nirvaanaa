import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

        // Inside authorize
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
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await dbConnect();

        const existingUser = await User.findOne({
          $or: [
            { email: user.email },
            { googleId: account.provider === 'google' ? profile.sub : null },
            { facebookId: account.provider === 'facebook' ? profile.id : null },
          ],
        });

        if (existingUser) {
          // Update social IDs if not present
          if (account.provider === 'google' && !existingUser.googleId) {
            existingUser.googleId = profile.sub;
            existingUser.image = user.image;
            await existingUser.save();
          } else if (account.provider === 'facebook' && !existingUser.facebookId) {
            existingUser.facebookId = profile.id;
            existingUser.image = user.image;
            await existingUser.save();
          }

          return existingUser.isActive;
        } else {
          // Create new user
          const newUser = new User({
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: account.provider === 'google' ? profile.sub : null,
            facebookId: account.provider === 'facebook' ? profile.id : null,
            emailVerified: true,
          });

          await newUser.save();
          return true;
        }
      }

      // track lastLogin for real-time KPI customer activity
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
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        // Set shorter expiry for admin users (2 hours)
        if (user.role === 'admin') {
          token.maxAge = 2 * 60 * 60; // 2 hours in seconds
        }
      }

      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
          // Set shorter expiry for admin users (2 hours)
          if (dbUser.role === 'admin') {
            token.maxAge = 2 * 60 * 60; // 2 hours in seconds
          }
        }
      }

      // Check if admin token has expired
      if (token.role === 'admin' && token.maxAge) {
        const now = Math.floor(Date.now() / 1000);
        const issuedAt = token.iat || now;
        if (now - issuedAt > token.maxAge) {
          // Token expired for admin
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        
        // Verify admin role on every request (server-side check)
        if (token.role === 'admin') {
          await dbConnect();
          const dbUser = await User.findById(token.id);
          if (!dbUser || dbUser.role !== 'admin' || !dbUser.isActive) {
            // Revoke admin access if role changed or user deactivated
            session.user.role = 'user';
          }
        }
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
    maxAge: 30 * 24 * 60 * 60, // 30 days for regular users
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

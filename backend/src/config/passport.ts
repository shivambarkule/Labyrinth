import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import User from '../models/User';

// Type for verify callback
type VerifyCallback = (error: any, user?: any, info?: any) => void;

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user exists with email
          user = await User.findOne({ email: profile.emails?.[0]?.value });
          
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              email: profile.emails?.[0]?.value,
              name: profile.displayName,
              role: 'admin',
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport; 
import dotenv from 'dotenv';
dotenv.config();

import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../Schema/User.js';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

const passportConfig = (passport) => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) return done(null, user);
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });

          if (existingUser) {
            return done(null, existingUser);
          }

          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default passportConfig;

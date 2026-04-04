import { Role } from '@database/entities/enum';
import { User } from '@database/entities/user';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.APP_URL_BACKEND || 'http://localhost:4000'}/v1/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const userRepository = getRepository(User);
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('Google account has no email'), undefined);
        }

        let user = await userRepository.findOne({ where: { email } });

        if (!user) {
          user = new User();
          user.email = email;
          user.fullName = profile.displayName || 'Google User';
          user.password = bcrypt.hashSync(uuidv4(), 8);
          user.provider = 'google';
          user.providerId = profile.id;
          user.role = Role.PATIENT;
          await userRepository.save(user);
        } else if (!user.provider) {
          // Existing user logging in with Google for the first time
          user.provider = 'google';
          user.providerId = profile.id;
          await userRepository.save(user);
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    },
  ),
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_APP_ID!,
      clientSecret: process.env.FB_APP_SECRET!,
      callbackURL: `${process.env.APP_URL_BACKEND || 'http://localhost:4000'}/v1/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'email'],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const userRepository = getRepository(User);
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('Facebook account has no email'), undefined);
        }

        let user = await userRepository.findOne({ where: { email } });

        if (!user) {
          user = new User();
          user.email = email;
          user.fullName = profile.displayName || 'Facebook User';
          user.password = bcrypt.hashSync(uuidv4(), 8);
          user.provider = 'facebook';
          user.providerId = profile.id;
          user.role = Role.PATIENT;
          await userRepository.save(user);
        } else if (!user.provider) {
          user.provider = 'facebook';
          user.providerId = profile.id;
          await userRepository.save(user);
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    },
  ),
);

export default passport;

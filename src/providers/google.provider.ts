import ENV from '@/configs/env.config'
import { OAuth2Client } from 'google-auth-library'

// Google Auth Client
export const authClient = new OAuth2Client(ENV.GOOGLE.CLIENT_ID)

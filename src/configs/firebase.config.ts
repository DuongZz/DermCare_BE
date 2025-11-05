import admin from 'firebase-admin'
import ENV from './env.config'

const privateKeyEnv = ENV.FIREBASE.FIREBASE_PRIVATE_KEY
if (!privateKeyEnv) {
  throw new Error(
    'FIREBASE_PRIVATE_KEY is not defined in environment variables.'
  )
}
const privateKey = privateKeyEnv.replace(/\\n/g, '\n')
const serviceAccount = {
  type: ENV.FIREBASE.TYPE,
  project_id: ENV.FIREBASE.PROJECT_ID,
  private_key_id: ENV.FIREBASE.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKey,
  client_email: ENV.FIREBASE.FIREBASE_CLIENT_EMAIL,
  client_id: ENV.FIREBASE.FIREBASE_CLIENT_ID,
  auth_uri: ENV.FIREBASE.FIREBASE_AUTH_URI,
  token_uri: ENV.FIREBASE.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url:
    ENV.FIREBASE.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: ENV.FIREBASE.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: ENV.FIREBASE.FIREBASE_UNIVERSE_DOMAIN,
}
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
}
export default admin

export const db = admin.firestore()
db.settings({
  ignoreUndefinedProperties: true,
})
export const notificationLogRef = db.collection('notificationLogs')

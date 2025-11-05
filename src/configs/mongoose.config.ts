import ENV from './env.config'
import mongoose from 'mongoose'
import initialData from '@/utils/initial-data.util'

export default async () => {
  try {
    await mongoose
      .set('strictQuery', true)
      .connect(ENV.DB.MONGO_URI as string, { retryWrites: true, w: 'majority' })

    await initialData()

    // await initDB()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('[DB]: Error connecting to the database', error)
  }
}

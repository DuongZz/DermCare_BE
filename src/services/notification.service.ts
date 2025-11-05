import AppError from '@/utils/app-error.util'
import { StatusCodes } from 'http-status-codes'
import { successResponse } from '@/utils/response.util'
import Users from '@/models/user.model'
import {
  INotification,
  INotificationPayload,
  ISendNotification,
} from '@/types/notification.type'
import chunk from 'lodash/chunk'
import { ETargetNotification } from '@/configs/enum.config'
import admin, { notificationLogRef } from '@/configs/firebase.config'
import MESSAGES from '@/messages/notification.message'
import { firestore } from 'firebase-admin'

export const saveNotificationLog = async (log: INotification) => {
  const dataToSave = {
    ...log,
    sentAt: log.sentAt || new Date(),
    read: log.read ?? false,
  }
  const docRef = await notificationLogRef.add(dataToSave)
  return docRef.id
}

const removeInvalidTokens = async (invalidTokens: string[]) => {
  await Users.updateMany(
    { fcmTokens: { $in: invalidTokens } },
    { $pull: { fcmTokens: { $in: invalidTokens } } }
  )
}

export const sendNotification = async ({
  tokens,
  title,
  body,
  data,
}: INotificationPayload) => {
  const ttlMilliseconds = 7 * 24 * 60 * 60 * 1000 // 7 days
  const timeToLive = Math.floor(ttlMilliseconds / 1000)

  const messagePayload: admin.messaging.MessagingPayload = {
    notification: { title, body },
    data: data
      ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      : {},
  }

  const androidConfig = {
    ttl: ttlMilliseconds,
  }

  const apnsConfig = {
    headers: {
      'apns-expiration': `${Math.floor(Date.now() / 1000) + timeToLive}`,
    },
  }

  const invalidTokens: string[] = []
  let successCount = 0
  let failureCount = 0

  const chunkedTokens = chunk(tokens, 500)

  for (const chunkTokens of chunkedTokens) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: chunkTokens,
      notification: messagePayload.notification,
      data: messagePayload.data,
      android: androidConfig,
      apns: apnsConfig,
    })

    response.responses.forEach((resp, i) => {
      if (!resp.success) {
        const code = resp.error?.code
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(chunkTokens[i])
        }
        failureCount++
      } else {
        successCount++
      }
    })
  }

  if (invalidTokens.length > 0) {
    await removeInvalidTokens(invalidTokens)
  }

  return successResponse(
    { successCount, failureCount },
    MESSAGES.SENT_SUCCESSFULLY
  )
}
export const sendNotificationByAdmin = async (payload: ISendNotification) => {
  let users: Array<{ _id: string; fcmTokens: string[] }> = []

  switch (payload.targetType) {
    case ETargetNotification.USER: {
      const { userId } = payload
      console.log('userId:', userId)
      const user = await Users.findById(userId).select('fcmTokens')
      console.log('user from DB:', user)
      console.log('userId type:', typeof userId)
      console.log('Users collection name:', Users.collection.name)

      if (user) {
        users = [{ _id: user._id.toString(), fcmTokens: user.fcmTokens || [] }]
      }
      break
    }

    case ETargetNotification.ROLE: {
      const { roleId } = payload
      users = await Users.find({ roles: roleId }).select('fcmTokens')
      break
    }

    case ETargetNotification.ALL: {
      users = await Users.find({
        fcmTokens: { $exists: true, $ne: [] },
      }).select('fcmTokens')
      break
    }
  }

  const tokenMap: Record<string, string[]> = {}
  const allTokens: string[] = []

  for (const user of users) {
    const validTokens = (user.fcmTokens || []).filter(Boolean)
    if (validTokens.length > 0) {
      tokenMap[String(user._id)] = validTokens
      allTokens.push(...validTokens)
    }
  }

  const uniqueTokens = [...new Set(allTokens)]
  if (uniqueTokens.length === 0) {
    return successResponse(null, MESSAGES.NO_FCM_TOKEN_FOUND_NOTIFICATION_SKIP)
  }

  const notificationPayload: INotificationPayload = {
    tokens: uniqueTokens,
    title: payload.title,
    body: payload.body,
    data: payload.data,
  }

  const [response] = await Promise.all([
    sendNotification(notificationPayload),

    (async () => {
      const sentAt = new Date()
      const logs = Object.keys(tokenMap).map(userId => ({
        userId,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sentAt,
        read: false,
        target: payload.targetType,
        ...(payload.targetType === ETargetNotification.ROLE
          ? { role: payload.roleId }
          : {}),
      }))

      const chunks = chunk(logs, 500)
      for (const chunkLogs of chunks) {
        const batch = firestore().batch()
        chunkLogs.forEach(log => {
          const docRef = notificationLogRef.doc()
          batch.set(docRef, log)
        })
        await batch.commit()
      }
    })(),
  ])

  return successResponse(response, MESSAGES.SENT_SUCCESSFULLY)
}

export const getUserNotification = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit

  const snapshot = await notificationLogRef
    .where('userId', '==', userId)
    .orderBy('sentAt', 'desc')
    .offset(skip)
    .limit(limit)
    .get()

  const notifications = snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title,
      body: data.body,
      sentAt: data.sentAt.toDate(),
      read: data.read ?? false,
    }
  })

  const hasMore = snapshot.size === limit

  return successResponse(
    {
      notifications,
      pagination: {
        page,
        limit,
        hasMore,
      },
    },
    MESSAGES.USER_NOTIFICATIONS_FETCHED
  )
}

const checkNotificationPermission = async (
  notificationId: string,
  userId: string
) => {
  const notificationRef = notificationLogRef.doc(notificationId)
  const doc = await notificationRef.get()

  if (!doc.exists) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGES.NOT_FOUND)
  }

  const data = doc.data()
  if (!data || String(data.userId) !== String(userId)) {
    throw new AppError(StatusCodes.FORBIDDEN, MESSAGES.NO_PERMISSION)
  }

  return { notificationRef, doc }
}

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  const { notificationRef } = await checkNotificationPermission(
    notificationId,
    userId
  )

  await notificationRef.update({
    read: true,
    readAt: admin.firestore.Timestamp.now(),
  })

  return successResponse(null, MESSAGES.MARKED_AS_READ)
}

export const markAllNotificationsAsRead = async (userId: string) => {
  const snapshot = await notificationLogRef
    .where('userId', '==', String(userId))
    .where('read', '==', false)
    .get()

  if (snapshot.empty) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGES.NO_UNREAD)
  }

  const readAt = admin.firestore.Timestamp.now()
  const docs = snapshot.docs
  const chunks = chunk(docs, 500)

  for (const docChunk of chunks) {
    const batch = notificationLogRef.firestore.batch()
    docChunk.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt,
      })
    })
    await batch.commit()
  }

  return successResponse(null, MESSAGES.ALL_MARKED_AS_READ)
}

export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  const { notificationRef } = await checkNotificationPermission(
    notificationId,
    userId
  )

  await notificationRef.delete()

  return successResponse(null, MESSAGES.DELETED)
}

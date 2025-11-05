import ENV from '@/configs/env.config'
import MESSAGE from '@/messages/common.message'
import {
  IFileResponse,
  IFileValidationOptions,
  IMinioBucketConfig,
  IUploadOptions,
} from '@/interfaces/minio.interface'
import AppError from '@/utils/app-error.util'
import { Client, ClientOptions } from 'minio'
import { v4 as uuidv4 } from 'uuid'
import mime from 'mime-types'
import path, { extname } from 'path'
import { StatusCodes } from 'http-status-codes'
import { EFileType } from '@/configs/enum.config'
import sharp from 'sharp'

const FILE_TYPE_RULES: Record<string, IFileValidationOptions> = {
  image: {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSizeInMB: 5,
  },
}

const minioClient = new Client({
  endPoint: ENV.MINIO.HOST,
  port: ENV.MINIO.PORT,
  useSSL: false,
  accessKey: ENV.MINIO.ACCESS_KEY,
  secretKey: ENV.MINIO.SECRET_KEY,
} as ClientOptions)

const publicPolicy = (bucketName: string) => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  }
}

const privatePolicy = {
  Version: '2012-10-17',
  Statement: [],
}

export const createBuckets = async (buckers: IMinioBucketConfig[]) => {
  try {
    for (const bucket of buckers) {
      const isExist = await minioClient.bucketExists(bucket.name)
      if (!isExist) {
        await minioClient.makeBucket(bucket.name)
        if (bucket.private) {
          await minioClient.setBucketPolicy(
            bucket.name,
            JSON.stringify(privatePolicy)
          )
        } else {
          await minioClient.setBucketPolicy(
            bucket.name,
            JSON.stringify(publicPolicy(bucket.name))
          )
        }
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('[Minio]: Error connecting to the database', error)
  }
}

export function validateFile(
  file: Express.Multer.File,
  type: keyof typeof FILE_TYPE_RULES
): void {
  const rules = FILE_TYPE_RULES[type]
  const ext = extname(file.originalname).toLowerCase()

  if (!rules.allowedExtensions.includes(ext)) {
    throw new AppError(
      StatusCodes.UNSUPPORTED_MEDIA_TYPE,
      `File extension "${ext}" is not allowed for type "${type}"`
    )
  }

  const sizeInMB = file.size / (1024 * 1024)
  if (sizeInMB > rules.maxSizeInMB) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `File size exceeds ${rules.maxSizeInMB} MB`
    )
  }
}

// Upload file, nếu là video nên xây 1 hàm khác nhé bởi nếu cần HLS thì nên kiểu khác
export async function uploadFile({
  reqFile,
  bucket,
  type,
}: IUploadOptions): Promise<IFileResponse> {
  if (!reqFile) {
    throw new AppError(StatusCodes.BAD_REQUEST, MESSAGE.FILE_NOT_FOUND)
  }

  const bucketExists = await minioClient.bucketExists(bucket.name)
  if (!bucketExists) {
    await createBuckets([bucket])
  }

  validateFile(reqFile, type)

  let extension = extname(reqFile.originalname)
  let contentType = mime.lookup(extension) || 'application/octet-stream'

  let buffer = reqFile.buffer
  if (type === EFileType.IMAGE) {
    buffer = await sharp(reqFile.buffer)
      .resize({ width: 1920 })
      .jpeg({ quality: 80 })
      .toBuffer()
    extension = '.jpg'
    contentType = mime.lookup(extension) || 'application/octet-stream'
  }

  const fileName = `${type}/${uuidv4()}${extension}`

  await minioClient.putObject(bucket.name, fileName, buffer, buffer.length, {
    'Content-Type': contentType,
  })

  const isPublic = !bucket.private

  const fileResponse: IFileResponse = {
    url: '',
    key: fileName,
    originalName: path.basename(reqFile.originalname),
    size: buffer.length,
    mimeType: contentType,
    type,
    isPublic,
    bucketName: bucket.name,
  }

  if (isPublic) {
    fileResponse.url = `${ENV.MINIO.ENDPOINT}/${bucket.name}/${fileName}`
  }

  return fileResponse
}

export default minioClient

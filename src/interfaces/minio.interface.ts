import { EFileType } from '@/configs/enum.config'

export interface IMinioBucketConfig {
  name: string
  private: boolean
}

export interface IUploadOptions {
  reqFile: Express.Multer.File
  bucket: IMinioBucketConfig
  type: EFileType
}

export interface IFileResponse {
  url: string
  key: string
  originalName: string
  size: number
  mimeType: string
  type: string
  isPublic: boolean
  bucketName: string
}

export interface IFileValidationOptions {
  allowedExtensions: string[]
  maxSizeInMB: number
}

import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import ENV from '@/configs/env.config'
import simpleGit, { SimpleGit } from 'simple-git'
import fsExtra from 'fs-extra'
import AppError from './app-error.util'
import { StatusCodes } from 'http-status-codes'
import CONSTANT from '@/configs/constant.config'

export async function backupDatabase() {
  try {
    const folder = CONSTANT.FOLDER.BACKUP_DIR
    if (!folder) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Missing BACKUP_FOLDER in environment variables'
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const db = mongoose.connection.db!
    const collections = await db.collections()

    await fs.promises.mkdir(folder, { recursive: true })

    for (const collection of collections) {
      const data = await collection.find().toArray()
      const filePath = path.join(folder, `${collection.collectionName}.json`)
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
    }
    await pushBackupToGitHub(folder)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Backup Service] Error during database backup:', error)
  }
}

async function pushBackupToGitHub(backupFolder: string) {
  try {
    const repoDir = ENV.BACKUP.GIT_REPO_DIR || '/app/backup'
    const git_username = ENV.BACKUP.GIT_USERNAME
    const token = ENV.BACKUP.GIT_PAT
    const git_email = ENV.BACKUP.GIT_EMAIL

    if (!git_username || !token || !git_email) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Missing Git username or token'
      )
    }

    const encodedToken = encodeURIComponent(token)
    const gitRepoUrl = `https://${git_username}:${encodedToken}@github.com/${git_username}/BackUpDatabase.git`
    const git: SimpleGit = simpleGit()

    // Clone nếu repo chưa tồn tại
    if (!fs.existsSync(path.join(repoDir, '.git'))) {
      if (fs.existsSync(repoDir)) {
        fsExtra.removeSync(repoDir)
      }
      await git.clone(gitRepoUrl, repoDir)
    }

    const repoGit = simpleGit(repoDir)
    await repoGit.cwd(repoDir)
    await repoGit.addConfig('user.name', git_username)
    await repoGit.addConfig('user.email', git_email)
    await repoGit.checkout('main')
    await repoGit.reset(['--hard'])
    await repoGit.clean('f', ['-d'])
    await repoGit.pull('origin', 'main')

    // Ghi đè toàn bộ file từ backupFolder vào repoDir
    const backupFiles = await fs.promises.readdir(backupFolder)
    for (const file of backupFiles) {
      const srcPath = path.join(backupFolder, file)
      const destPath = path.join(repoDir, file)
      await fs.promises.copyFile(srcPath, destPath)
    }

    await repoGit.add('./*')

    const formattedDate = new Date().toISOString()
    await repoGit.commit(`Auto backup snapshot at ${formattedDate}`)
    await repoGit.push('origin', 'main')
  } catch (err: unknown) {
    const error = err as Error
    // eslint-disable-next-line no-console
    console.error('[Backup Service] Error during pushing backup to GitHub')
    // eslint-disable-next-line no-console
    console.error('Message:', error.message)
    // eslint-disable-next-line no-console
    console.error('Stack:', error.stack)
  }
}

/**
 * File này để định nghĩa các utilities liên quan đến file
 */

import fs from 'fs'

/**
 * This function is used to create folder if not exists
 * Hàm này được sử dụng để tạo folder nếu chưa tồn tại
 * @param folderPath implements string[]
 * @returns void
 */
export const bootstrapFolder = (folderPath: string[]) => {
  folderPath.map(DIR => {
    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR, { recursive: true })
    }
  })
}

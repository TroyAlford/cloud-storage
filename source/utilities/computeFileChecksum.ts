import crypto from 'crypto'
import fs from 'fs'

export const computeFileChecksum = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileContent).digest('hex');
}

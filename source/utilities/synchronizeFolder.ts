import S3 from '@aws-sdk/client-s3'
import fs from 'fs'
import { getS3Tags } from './getS3Tags'
import { computeFileChecksum } from './computeFileChecksum'
import { Tag } from '@/types/Tag'

const localDirectory: string = ''
const s3BucketName: string = ''

const s3 = new S3.S3Client()

export const synchronizeFolder = async () => {
	fs.readdirSync(localDirectory).forEach(async file => {
		const localPath = `${localDirectory}/${file}`

		const checksum = computeFileChecksum(localPath)
		const tags = await getS3Tags(s3BucketName, file)

		if (checksum === tags[Tag.CHECKSUM]) return;

		const stats = fs.statSync(localPath)
		if (+tags[Tag.LAST_UPDATED] > stats.mtimeMs) {
			const download = new S3.GetObjectCommand({ Bucket: s3BucketName, Key: file })
			try {
				const response = await s3.send(download)
				const bytes = response.Body?.transformToByteArray()
				fs.createWriteStream(localPath).write(bytes)
				console.log(`Downloaded ${file} successfully.`)
			} catch {
				console.error(`Failed to download ${file}`)
			}
		} else if (+tags[Tag.LAST_UPDATED] < stats.mtimeMs) {
			const upload = new S3.PutObjectCommand({
				Bucket: s3BucketName,
				Key: file,
				Body: fs.createReadStream(localPath),
				Tagging: new URLSearchParams({
					[Tag.CHECKSUM]: checksum,
					[Tag.LAST_UPDATED]: stats.mtimeMs.toString(),
				}).toString(),
			})
			try {
				const response = await s3.send(upload)
				console.log(`Uploaded ${localPath} successfully.`)
			} catch {
				console.error(`Failed to upload ${localPath}.`)
			}
		}
	})
}

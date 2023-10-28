import { Tag } from '@/types/Tag';
import S3 from '@aws-sdk/client-s3'

const s3 = new S3.S3Client();
const TAG_NAMES = Object.values(Tag);

export const getS3Tags = async (bucket: string, key: string): Promise<Record<Tag, string>> => {
	try {
		const request = new S3.GetObjectTaggingCommand({ Bucket: bucket, Key: key });
		const { TagSet = [] } = await s3.send(request);
		return TagSet.reduce<Record<Tag, string>>((tags, tag) => (
			TAG_NAMES.includes(tag.Key as Tag)
				? { ...tags, [tag.Key as Tag]: tag.Value }
				: tags
		), {} as Record<Tag, string>);
	} catch (error) {
		console.error(`Unable to retrieve checksum for ${bucket}/${key}.`);
	}

	return {} as Record<Tag, string>;
}

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET_NAME is not set");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export function getPublicUrl(storageKey: string): string {
  const endpoint = process.env.AWS_ENDPOINT_URL;
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!endpoint || !bucket) {
    throw new Error("AWS_ENDPOINT_URL and AWS_S3_BUCKET_NAME must be set");
  }

  const { protocol, host } = new URL(endpoint);
  return `${protocol}//${bucket}.${host}/${storageKey}`;
}

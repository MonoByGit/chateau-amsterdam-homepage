import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

// One day — long enough that a page rendered now stays valid for a normal
// browsing session, short enough to stay a sane default for a bucket that
// isn't (and, confirmed against the real bucket, can't be made) public.
const OBJECT_URL_EXPIRY_SECONDS = 60 * 60 * 24;

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

/**
 * Returns a time-limited signed URL for reading an object.
 *
 * Confirmed against the real bucket (not assumed): this Railway S3-compatible
 * bucket has no public-read option — neither a `public-read` object ACL nor
 * an unauthenticated GET reaches the object; both return AccessDenied. A
 * presigned GET request is the only way to serve an uploaded image without
 * routing every image request through this app's own server. Since every
 * page that renders one of these URLs is a Server Component fetching fresh
 * per request (no caching layer, per this project's architecture), a fresh
 * signed URL on each render is the natural fit — no separate refresh
 * mechanism is needed.
 */
export async function getObjectUrl(storageKey: string): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET_NAME is not set");
  }

  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: storageKey }), {
    expiresIn: OBJECT_URL_EXPIRY_SECONDS,
  });
}

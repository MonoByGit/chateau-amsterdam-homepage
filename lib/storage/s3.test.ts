// lib/storage/s3.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getObjectUrl, uploadObject } from "./s3";

const s3Mock = mockClient(S3Client);

describe("uploadObject", () => {
  beforeEach(() => {
    s3Mock.reset();
    vi.stubEnv("AWS_S3_BUCKET_NAME", "chateau-media-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends a PutObjectCommand with the given key, body, and content type", async () => {
    s3Mock.on(PutObjectCommand).resolves({});

    await uploadObject("media/test-key.jpg", Buffer.from("fake-image-bytes"), "image/jpeg");

    const calls = s3Mock.commandCalls(PutObjectCommand);
    expect(calls).toHaveLength(1);
    expect(calls[0].args[0].input).toMatchObject({
      Bucket: "chateau-media-test",
      Key: "media/test-key.jpg",
      ContentType: "image/jpeg",
    });
  });

  it("throws when AWS_S3_BUCKET_NAME is not set", async () => {
    vi.stubEnv("AWS_S3_BUCKET_NAME", "");
    await expect(uploadObject("media/x.jpg", Buffer.from("x"), "image/png")).rejects.toThrow(
      "AWS_S3_BUCKET_NAME is not set"
    );
  });
});

// getObjectUrl signs the request with the S3 client's already-configured
// endpoint/credentials (baked in at module load from the real bucket env
// vars) — only the bucket name is re-read from process.env at call time,
// so these tests assert the presigned URL's shape (contains the given
// bucket/key, is a real AWS SigV4 query-signed URL) rather than a fixed
// full string, since the signature and endpoint host vary by environment.
describe("getObjectUrl", () => {
  beforeEach(() => {
    vi.stubEnv("AWS_S3_BUCKET_NAME", "chateau-media-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a presigned GET URL containing the bucket and key", async () => {
    const url = await getObjectUrl("media/abc-test.jpg");

    expect(url).toContain("chateau-media-test");
    expect(url).toContain("media/abc-test.jpg");
    expect(url).toContain("X-Amz-Signature=");
    expect(url).toContain("X-Amz-Expires=86400");
  });

  it("throws when AWS_S3_BUCKET_NAME is not set", async () => {
    vi.stubEnv("AWS_S3_BUCKET_NAME", "");
    await expect(getObjectUrl("media/x.jpg")).rejects.toThrow("AWS_S3_BUCKET_NAME is not set");
  });
});

// lib/storage/s3.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getPublicUrl, uploadObject } from "./s3";

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

describe("getPublicUrl", () => {
  beforeEach(() => {
    vi.stubEnv("AWS_ENDPOINT_URL", "https://bucket-production.up.railway.app");
    vi.stubEnv("AWS_S3_BUCKET_NAME", "chateau-media-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a virtual-host-style public URL from the endpoint and bucket", () => {
    const url = getPublicUrl("media/abc-test.jpg");
    expect(url).toBe("https://chateau-media-test.bucket-production.up.railway.app/media/abc-test.jpg");
  });
});

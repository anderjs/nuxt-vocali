import { config } from "../config";
import { createUploadObjectKey } from "../utils/storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const UPLOAD_URL_EXPIRES_IN_SECONDS = 300;

export interface CreateUploadUrlParams {
  userId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface CreateUploadUrlResult {
  uploadUrl: string;
  objectKey: string;
}

export class S3Service {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: config.awsRegion,
    });
  }

  async createUploadUrl({
    userId,
    fileName,
    contentType,
    fileSize,
  }: CreateUploadUrlParams): Promise<CreateUploadUrlResult> {
    const bucketName = config.s3BucketName;

    if (!bucketName) {
      throw new Error("S3 bucket name is not configured");
    }

    const objectKey = createUploadObjectKey(userId, fileName);

    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Key: objectKey,
        Bucket: bucketName,
        ContentLength: fileSize,
        ContentType: contentType,
      }),
      { expiresIn: UPLOAD_URL_EXPIRES_IN_SECONDS },
    );

    return {
      objectKey,
      uploadUrl,
    };
  }
}

export const s3Service = new S3Service();

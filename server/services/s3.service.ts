import { config } from "../config";
import {
  createTranscriptionDownloadFileName,
  createUploadObjectKey,
} from "../utils/storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const UPLOAD_URL_EXPIRES_IN_SECONDS = 300;
const DOWNLOAD_URL_EXPIRES_IN_SECONDS = 300;
const SOURCE_AUDIO_URL_EXPIRES_IN_SECONDS = 900;

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

export interface PutTranscriptionTextParams {
  objectKey: string;
  text: string;
}

export interface CreateTranscriptionDownloadUrlParams {
  fileName: string;
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

  async putTranscriptionText({
    objectKey,
    text,
  }: PutTranscriptionTextParams): Promise<void> {
    const bucketName = config.s3BucketName;

    if (!bucketName) {
      throw new Error("S3 bucket name is not configured");
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: text,
        ContentType: "text/plain; charset=utf-8",
      }),
    );
  }

  /** Creates a temporary private URL that Speechmatics can use to fetch source audio. */
  async createSourceAudioDownloadUrl(objectKey: string): Promise<string> {
    const bucketName = config.s3BucketName;

    if (!bucketName) {
      throw new Error("S3 bucket name is not configured");
    }

    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: bucketName, Key: objectKey }),
      { expiresIn: SOURCE_AUDIO_URL_EXPIRES_IN_SECONDS },
    );
  }

  async getTranscriptionText(objectKey: string): Promise<string> {
    const bucketName = config.s3BucketName;

    if (!bucketName) {
      throw new Error("S3 bucket name is not configured");
    }

    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    if (!response.Body) {
      throw new Error("Transcription text is not available");
    }

    return response.Body.transformToString();
  }

  async createTranscriptionDownloadUrl({
    fileName,
    objectKey,
  }: CreateTranscriptionDownloadUrlParams): Promise<string> {
    const bucketName = config.s3BucketName;

    if (!bucketName) {
      throw new Error("S3 bucket name is not configured");
    }

    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ResponseContentDisposition: `attachment; filename="${createTranscriptionDownloadFileName(fileName)}"`,
        ResponseContentType: "text/plain; charset=utf-8",
      }),
      { expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS },
    );
  }
}

export const s3Service = new S3Service();

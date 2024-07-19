import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const accessKeyId = plan98.env.S3_COMPAT_ACCESS_KEY; // provided on admin panel
const secretAccessKey = plan98.env.S3_COMPAT_SECRET_KEY; // provided on admin panel
const endpoint = plan98.env.S3_COMPAT_ENDPOINT; // provided on admin panel
export const bucketName = plan98.env.S3_COMPAT_BUCKET; // provided on admin panel

const s3 = new S3Client({
  region: "us-east-1", // Specify your region
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  endpoint,
  forcePathStyle: true,
  requestHandler: {
    connectionTimeout: 0,
    socketTimeout: 0,
  },
});

export default s3

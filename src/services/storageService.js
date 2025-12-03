const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

let s3Client;

const getS3Client = () => {
  if (s3Client) return s3Client;
  if (!process.env.S3_BUCKET) {
    throw new Error('S3_BUCKET must be set');
  }
  s3Client = new S3Client({
    region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: Boolean(process.env.S3_FORCE_PATH_STYLE),
    credentials: process.env.AWS_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
  });
  return s3Client;
};

const generateObjectKey = (ownerId, filename) => {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const suffix = crypto.randomBytes(8).toString('hex');
  const ts = Date.now();
  return `user-${ownerId}/${ts}-${suffix}-${safeName}`;
};

const getUploadUrl = async ({ key, contentType, expiresInSeconds = 900 }) => {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return url;
};

const getDownloadUrl = async ({ key, expiresInSeconds = 900 }) => {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return url;
};

module.exports = {
  generateObjectKey,
  getUploadUrl,
  getDownloadUrl,
};

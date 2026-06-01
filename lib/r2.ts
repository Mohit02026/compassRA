import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'

function getClient(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  })
}

const isMock = !process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID

// Stream a buffer to R2. Never buffers the full file in memory beyond what's passed in.
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  if (isMock) {
    console.log(`[R2 mock] upload skipped — key: ${key}, size: ${body.length} bytes`)
    return
  }

  const client = getClient()
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
}

// Returns a pre-signed URL valid for 1 hour.
export async function getPresignedUrl(key: string): Promise<string> {
  if (isMock) {
    console.log(`[R2 mock] presign skipped — key: ${key}`)
    return `http://localhost:3000/mock-download/${encodeURIComponent(key)}`
  }

  const client = getClient()
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })
  return getSignedUrl(client, command, { expiresIn: 3600 })
}

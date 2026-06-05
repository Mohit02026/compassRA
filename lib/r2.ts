import { S3Client, PutObjectCommand, GetObjectCommand, NoSuchKey } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// R2_ENDPOINT overrides the default Cloudflare endpoint.
// Set to http://localhost:9000 for local MinIO dev.
// Leave unset in production — defaults to Cloudflare R2.
function getClient(): S3Client {
  const endpoint = process.env.R2_ENDPOINT
    ?? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
    // Required for MinIO — it uses path-style URLs (localhost:9000/bucket/key)
    // Cloudflare R2 also accepts path-style, so this is safe in both environments
    forcePathStyle: true,
  })
}

const isMock = !process.env.R2_ACCESS_KEY_ID

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

// Downloads a file from R2 and returns it as a Buffer.
export async function downloadFromR2(key: string): Promise<Buffer> {
  if (isMock) {
    console.log(`[R2 mock] download skipped — key: ${key}`)
    return Buffer.alloc(0)
  }

  const client = getClient()
  try {
    const response = await client.send(
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
    )
    if (!response.Body) throw new Error(`Empty R2 body for key: ${key}`)
    const bytes = await response.Body.transformToByteArray()
    return Buffer.from(bytes)
  } catch (err) {
    if (err instanceof NoSuchKey) throw new Error(`R2 key not found: ${key}`)
    throw err
  }
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

// Google Drive service account client.
// Uses googleapis — service account credentials from GOOGLE_SERVICE_ACCOUNT_JSON.
// All calls are server-side only.

import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/drive']

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set')

  const credentials = JSON.parse(raw) as Record<string, string>
  return new google.auth.GoogleAuth({ credentials, scopes: SCOPES })
}

function getDrive() {
  const auth = getAuth()
  return google.drive({ version: 'v3', auth })
}

// ── Folder operations ─────────────────────────────────────────────────────────

// Creates a subfolder inside a parent. Returns the new folder ID.
export async function createFolder(name: string, parentId: string): Promise<string> {
  const drive = getDrive()
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })
  const id = res.data.id
  if (!id) throw new Error(`Failed to create Google Drive folder: ${name}`)
  return id
}

// Creates the client folder tree: Root / CustomerName / orderId
// Returns the leaf folder ID (the per-order folder).
export async function createClientFolder(
  customerName: string,
  orderId: string
): Promise<string> {
  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  if (!rootId) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not set')

  // Customer-level folder (reuse if already exists for this customer)
  const existing = await findFolder(customerName, rootId)
  const customerFolderId = existing ?? await createFolder(customerName, rootId)

  // Order-level subfolder — always fresh
  const orderFolderId = await createFolder(orderId, customerFolderId)
  return orderFolderId
}

async function findFolder(name: string, parentId: string): Promise<string | null> {
  const drive = getDrive()
  const res = await drive.files.list({
    q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  })
  return res.data.files?.[0]?.id ?? null
}

// ── File upload ───────────────────────────────────────────────────────────────

export interface UploadResult {
  fileId: string
  webViewLink: string
}

// Upload a buffer as a file to a Drive folder. Returns file ID + shareable link.
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderId: string
): Promise<UploadResult> {
  const drive = getDrive()
  const { Readable } = await import('stream')

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id,webViewLink',
  })

  const fileId = res.data.id
  const webViewLink = res.data.webViewLink
  if (!fileId || !webViewLink) throw new Error(`Drive upload failed for ${filename}`)

  return { fileId, webViewLink }
}

// Make a file readable by anyone with the link (for customer-facing docs).
export async function makePublicReadable(fileId: string): Promise<void> {
  const drive = getDrive()
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  })
}

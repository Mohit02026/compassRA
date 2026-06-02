// Google Drive document service.
// createClientFolder() — called once when a customer's first order is created.
// uploadFiledDoc() — called when ops uploads a completed document.

import { prisma, setPrismaContext } from '@/lib/prisma'
import { createClientFolder, uploadFile, makePublicReadable } from '@/lib/gdrive'
import { DocumentType } from '@prisma/client'

const isMock = !process.env.GOOGLE_SERVICE_ACCOUNT_JSON

// Create the Drive folder for an order: Root / CustomerName / orderId
// Stores nothing in DB — just returns the folder ID for use in uploads.
export async function ensureOrderFolder(
  customerName: string,
  orderId: string
): Promise<string> {
  if (isMock) {
    console.log(`[Drive mock] ensureOrderFolder skipped — orderId: ${orderId}`)
    return `mock-folder-${orderId}`
  }
  return createClientFolder(customerName, orderId)
}

export interface UploadDocToOrderInput {
  orderId: string
  tenantId: string
  actorId: string
  type: DocumentType
  filename: string
  buffer: Buffer
  mimeType: string
  customerName: string
  // Pre-computed folder ID if already known; otherwise fetched from order data
  folderId?: string
}

// Upload a filed document to Google Drive and record it in the DB.
// Used for customer-visible docs: ARTICLES_OF_ORG, EIN_CONFIRMATION, CERTIFICATE, etc.
export async function uploadDocToOrder(input: UploadDocToOrderInput): Promise<{ driveFileId: string }> {
  await setPrismaContext(input.tenantId)

  if (isMock) {
    console.log(`[Drive mock] upload skipped — ${input.filename}`)
    await prisma.document.create({
      data: {
        orderId: input.orderId,
        tenantId: input.tenantId,
        type: input.type,
        driveFileId: `mock-drive-${input.filename}`,
        filename: input.filename,
      },
    })
    return { driveFileId: `mock-drive-${input.filename}` }
  }

  // Resolve folder — reuse provided or create fresh
  const folderId = input.folderId ?? await createClientFolder(input.customerName, input.orderId)

  const { fileId } = await uploadFile(input.buffer, input.filename, input.mimeType, folderId)

  // Make customer-facing docs publicly readable via link
  const CUSTOMER_VISIBLE: DocumentType[] = [
    DocumentType.ARTICLES_OF_ORG,
    DocumentType.OPERATING_AGREEMENT,
    DocumentType.EIN_CONFIRMATION,
    DocumentType.FILING_RECEIPT,
    DocumentType.CERTIFICATE,
    DocumentType.PAYMENT_INVOICE,
  ]

  if (CUSTOMER_VISIBLE.includes(input.type)) {
    await makePublicReadable(fileId)
  }

  await prisma.document.create({
    data: {
      orderId: input.orderId,
      tenantId: input.tenantId,
      type: input.type,
      driveFileId: fileId,
      filename: input.filename,
    },
  })

  return { driveFileId: fileId }
}

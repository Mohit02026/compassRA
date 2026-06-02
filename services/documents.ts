import { prisma, setPrismaContext } from '@/lib/prisma'
import { DocumentType, OrderStatus } from '@prisma/client'
import { uploadToR2, getPresignedUrl } from '@/lib/r2'
import { updateStatus } from '@/services/orders'
import { sendEinCompleted } from '@/services/email'

interface UploadDocumentInput {
  orderId: string
  tenantId: string
  actorId: string
  type: DocumentType
  filename: string
  buffer: Buffer
  contentType: string
}

export async function uploadDocument(input: UploadDocumentInput) {
  await setPrismaContext(input.tenantId)

  const r2Key = `${input.tenantId}/orders/${input.orderId}/${input.type.toLowerCase().replace(/_/g, '-')}/${input.filename}`

  await uploadToR2(r2Key, input.buffer, input.contentType)

  const doc = await prisma.document.create({
    data: {
      orderId: input.orderId,
      tenantId: input.tenantId,
      type: input.type,
      r2Key,
      filename: input.filename,
    },
  })

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, tenantId: input.tenantId },
    include: {
      customer: { include: { user: true } },
      orderData: { where: { key: 'businessName' } },
    },
  })

  // Uploading a CERTIFICATE automatically completes the order
  if (input.type === DocumentType.CERTIFICATE && order && order.status === OrderStatus.FILED) {
    await updateStatus({
      orderId: input.orderId,
      tenantId: input.tenantId,
      actorId: input.actorId,
      toStatus: OrderStatus.COMPLETED,
    })
  }

  // Uploading EIN_CONFIRMATION notifies the customer
  if (input.type === DocumentType.EIN_CONFIRMATION && order) {
    const businessName = order.orderData[0]?.value ?? 'your LLC'
    void sendEinCompleted({
      to: order.customer.user.email,
      customerName: order.customer.name,
      businessName,
    })
  }

  return doc
}

export async function getDownloadUrl(documentId: string, tenantId: string): Promise<string> {
  await setPrismaContext(tenantId)

  const doc = await prisma.document.findFirst({
    where: { id: documentId, tenantId, deletedAt: null },
  })

  if (!doc) throw new Error('Document not found')
  if (!doc.r2Key) throw new Error('Document has no R2 key (may be a Drive-only doc)')

  return getPresignedUrl(doc.r2Key)
}

export async function listDocuments(tenantId: string, orderId?: string) {
  await setPrismaContext(tenantId)

  return prisma.document.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(orderId ? { orderId } : {}),
    },
    include: {
      order: { include: { customer: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { Role } from '@prisma/client'

interface CreateCustomerInput {
  tenantId: string
  name: string
  email: string
  phone?: string
}

interface CreateCustomerResult {
  customerId: string
  userId: string
  tempPassword: string
}

// Generates a readable temp password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

export async function createCustomerWithUser(
  input: CreateCustomerInput
): Promise<CreateCustomerResult> {
  const { tenantId, name, email, phone } = input

  const tempPassword = generateTempPassword()
  const passwordHash = await hash(tempPassword, 12)

  // Check if user already exists (re-order for existing customer)
  const existingUser = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { customer: true },
  })

  if (existingUser) {
    if (!existingUser.customer) {
      throw new Error(`User ${email} exists but has no customer record`)
    }
    return {
      customerId: existingUser.customer.id,
      userId: existingUser.id,
      tempPassword, // won't be used — existing user keeps their password
    }
  }

  // Create user + customer in one transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        role: Role.CUSTOMER,
        mustChangePwd: true,
      },
    })

    const customer = await tx.customer.create({
      data: {
        tenantId,
        userId: user.id,
        name,
        email,
        phone,
      },
    })

    return { user, customer }
  })

  return {
    customerId: result.customer.id,
    userId: result.user.id,
    tempPassword,
  }
}

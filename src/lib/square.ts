import { Client, Environment, ApiError } from 'squareup'

// Initialize Square client
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
})

const { paymentsApi, customersApi, subscriptionsApi, refundsApi } = client

// Types for Square integration
export interface SquarePayment {
  id: string
  amount: number
  currency: string
  status: string
  sourceType: string
  cardDetails?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentRequest {
  amount: number // Amount in pence
  currency?: string
  sourceId: string // Payment source (card nonce)
  idempotencyKey: string
  note?: string
  referenceId?: string
  buyerEmailAddress?: string
}

export interface SquareCustomer {
  id: string
  givenName?: string
  familyName?: string
  emailAddress?: string
  phoneNumber?: string
  createdAt: string
  updatedAt: string
}

// Payment processing functions
export async function createPayment(paymentRequest: CreatePaymentRequest): Promise<SquarePayment> {
  try {
    const requestBody = {
      sourceId: paymentRequest.sourceId,
      idempotencyKey: paymentRequest.idempotencyKey,
      amountMoney: {
        amount: BigInt(paymentRequest.amount),
        currency: paymentRequest.currency || 'GBP',
      },
      note: paymentRequest.note,
      referenceId: paymentRequest.referenceId,
      buyerEmailAddress: paymentRequest.buyerEmailAddress,
    }

    const response = await paymentsApi.createPayment(requestBody)
    
    if (response.result.payment) {
      const payment = response.result.payment
      return {
        id: payment.id!,
        amount: Number(payment.amountMoney?.amount || 0),
        currency: payment.amountMoney?.currency || 'GBP',
        status: payment.status || 'UNKNOWN',
        sourceType: payment.sourceType || 'UNKNOWN',
        cardDetails: payment.cardDetails ? {
          brand: payment.cardDetails.card?.cardBrand || 'UNKNOWN',
          last4: payment.cardDetails.card?.last4 || '',
          expMonth: payment.cardDetails.card?.expMonth || 0,
          expYear: payment.cardDetails.card?.expYear || 0,
        } : undefined,
        createdAt: payment.createdAt || new Date().toISOString(),
        updatedAt: payment.updatedAt || new Date().toISOString(),
      }
    }
    
    throw new Error('Payment creation failed')
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Square API Error:', error.errors)
      throw new Error(`Payment failed: ${error.errors?.[0]?.detail || 'Unknown error'}`)
    }
    throw error
  }
}

export async function getPayment(paymentId: string): Promise<SquarePayment | null> {
  try {
    const response = await paymentsApi.getPayment(paymentId)
    
    if (response.result.payment) {
      const payment = response.result.payment
      return {
        id: payment.id!,
        amount: Number(payment.amountMoney?.amount || 0),
        currency: payment.amountMoney?.currency || 'GBP',
        status: payment.status || 'UNKNOWN',
        sourceType: payment.sourceType || 'UNKNOWN',
        cardDetails: payment.cardDetails ? {
          brand: payment.cardDetails.card?.cardBrand || 'UNKNOWN',
          last4: payment.cardDetails.card?.last4 || '',
          expMonth: payment.cardDetails.card?.expMonth || 0,
          expYear: payment.cardDetails.card?.expYear || 0,
        } : undefined,
        createdAt: payment.createdAt || new Date().toISOString(),
        updatedAt: payment.updatedAt || new Date().toISOString(),
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching payment:', error)
    return null
  }
}

export async function refundPayment(
  paymentId: string, 
  amount: number, 
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    const idempotencyKey = `refund_${paymentId}_${Date.now()}`
    
    const requestBody = {
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'GBP',
      },
      paymentId,
      reason: reason || 'Tournament cancellation',
    }

    const response = await refundsApi.refundPayment(requestBody)
    
    if (response.result.refund) {
      return {
        success: true,
        refundId: response.result.refund.id,
      }
    }
    
    return {
      success: false,
      error: 'Refund creation failed',
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.errors?.[0]?.detail || 'Refund failed',
      }
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    }
  }
}

// Customer management functions
export async function createCustomer(customerData: {
  givenName?: string
  familyName?: string
  emailAddress?: string
  phoneNumber?: string
}): Promise<SquareCustomer | null> {
  try {
    const response = await customersApi.createCustomer({
      givenName: customerData.givenName,
      familyName: customerData.familyName,
      emailAddress: customerData.emailAddress,
      phoneNumber: customerData.phoneNumber,
    })
    
    if (response.result.customer) {
      const customer = response.result.customer
      return {
        id: customer.id!,
        givenName: customer.givenName,
        familyName: customer.familyName,
        emailAddress: customer.emailAddress,
        phoneNumber: customer.phoneNumber,
        createdAt: customer.createdAt || new Date().toISOString(),
        updatedAt: customer.updatedAt || new Date().toISOString(),
      }
    }
    
    return null
  } catch (error) {
    console.error('Error creating customer:', error)
    return null
  }
}

export async function getCustomer(customerId: string): Promise<SquareCustomer | null> {
  try {
    const response = await customersApi.retrieveCustomer(customerId)
    
    if (response.result.customer) {
      const customer = response.result.customer
      return {
        id: customer.id!,
        givenName: customer.givenName,
        familyName: customer.familyName,
        emailAddress: customer.emailAddress,
        phoneNumber: customer.phoneNumber,
        createdAt: customer.createdAt || new Date().toISOString(),
        updatedAt: customer.updatedAt || new Date().toISOString(),
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching customer:', error)
    return null
  }
}

// Subscription management for monthly memberships
export async function createSubscription(customerId: string, planId: string): Promise<string | null> {
  try {
    const idempotencyKey = `subscription_${customerId}_${Date.now()}`
    
    const requestBody = {
      idempotencyKey,
      locationId: process.env.SQUARE_LOCATION_ID!,
      customerId,
      planId,
    }

    const response = await subscriptionsApi.createSubscription(requestBody)
    
    return response.result.subscription?.id || null
  } catch (error) {
    console.error('Error creating subscription:', error)
    return null
  }
}

// Webhook verification
export function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSignatureKey: string
): boolean {
  const crypto = require('crypto')
  
  const hmac = crypto.createHmac('sha256', webhookSignatureKey)
  hmac.update(body)
  const expectedSignature = hmac.digest('base64')
  
  return signature === expectedSignature
}

// Utility functions
export function formatAmount(amountInPence: number): string {
  return `£${(amountInPence / 100).toFixed(2)}`
}

export function parseAmount(amountString: string): number {
  // Convert "£25.00" to 2500 pence
  const cleanAmount = amountString.replace(/[£,]/g, '')
  return Math.round(parseFloat(cleanAmount) * 100)
}

export function getPaymentStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'text-green-600'
    case 'PENDING':
      return 'text-yellow-600'
    case 'FAILED':
    case 'CANCELED':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getPaymentStatusText(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'Completed'
    case 'PENDING':
      return 'Pending'
    case 'FAILED':
      return 'Failed'
    case 'CANCELED':
      return 'Cancelled'
    default:
      return status
  }
}

// Error handling
export class SquarePaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SquarePaymentError'
  }
}

export default {
  createPayment,
  getPayment,
  refundPayment,
  createCustomer,
  getCustomer,
  createSubscription,
  verifyWebhookSignature,
  formatAmount,
  parseAmount,
  getPaymentStatusColor,
  getPaymentStatusText,
}


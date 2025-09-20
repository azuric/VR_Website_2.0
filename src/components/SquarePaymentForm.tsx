'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Lock, AlertCircle } from 'lucide-react'

interface SquarePaymentFormProps {
  amount: number // Amount in pence
  description: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
  onCancel?: () => void
}

declare global {
  interface Window {
    Square: any
  }
}

export default function SquarePaymentForm({
  amount,
  description,
  onSuccess,
  onError,
  onCancel
}: SquarePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [squareLoaded, setSquareLoaded] = useState(false)
  const [cardButton, setCardButton] = useState<any>(null)
  const [card, setCard] = useState<any>(null)

  useEffect(() => {
    // Load Square Web Payments SDK
    const script = document.createElement('script')
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js' // Use production URL for live
    script.async = true
    script.onload = initializeSquare
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const initializeSquare = async () => {
    if (!window.Square) {
      onError('Square SDK failed to load')
      return
    }

    try {
      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      )

      const cardOptions = {
        style: {
          input: {
            color: '#ffffff',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '24px',
            placeholderColor: '#9ca3af',
          },
          '.input-container': {
            backgroundColor: '#1f2937',
            borderColor: '#374151',
            borderRadius: '8px',
            borderWidth: '1px',
          },
          '.input-container.is-focus': {
            borderColor: '#06b6d4',
          },
          '.input-container.is-error': {
            borderColor: '#ef4444',
          },
          '.message-text': {
            color: '#ef4444',
          },
          '.message-icon': {
            color: '#ef4444',
          },
        }
      }

      const cardInstance = await payments.card(cardOptions)
      await cardInstance.attach('#card-container')
      setCard(cardInstance)

      const cardButtonInstance = payments.cardButton({
        style: {
          backgroundColor: '#06b6d4',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '8px',
          padding: '12px 24px',
        }
      })
      await cardButtonInstance.attach('#card-button-container')
      setCardButton(cardButtonInstance)

      setSquareLoaded(true)
    } catch (error) {
      console.error('Square initialization error:', error)
      onError('Failed to initialize payment form')
    }
  }

  const handlePayment = async () => {
    if (!card || !cardButton) {
      onError('Payment form not ready')
      return
    }

    setIsLoading(true)

    try {
      const tokenResult = await card.tokenize()
      
      if (tokenResult.status === 'OK') {
        // Send payment request to your API
        const response = await fetch('/api/payments/square', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            amount,
            description,
            idempotencyKey: `payment_${Date.now()}_${Math.random()}`,
          }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          onSuccess(result.paymentId)
        } else {
          onError(result.error || 'Payment failed')
        }
      } else {
        onError(tokenResult.errors?.[0]?.message || 'Card validation failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      onError('Payment processing failed')
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amountInPence: number) => {
    return `£${(amountInPence / 100).toFixed(2)}`
  }

  if (!squareLoaded) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <span className="ml-3 text-gray-300">Loading payment form...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      {/* Payment Summary */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Payment Details</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">{description}</span>
            <span className="text-white font-semibold">{formatAmount(amount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Processing Fee</span>
            <span className="text-gray-400">Included</span>
          </div>
          <div className="border-t border-gray-600 mt-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Total</span>
              <span className="text-cyan-400 font-bold text-lg">{formatAmount(amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center mb-4 text-sm text-gray-400">
        <Lock className="w-4 h-4 mr-2" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Card Form */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Card Information
        </label>
        <div id="card-container" className="mb-4">
          {/* Square card form will be inserted here */}
        </div>
      </div>

      {/* Payment Button */}
      <div className="space-y-3">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay {formatAmount(amount)}
            </>
          )}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Alternative Payment Button (Square's built-in) */}
      <div className="mt-4">
        <div className="text-center text-gray-400 text-sm mb-3">Or</div>
        <div id="card-button-container">
          {/* Square card button will be inserted here */}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">Payment Information</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Payments are processed securely by Square</li>
              <li>• You will receive a confirmation email</li>
              <li>• Refunds are available according to our policy</li>
              <li>• Contact support for any payment issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


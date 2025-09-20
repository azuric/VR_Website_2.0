import { NextRequest, NextResponse } from 'next/server'
import { createPayment, SquarePaymentError } from '@/lib/square'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceId, amount, description, idempotencyKey, userId, tournamentId } = body

    // Validate required fields
    if (!sourceId || !amount || !idempotencyKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment information' },
        { status: 400 }
      )
    }

    // Validate amount (must be positive integer in pence)
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Create payment with Square
    const payment = await createPayment({
      sourceId,
      amount,
      currency: 'GBP',
      idempotencyKey,
      note: description,
      referenceId: tournamentId ? `tournament_${tournamentId}` : undefined,
    })

    // Store payment record in database
    const { data: paymentRecord, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        tournament_id: tournamentId,
        square_payment_id: payment.id,
        amount: amount / 100, // Convert pence to pounds for database
        currency: payment.currency,
        status: payment.status.toLowerCase(),
        payment_type: tournamentId ? 'entry_fee' : 'other',
        description,
        metadata: {
          square_payment: payment,
          idempotency_key: idempotencyKey,
        },
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Payment succeeded but database failed - this needs manual reconciliation
      return NextResponse.json(
        { 
          success: true, 
          paymentId: payment.id,
          warning: 'Payment processed but record creation failed'
        },
        { status: 200 }
      )
    }

    // If this is a tournament registration, update the registration status
    if (tournamentId && userId) {
      const { error: registrationError } = await supabase
        .from('tournament_registrations')
        .update({
          payment_status: 'completed',
          payment_id: payment.id,
          payment_amount: amount / 100,
        })
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)

      if (registrationError) {
        console.error('Registration update error:', registrationError)
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      amount: payment.amount,
      status: payment.status,
      recordId: paymentRecord.id,
    })

  } catch (error) {
    console.error('Payment processing error:', error)

    if (error instanceof SquarePaymentError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

// Handle payment status updates and webhooks
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, status } = body

    if (!paymentId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing payment ID or status' },
        { status: 400 }
      )
    }

    // Update payment status in database
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        status: status.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('square_payment_id', paymentId)
      .select()
      .single()

    if (error) {
      console.error('Payment update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: data,
    })

  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { success: false, error: 'Payment update failed' },
      { status: 500 }
    )
  }
}


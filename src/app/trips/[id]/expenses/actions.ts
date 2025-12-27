'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(tripId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const payerId = formData.get('payer_id') as string
  const date = formData.get('date') as string
  const splitType = 'equal_all' // Simplified for MVP first iteration, hardcoded or form field

  // Fetch members to calculate splits (if equal)
  const { data: members } = await supabase
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', tripId)

  if (!members || members.length === 0) {
      return { error: 'No members to split with' }
  }

  const splitAmount = amount / members.length
  
  const splits = members.map(m => ({
      user_id: m.user_id,
      share_amount: splitAmount
  }))

  const { error } = await supabase.rpc('add_expense', {
    p_trip_id: tripId,
    p_payer_id: payerId,
    p_amount: amount,
    p_currency: 'USD', // Default
    p_description: description,
    p_split_type: splitType,
    p_splits: splits,
    p_date: date,
    p_receipt_url: null 
  })

  if (error) {
    console.error('Error adding expense:', error)
    redirect(`/trips/${tripId}/expenses/new?error=Failed to add expense`)
  }

  revalidatePath(`/trips/${tripId}`)
  redirect(`/trips/${tripId}`)
}

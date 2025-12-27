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
  const splitType = (formData.get('split_type') as string) || 'equal_all'
  const selectedUserIds = new Set(formData.getAll('selected_users') as string[])

  // Fetch members to verify and calculate splits
  const { data: members } = await supabase
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', tripId)

  if (!members || members.length === 0) {
      return { error: 'No members to split with' }
  }

  let splitMembers = members
  if (splitType === 'equal_selected') {
      splitMembers = members.filter(m => selectedUserIds.has(m.user_id))
      // Fallback if none selected (should be prevented by UI but good for safety)
      if (splitMembers.length === 0) {
          splitMembers = members
      }
  }

  const splitAmount = amount / splitMembers.length
  
  const splits = splitMembers.map(m => ({
      user_id: m.user_id,
      share_amount: splitAmount
  }))

  // Fetch trip currency
  const { data: trip } = await supabase
    .from('trips')
    .select('currency')
    .eq('id', tripId)
    .single()

  const { error } = await supabase.rpc('add_expense', {
    p_trip_id: tripId,
    p_payer_id: payerId,
    p_amount: amount,
    p_currency: trip?.currency,
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

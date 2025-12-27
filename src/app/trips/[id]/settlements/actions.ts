'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordSettlement(tripId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const toUserId = formData.get('to_user_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  
  if (!toUserId || !amount || amount <= 0) {
      redirect(`/trips/${tripId}/settlements/new?error=Invalid input`)
  }

  const { error } = await supabase
    .from('settlements')
    .insert({
      trip_id: tripId,
      from_user_id: user.id,
      to_user_id: toUserId,
      amount: amount,
      date: new Date().toISOString(),
      status: 'completed'
    })

  if (error) {
    console.error('Error recording settlement:', error)
    redirect(`/trips/${tripId}/settlements/new?error=Failed to record settlement`)
  }

  revalidatePath(`/trips/${tripId}/settlements`)
  redirect(`/trips/${tripId}/settlements`)
}

'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinTrip(formData: FormData) {
  const code = formData.get('code') as string
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/join')

  // Find trip
  const { data: trip, error } = await supabase
    .from('trips')
    .select('id')
    .eq('invite_code', code)
    .single()

  if (error || !trip) {
    // Return error state ideally, for now just redirect or log
    console.error('Join error:', error)
    redirect('/join?error=Invalid invite code')
  }

  // Add member
  const { error: memberError } = await supabase
    .from('trip_members')
    .insert({
      trip_id: trip.id,
      user_id: user.id,
      role: 'member',
      status: 'accepted',
      joined_at: new Date().toISOString(),
      invited_by: null // Joined via code
    })

  if (memberError) {
      // Check if already member
      if (memberError.code === '23505') { // Unique violation
          redirect(`/trips/${trip.id}`)
      }
      console.error('Member add error:', memberError)
      redirect('/join?error=Failed to join trip')
  }

  revalidatePath('/dashboard')
  redirect(`/trips/${trip.id}`)
}

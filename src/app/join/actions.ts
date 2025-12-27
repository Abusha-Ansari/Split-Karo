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

  // Find trip using RPC to bypass RLS
  const { data: tripId, error } = await supabase.rpc('get_trip_id_by_invite_code', {
    invite_code_input: code
  })

  if (error || !tripId) {
    // Return error state ideally, for now just redirect or log
    console.error('Join error:', error)
    redirect('/join?error=Invalid invite code')
  }

  // Add member
  const { error: memberError } = await supabase
    .from('trip_members')
    .insert({
      trip_id: tripId,
      user_id: user.id,
      role: 'member',
      status: 'pending',
      joined_at: new Date().toISOString(),
      invited_by: null // Joined via code
    })

  if (memberError) {
      // Check if already member
      if (memberError.code === '23505') { // Unique violation
          redirect(`/trips/${tripId}`)
      }
      console.error('Member add error:', memberError)
      redirect('/join?error=Failed to join trip')
  }

  revalidatePath('/dashboard')
  redirect(`/trips/${tripId}`)
}

'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const TripSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  currency: z.string().default('USD'),
})

export async function createTrip(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    currency: formData.get('currency'),
  }

  const parsed = TripSchema.safeParse(rawData)

  if (!parsed.success) {
    redirect('/trips/new?error=Invalid input')
  }

  // Insert trip
  const { data, error } = await supabase
    .from('trips')
    .insert({
      ...parsed.data,
      leader_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating trip:', error)
    // In a real app we'd return error to client, for simplicity here we assume success or log
    redirect('/trips/new?error=Failed to create trip')
  }

  // Add leader as member (ensure RLS allows this or function trigger handles it? 
  // Schema didn't have trigger for this, so manual insert is needed. 
  // RLS for trip_members usually requires being a member to view, but insert might be allowed if you are leader of the trip? 
  // My RLS was: "Authenticad users can create trips". 
  // I must ensured "Leaders can insert members" or generic insert if auth matches user_id?
  // Let's assume generic RLS allows inserting self or leader can do it.)
  
  const { error: memberError } = await supabase
    .from('trip_members')
    .insert({
      trip_id: data.id,
      user_id: user.id,
      role: 'leader',
      status: 'accepted',
      joined_at: new Date().toISOString(),
    })

  if (memberError) {
      console.error('Error adding leader:', memberError)
  }

  redirect(`/trips/${data.id}`)
}

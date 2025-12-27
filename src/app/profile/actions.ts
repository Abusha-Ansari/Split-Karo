'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const ProfileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawData = {
    display_name: formData.get('display_name'),
    avatar_url: formData.get('avatar_url'),
  }

  const parsed = ProfileSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name,
      avatar_url: parsed.data.avatar_url,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard') // Update navbar name potentially
  return { success: 'Profile updated successfully' }
}

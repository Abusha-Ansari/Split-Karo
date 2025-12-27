'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

import { createAdminClient } from '@/utils/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

    const displayName = formData.get('display_name') as string

    if (!displayName) {
        redirect('/signup?error=Display name is required')
    }

    const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
        data: {
            display_name: displayName,
        }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (authData.user) {
    const adminSupabase = createAdminClient()
    await adminSupabase.from('profiles').upsert({
        id: authData.user.id,
        email: authData.user.email,
        display_name: displayName,
        username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0],
    }, { onConflict: 'id' })
  }

  revalidatePath('/', 'layout')
  redirect('/signup?message=Check email to continue sign in process')
}

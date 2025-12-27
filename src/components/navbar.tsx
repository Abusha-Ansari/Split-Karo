import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import NavbarClient from './navbar-client'

export default async function Navbar() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const signOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/')
    }

    return <NavbarClient user={user} signOut={signOut} />
}

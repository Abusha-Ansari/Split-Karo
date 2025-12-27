import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Navbar() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const signOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    return (
        <nav className="glass sticky top-0 z-50 border-b-0">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                <Link href="/" className="font-bold text-xl text-white drop-shadow-sm flex items-center gap-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-brand-100">
                        ExpenseTracker
                    </span>
                </Link>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-sm text-brand-100 font-medium hidden sm:block">{user.email}</span>
                            <Link href="/dashboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <form action={signOut}>
                                <button className="text-sm font-medium text-red-300 hover:text-red-200 hover:underline transition-colors">
                                    Sign out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                                Login
                            </Link>
                            <Link href="/signup" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/10">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

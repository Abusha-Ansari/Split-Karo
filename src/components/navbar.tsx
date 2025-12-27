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
        <nav className="border-b bg-white">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                <Link href="/" className="font-bold text-xl">
                    ExpenseTracker
                </Link>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-sm text-gray-600">{user.email}</span>
                            <Link href="/dashboard" className="text-sm font-medium hover:underline">
                                Dashboard
                            </Link>
                            <form action={signOut}>
                                <button className="text-sm font-medium text-red-600 hover:underline">
                                    Sign out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:underline">
                                Login
                            </Link>
                            <Link href="/signup" className="text-sm font-medium hover:underline">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

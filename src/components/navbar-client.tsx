'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function NavbarClient({ user, signOut }: { user: any, signOut: () => Promise<void> }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <nav className="glass sticky top-0 z-50 border-b-0">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                <Link href="/" className="font-bold text-xl text-white drop-shadow-sm flex items-center gap-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-brand-100">
                        ExpenseTracker
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-brand-100 hover:text-white transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-white/10 group-hover:border-brand-400 overflow-hidden">
                                    {(user.user_metadata?.avatar_url) ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        (user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                                    )}
                                </div>
                                <span className="hidden lg:block">
                                    {user.user_metadata?.display_name || user.email}
                                </span>
                            </Link>
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
                            <Link href="/login" className="px-5 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors">
                                Login
                            </Link>
                            <Link href="/signup" className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors shadow-lg shadow-brand-500/20">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-t border-white/10 p-4 space-y-4 animate-in slide-in-from-top-2">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white border border-white/10 overflow-hidden">
                                    {(user.user_metadata?.avatar_url) ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        (user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">{user.user_metadata?.display_name || user.email}</span>
                                    <Link href="/profile" className="text-xs text-brand-200 hover:text-white">View Profile</Link>
                                </div>
                            </div>
                            <Link
                                href="/dashboard"
                                className="block text-white/80 hover:text-white font-medium py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <form action={signOut}>
                                <button className="w-full text-left text-red-300 hover:text-red-200 font-medium py-2">
                                    Sign out
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                className="block w-full text-center py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="block w-full text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors shadow-lg shadow-brand-500/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav >
    )
}

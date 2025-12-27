'use client'

import { useState } from 'react'
import { searchUsers, inviteUser } from '@/app/trips/[id]/actions'

export default function InviteModal({ tripId }: { tripId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [inviting, setInviting] = useState<string | null>(null)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        setSearching(true)
        const users = await searchUsers(query)
        setResults(users)
        setSearching(false)
    }

    const handleInvite = async (userId: string) => {
        setInviting(userId)
        await inviteUser(tripId, userId)
        setInviting(null)
        // Optionally close or show success
    }

    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-brand-100 rounded-lg text-sm border border-dashed border-white/20 flex items-center justify-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Invite via Search
        </button>
    )

    return (
        <div className="mt-4 bg-black/40 p-4 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white">Invite User</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Search by email or name..."
                    className="glass-input flex-1 text-sm py-1"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" disabled={searching} className="btn-secondary text-sm py-1 px-3">
                    {searching ? '...' : 'Go'}
                </button>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {results.length === 0 && !searching && query && <p className="text-xs text-slate-400 text-center">No users found.</p>}

                {results.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                                {(user.display_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-white">{user.display_name || 'User'}</span>
                                <span className="text-[10px] text-slate-400">{user.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleInvite(user.id)}
                            disabled={inviting === user.id}
                            className="text-xs btn-primary py-1 px-2"
                        >
                            {inviting === user.id ? 'Inviting...' : 'Invite'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

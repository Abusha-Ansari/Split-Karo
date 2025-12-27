'use client'

import { approveMember, rejectMember } from '@/app/trips/[id]/actions'
import { useState } from 'react'

export default function MemberManagement({
    tripId,
    members,
    isAdmin
}: {
    tripId: string,
    members: any[],
    isAdmin: boolean
}) {
    const activeMembers = members.filter(m => m.status === 'accepted' || m.status === 'invited') // Invited users show in list? Maybe.
    const pendingMembers = members.filter(m => m.status === 'pending')

    const [processing, setProcessing] = useState<string | null>(null)

    const handleAction = async (memberId: string, action: 'approve' | 'reject') => {
        setProcessing(memberId)
        if (action === 'approve') await approveMember(tripId, memberId)
        else await rejectMember(tripId, memberId)
        setProcessing(null)
    }

    return (
        <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-4">Members</h2>

            {/* Pending Requests (Admin Only) */}
            {isAdmin && pendingMembers.length > 0 && (
                <div className="mb-6 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                    <h3 className="text-xs font-bold text-brand-300 uppercase tracking-wider mb-3">Pending Requests</h3>
                    <ul className="space-y-3">
                        {pendingMembers.map((m) => (
                            <li key={m.user_id} className="flex flex-col gap-2 p-2 bg-black/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                        {(m.profiles?.display_name || m.profiles?.email || 'U')[0].toUpperCase()}
                                    </div>
                                    <span className="font-medium text-slate-200 text-sm">
                                        {m.profiles?.display_name || m.profiles?.email || 'Unknown User'}
                                    </span>
                                </div>
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => handleAction(m.user_id, 'approve')}
                                        disabled={!!processing}
                                        className="flex-1 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded border border-emerald-500/30"
                                    >
                                        {processing === m.user_id ? '...' : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => handleAction(m.user_id, 'reject')}
                                        disabled={!!processing}
                                        className="flex-1 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded border border-rose-500/30"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Active Members */}
            <ul className="space-y-3">
                {activeMembers.map((member) => (
                    <li key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-white/10 relative">
                                {(member.profiles?.display_name || member.profiles?.email || 'U')[0].toUpperCase()}
                                {member.status === 'invited' && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-black" title="Invited"></span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-200 text-sm">
                                    {member.profiles?.display_name || member.profiles?.email || 'Unknown User'}
                                </span>
                                {member.status === 'invited' && <span className="text-[10px] text-amber-400 italic">Invited</span>}
                            </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${member.role === 'leader' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/20' : 'bg-slate-700/50 text-slate-400'}`}>
                            {member.role}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

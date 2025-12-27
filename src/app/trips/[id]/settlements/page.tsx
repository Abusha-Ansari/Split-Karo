import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SettlementsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: trip } = await supabase
        .from('trips')
        .select('name, currency')
        .eq('id', id)
        .single()

    if (!trip) return <div>Trip not found</div>

    const { data: balances, error } = await supabase
        .rpc('get_net_balances', { p_trip_id: id })

    if (error) {
        console.error(error)
        return <div>Error calculating balances</div>
    }

    // Fetch profiles to map user_ids to names
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', (balances || []).map((b: any) => b.user_id))

    const profileMap = new Map()
    profiles?.forEach((p: any) => profileMap.set(p.id, p.display_name || p.email))

    return (
        <div className="container mx-auto p-4 py-8">
            <Link href={`/trips/${id}`} className="text-brand-200 hover:text-white mb-6 inline-flex items-center gap-1 hover:underline">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Trip
            </Link>

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white drop-shadow-sm">Settlements & Balances</h1>
                <Link href={`/trips/${id}/settlements/new`} className="btn-primary">
                    Record Payment
                </Link>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-200 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-200 uppercase tracking-wider">Net Balance</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-200 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {balances?.length > 0 ? (
                                balances.map((b: any) => {
                                    const net = parseFloat(b.net_balance)
                                    return (
                                        <tr key={b.user_id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-xs font-bold text-white border border-white/10 group-hover:border-brand-500/30 transition-colors">
                                                        {(profileMap.get(b.user_id)?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-white">
                                                        {profileMap.get(b.user_id) || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {net >= 0 ? '+' : ''}{trip.currency} {Math.abs(net).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${net > 0 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                                                        net < 0 ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                                                            'bg-slate-700/30 text-slate-400'
                                                    }`}>
                                                    {net > 0 ? 'Gets back' : net < 0 ? 'Owes' : 'Settled'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                                        No balances yet. Add some expenses!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 glass-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-dashed border-brand-500/20 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-500/10 rounded-xl text-brand-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Suggested Settlements</h2>
                        <p className="text-slate-300/80 text-sm leading-relaxed">
                            Our algorithm will automatically calculate the most efficient way to settle debts between everyone.
                            <span className="block mt-2 italic text-brand-200/60 text-xs">feature coming soon...</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

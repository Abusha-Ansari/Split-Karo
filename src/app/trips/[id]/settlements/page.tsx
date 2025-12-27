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
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-100 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-100 uppercase tracking-wider">Net Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-100 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {balances?.map((b: any) => {
                            const net = parseFloat(b.net_balance)
                            return (
                                <tr key={b.user_id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {profileMap.get(b.user_id) || 'Unknown'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {net >= 0 ? '+' : ''}{trip.currency} {net.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {net > 0 ? 'Gets back' : net < 0 ? 'Owes' : 'Settled'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 glass-card bg-white/5 border-dashed border-white/20">
                <h2 className="text-xl font-bold text-white mb-2">Suggested Settlements</h2>
                <p className="text-slate-400 italic">Advanced optimization coming soon. Please settle based on net balances above.</p>
            </div>
        </div>
    )
}

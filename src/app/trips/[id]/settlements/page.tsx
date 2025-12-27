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
        <div className="container mx-auto p-4">
            <Link href={`/trips/${id}`} className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Trip</Link>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Settlements & Balances</h1>
                <Link href={`/trips/${id}/settlements/new`} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Record Payment
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {balances?.map((b: any) => {
                            const net = parseFloat(b.net_balance)
                            return (
                                <tr key={b.user_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {profileMap.get(b.user_id) || 'Unknown'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {net >= 0 ? '+' : ''}{trip.currency} {net.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {net > 0 ? 'Gets back' : net < 0 ? 'Owes' : 'Settled'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Suggested Settlements</h2>
                <p className="text-gray-500 italic">Advanced algorithm not implemented in MVP. Check net balances above.</p>
                {/* Logic to suggest A pays B could go here */}
            </div>
        </div>
    )
}

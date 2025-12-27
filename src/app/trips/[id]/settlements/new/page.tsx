import { createClient } from '@/utils/supabase/server'
import { recordSettlement } from '../actions'
import { redirect } from 'next/navigation'

export default async function RecordSettlementPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch members to pay TO
    const { data: members } = await supabase
        .from('trip_members')
        .select('user_id, profiles:profiles!trip_members_user_id_fkey(display_name, email)')
        .eq('trip_id', id)
        .neq('user_id', user.id) // Cannot pay yourself

    const recordSettlementWithId = recordSettlement.bind(null, id)

    return (
        <div className="container mx-auto p-4 py-12">
            <div className="max-w-md mx-auto glass-card">
                <h1 className="text-2xl font-bold mb-6 text-white text-center">Record Payment</h1>
                <form action={recordSettlementWithId as any} className="space-y-6">
                    <div>
                        <label htmlFor="to_user_id" className="block text-sm font-medium text-slate-200 mb-1">Paid To</label>
                        <div className="relative">
                            <select
                                name="to_user_id"
                                id="to_user_id"
                                required
                                className="glass-input w-full appearance-none pr-10 cursor-pointer text-lg"
                            >
                                {members?.map((m: any) => (
                                    <option key={m.user_id} className="bg-slate-900" value={m.user_id}>
                                        {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-200 mb-1">Amount</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="text-gray-400 font-bold">$</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                id="amount"
                                required
                                className="glass-input w-full pl-8 text-lg font-mono font-medium"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-xl shadow-emerald-500/20">
                        Record Payment
                    </button>
                    <div className="text-center mt-4">
                        <a href={`/trips/${id}/settlements`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    )
}

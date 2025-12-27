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
                <form action={recordSettlementWithId as any} className="space-y-4">
                    <div>
                        <label htmlFor="to_user_id" className="block text-sm font-medium text-slate-200">Paid To</label>
                        <select name="to_user_id" id="to_user_id" required className="glass-input mt-1 w-full text-slate-900 appearance-none bg-white/50">
                            {members?.map((m: any) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-200">Amount</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input type="number" step="0.01" name="amount" id="amount" required className="glass-input w-full text-slate-900 pl-7" placeholder="0.00" />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">
                        Record Payment
                    </button>
                    <div className="text-center mt-4">
                        <a href={`/trips/${id}/settlements`} className="text-sm text-slate-300 hover:text-white hover:underline">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    )
}

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
        .select('user_id, profiles(display_name, email)')
        .eq('trip_id', id)
        .neq('user_id', user.id) // Cannot pay yourself

    const recordSettlementWithId = recordSettlement.bind(null, id)

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Record Payment</h1>
            <form action={recordSettlementWithId as any} className="space-y-4">
                <div>
                    <label htmlFor="to_user_id" className="block text-sm font-medium text-gray-700">Paid To</label>
                    <select name="to_user_id" id="to_user_id" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        {members?.map((m: any) => (
                            <option key={m.user_id} value={m.user_id}>
                                {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input type="number" step="0.01" name="amount" id="amount" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                </div>

                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Record Payment
                </button>
            </form>
        </div>
    )
}

import { createClient } from '@/utils/supabase/server'
import { addExpense } from '../actions'
import { redirect } from 'next/navigation'

export default async function AddExpensePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch trip members for Payer dropdown
    const { data: members, error } = await supabase
        .from('trip_members')
        .select('user_id, profiles(id, display_name, email)')
        .eq('trip_id', id)

    if (error || !members) {
        return <div>Error loading members</div>
    }

    const addExpenseWithId = addExpense.bind(null, id)

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Add Expense</h1>
            <form action={addExpenseWithId as any} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <input type="text" name="description" id="description" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input type="number" step="0.01" name="amount" id="amount" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" name="date" id="date" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                </div>

                <div>
                    <label htmlFor="payer_id" className="block text-sm font-medium text-gray-700">Paid By</label>
                    <select name="payer_id" id="payer_id" defaultValue={user.id} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        {members.map((m: any) => (
                            <option key={m.user_id} value={m.user_id}>
                                {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Simplified Split Logic: Equal Split for now */}
                <div className="text-sm text-gray-500">
                    Split equally among all members.
                </div>

                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Save Expense
                </button>
            </form>
        </div>
    )
}

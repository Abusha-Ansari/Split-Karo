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
        .select('user_id, profiles:profiles!trip_members_user_id_fkey(id, display_name, email)')
        .eq('trip_id', id)

    if (error || !members) {
        return <div>Error loading members</div>
    }

    const addExpenseWithId = addExpense.bind(null, id)

    return (
        <div className="container mx-auto p-4 py-12">
            <div className="max-w-md mx-auto glass-card">
                <h1 className="text-2xl font-bold mb-6 text-white text-center">Add New Expense</h1>
                <form action={addExpenseWithId as any} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-200">Description</label>
                        <input type="text" name="description" id="description" required className="glass-input mt-1 w-full text-slate-900" placeholder="e.g. Dinner at Mario's" />
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

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-200">Date</label>
                        <input type="date" name="date" id="date" required defaultValue={new Date().toISOString().split('T')[0]} className="glass-input mt-1 w-full text-slate-900" />
                    </div>

                    <div>
                        <label htmlFor="payer_id" className="block text-sm font-medium text-slate-200">Paid By</label>
                        <select name="payer_id" id="payer_id" defaultValue={user.id} className="glass-input mt-1 w-full text-slate-900 appearance-none bg-white/50">
                            {members.map((m: any) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Simplified Split Logic: Equal Split for now */}
                    <div className="text-xs text-brand-100 italic text-center mt-2">
                        Currently splitting equally among all members.
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">
                        Save Expense
                    </button>
                    <div className="text-center mt-4">
                        <a href={`/trips/${id}`} className="text-sm text-slate-300 hover:text-white hover:underline">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ExpenseForm from '@/components/expense-form'

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

    // Fetched members might have profiles as array or single object depending on inference.
    // We map it to ensure it matches the component expectation.
    const formattedMembers = members?.map((m: any) => ({
        user_id: m.user_id,
        profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    })) || []

    // Fetch trip currency
    const { data: trip } = await supabase
        .from('trips')
        .select('currency')
        .eq('id', id)
        .single()

    return (
        <div className="container mx-auto p-4 py-12">
            <div className="max-w-md mx-auto glass-card">
                <h1 className="text-2xl font-bold mb-6 text-white text-center">Add New Expense</h1>
                <ExpenseForm
                    tripId={id}
                    members={formattedMembers}
                    currentUserId={user.id}
                    currency={trip?.currency || 'INR'}
                />
            </div>
        </div>
    )
}

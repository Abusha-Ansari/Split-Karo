import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Trip
    const { data: trip, error } = await supabase
        .from('trips')
        .select('*, trip_members(*, profiles(*))')
        .eq('id', id)
        .single()

    if (error || !trip) {
        return <div className="p-4 text-red-500">Trip not found or access denied</div>
    }

    // Fetch Expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select('*, profiles(display_name, email)')
        .eq('trip_id', id)
        .order('date', { ascending: false })

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{trip.name}</h1>
                    <p className="text-gray-600">{trip.description}</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/trips/${id}/expenses/new`} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Add Expense
                    </Link>
                    <Link href={`/trips/${id}/settlements`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Settle Up
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Expenses</h2>
                    {expenses && expenses.length > 0 ? (
                        <ul className="space-y-4">
                            {expenses.map((expense: any) => (
                                <li key={expense.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
                                    <div>
                                        <p className="font-semibold">{expense.description}</p>
                                        <p className="text-sm text-gray-500">
                                            Paid by {expense.profiles?.display_name || expense.profiles?.email || 'Unknown'} on {new Date(expense.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="font-bold text-lg">
                                        {expense.currency} {expense.amount}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No expenses yet.</p>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Invite Members</h2>
                        <p className="text-sm text-gray-600 mb-2">Share this code or link to invite friends:</p>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">Code:</span>
                                <code className="bg-white px-2 py-1 border rounded font-mono text-lg">{trip.invite_code}</code>
                            </div>
                            <Link href={`/join?code=${trip.invite_code}`} className="text-blue-600 hover:underline text-sm break-all">
                                {`/join?code=${trip.invite_code}`}
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Members</h2>
                        <ul className="space-y-2">
                            {trip.trip_members?.map((member: any) => (
                                <li key={member.id} className="flex items-center justify-between">
                                    <span className="font-medium">
                                        {member.profiles?.display_name || member.profiles?.email || 'Unknown User'}
                                    </span>
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded capitalize">{member.role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

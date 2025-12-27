import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Trips</h1>
                <Link href="/trips/new" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Create Trip
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips?.map((trip) => (
                    <Link key={trip.id} href={`/trips/${trip.id}`} className="block">
                        <div className="border rounded-lg p-4 hover:shadow-lg transition">
                            <h2 className="text-xl font-semibold">{trip.name}</h2>
                            <p className="text-gray-600">{trip.description}</p>
                            <div className="mt-4 flex justify-between text-sm text-gray-500">
                                <span>{trip.currency}</span>
                                <span>{new Date(trip.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {trips?.length === 0 && (
                    <p className="col-span-full text-center text-gray-500">No trips found. Create one to get started!</p>
                )}
            </div>
        </div>
    )
}

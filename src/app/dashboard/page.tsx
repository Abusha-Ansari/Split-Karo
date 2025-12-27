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
        <div className="container mx-auto p-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Your Trips</h1>
                <Link href="/trips/new" className="btn-primary">
                    Create Trip
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips?.map((trip) => (
                    <Link key={trip.id} href={`/trips/${trip.id}`} className="block group">
                        <div className="glass-card h-full flex flex-col justify-between group-hover:bg-white/10">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">{trip.name}</h2>
                                <p className="text-brand-100 line-clamp-2">{trip.description}</p>
                            </div>
                            <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
                                <span className="bg-brand-900/50 text-brand-200 text-xs px-2 py-1 rounded border border-brand-700/50 font-mono">
                                    {trip.currency}
                                </span>
                                <span className="text-sm text-slate-300">
                                    {new Date(trip.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}

                <Link href="/trips/new" className="block group">
                    <div className="glass h-full rounded-2xl border-dashed border-2 border-white/20 p-6 flex flex-col items-center justify-center text-center transition-all hover:border-brand-400 hover:bg-white/5 cursor-pointer min-h-[200px]">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl text-white">+</span>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">Create New Trip</h3>
                        <p className="text-sm text-slate-400">Start splitting expenses</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}

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
        .select('*, trip_members(*, profiles:profiles!trip_members_user_id_fkey(*))')
        .eq('id', id)
        .single()

    if (error || !trip) {
        console.error('Trip Load Error:', error)
        return <div className="p-4 text-red-500">Error loading trip. Please try again.</div>
    }

    // Fetch Expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select('*, profiles:profiles!expenses_payer_id_fkey(display_name, email)')
        .eq('trip_id', id)
        .order('date', { ascending: false })

    return (
        <div className="container mx-auto p-4 py-8">
            {/* Header Section */}
            <div className="glass-card mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-sm">{trip.name}</h1>
                            <p className="text-brand-100 text-lg max-w-2xl">{trip.description}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href={`/trips/${id}/expenses/new`} className="btn-primary">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Add Expense
                            </Link>
                            <Link href={`/trips/${id}/settlements`} className="btn-secondary">
                                Settle Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Expenses) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>Expenses</span>
                        <span className="text-sm bg-white/10 text-white px-2 py-1 rounded-full font-normal">{expenses?.length || 0}</span>
                    </h2>

                    {expenses && expenses.length > 0 ? (
                        <div className="space-y-3">
                            {expenses.map((expense: any) => (
                                <div key={expense.id} className="glass-card p-4 flex justify-between items-center group hover:bg-white/10 cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                                            {expense.currency?.[0] || '$'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg">{expense.description}</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-brand-200">
                                                    {expense.profiles?.display_name || expense.profiles?.email || 'Unknown'}
                                                </span>
                                                <span className="text-white/20">•</span>
                                                <span className="text-slate-400">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-xl text-white">
                                        {expense.currency} {expense.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">No expenses yet</h3>
                            <p className="text-slate-400 mb-6">Add your first expense to start tracking.</p>
                            <Link href={`/trips/${id}/expenses/new`} className="btn-secondary inline-flex">
                                Add Expense
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar (Invite & Members) */}
                <div className="space-y-6">
                    {/* Invite Card */}
                    <div className="glass-card bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-brand-500/30">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                            Invite Friends
                        </h2>
                        <div className="bg-black/30 p-3 rounded-xl mb-4 flex justify-between items-center border border-white/5">
                            <code className="text-brand-300 font-mono tracking-wider">{trip.invite_code}</code>
                        </div>
                        <Link href={`/join?code=${trip.invite_code}`} className="text-brand-200 hover:text-white text-sm break-all hover:underline flex items-center gap-1">
                            <span className="truncate">{`/join?code=${trip.invite_code}`}</span>
                        </Link>
                    </div>

                    {/* Members Card */}
                    <div className="glass-card">
                        <h2 className="text-lg font-semibold text-white mb-4">Members</h2>
                        <ul className="space-y-3">
                            {trip.trip_members?.map((member: any) => (
                                <li key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                            {(member.profiles?.display_name || member.profiles?.email || 'U')[0].toUpperCase()}
                                        </div>
                                        <span className="font-medium text-slate-200 text-sm">
                                            {member.profiles?.display_name || member.profiles?.email || 'Unknown User'}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${member.role === 'leader' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/20' : 'bg-slate-700/50 text-slate-400'}`}>
                                        {member.role}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

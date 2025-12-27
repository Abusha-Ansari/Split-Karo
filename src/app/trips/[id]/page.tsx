import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InviteCard from '@/components/invite-card'
import MemberManagement from '@/components/member-management'
import InviteModal from '@/components/invite-modal'

export default async function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Trip Metadata (Allowed for Pending/invited due to new RLS)
    const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !trip) {
        console.error('Trip Load Error:', error)
        return <div className="p-4 text-red-500">Error loading trip. Please try again.</div>
    }

    // Fetch Current Member Status
    const { data: currentMember } = await supabase
        .from('trip_members')
        .select('role, status')
        .eq('trip_id', id)
        .eq('user_id', user.id)
        .single()

    // Handle Pending/Invited States
    if (currentMember?.status === 'pending') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="glass-card max-w-md w-full text-center p-8 space-y-6">
                    <div className="w-16 h-16 bg-amber-500/20 text-amber-300 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Request Sent</h1>
                    <p className="text-slate-300">
                        Your request to join <span className="text-brand-200 font-bold">{trip.name}</span> has been sent.
                        Please wait for the trip leader to approve it.
                    </p>
                    <Link href="/dashboard" className="btn-secondary inline-block">Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    if (currentMember?.status === 'invited') {
        // Auto-accept? Or show accept button.
        // For now, let's just show a simple "You have been invited" screen similar to pending.
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="glass-card max-w-md w-full text-center p-8 space-y-6">
                    <div className="w-16 h-16 bg-brand-500/20 text-brand-300 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">You're Invited!</h1>
                    <p className="text-slate-300">
                        You have been invited to join <span className="text-brand-200 font-bold">{trip.name}</span>.
                    </p>
                    <form action={async () => {
                        'use server'
                        const supabase = await createClient()
                        await supabase.from('trip_members').update({ status: 'accepted', joined_at: new Date().toISOString() }).eq('trip_id', id).eq('user_id', user.id)
                        redirect(`/trips/${id}`)
                    }}>
                        <button className="btn-primary w-full">Accept Invitation</button>
                    </form>
                    <Link href="/dashboard" className="btn-secondary inline-block mt-4">Cancel</Link>
                </div>
            </div>
        )
    }

    // --- Active Member View ---

    // Fetch Trip Members (for management)
    const { data: members } = await supabase
        .from('trip_members')
        .select('*, profiles:profiles!trip_members_user_id_fkey(*)')
        .eq('trip_id', id)

    // Fetch Expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select(`
            *, 
            profiles:profiles!expenses_payer_id_fkey(display_name, email),
            expense_splits(
                user_id,
                share_amount,
                profiles:profiles!expense_splits_user_id_fkey(display_name)
            )
        `)
        .eq('trip_id', id)
        .order('date', { ascending: false })

    const isLeader = currentMember?.role === 'leader' || trip.leader_id === user.id

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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-sm leading-tight">{trip.name}</h1>
                            <p className="text-brand-100 text-base md:text-lg max-w-2xl">{trip.description}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Link href={`/trips/${id}/expenses/new`} className="btn-primary justify-center flex-1 sm:flex-initial">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Add Expense
                            </Link>
                            <Link href={`/trips/${id}/settlements`} className="btn-secondary justify-center flex-1 sm:flex-initial text-center">
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
                                <div key={expense.id} className="glass-card p-3 sm:p-4 flex items-start sm:items-center justify-between gap-3 group hover:bg-white/10 cursor-default transition-colors">
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20 text-sm sm:text-base">
                                            {expense.currency?.[0] || '$'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-base sm:text-lg truncate leading-tight mb-0.5">{expense.description}</p>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300">
                                                    <span className="text-brand-200 font-medium truncate">
                                                        {expense.profiles?.display_name || expense.profiles?.email || 'Unknown'}
                                                    </span>
                                                    <span className="text-white/20">•</span>
                                                    <span>
                                                        {new Date(expense.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-slate-400 italic truncate">
                                                    {expense.split_type === 'equal_all' && 'Split with everyone'}
                                                    {expense.split_type === 'equal_selected' && (
                                                        <span>
                                                            Split with {expense.expense_splits?.length} people: {' '}
                                                            {expense.expense_splits?.map((s: any) => s.profiles?.display_name || 'User').join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-lg sm:text-xl text-white whitespace-nowrap flex-shrink-0 pl-2">
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
                    <InviteCard inviteCode={trip.invite_code} />

                    {/* Member Management */}
                    <MemberManagement
                        tripId={id}
                        members={members || []}
                        isAdmin={isLeader}
                    />

                    {isLeader && <InviteModal tripId={id} />}
                </div>
            </div>
        </div>
    )
}

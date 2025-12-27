'use client'

import { useState } from 'react'
import { addExpense } from '@/app/trips/[id]/expenses/actions'

type Profile = {
    id: string
    display_name: string | null
    email: string | null
}

type Member = {
    user_id: string
    profiles: Profile
}

type ExpenseFormProps = {
    tripId: string
    members: Member[]
    currentUserId: string
    currency: string
}

export default function ExpenseForm({ tripId, members, currentUserId, currency }: ExpenseFormProps) {
    const [splitType, setSplitType] = useState<'equal_all' | 'equal_selected'>('equal_all')
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(members.map(m => m.user_id)))
    const [isPending, setIsPending] = useState(false)

    const toggleMember = (userId: string) => {
        const newSelected = new Set(selectedMembers)
        if (newSelected.has(userId)) {
            newSelected.delete(userId)
        } else {
            newSelected.add(userId)
        }
        setSelectedMembers(newSelected)
    }

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)

        // Append split data
        formData.append('split_type', splitType)
        if (splitType === 'equal_selected') {
            // Clear any existing (though FormData from event shouldn't have them yet unless hidden inputs used)
            formData.delete('selected_users')
            selectedMembers.forEach(id => {
                formData.append('selected_users', id)
            })
        }

        await addExpense(tripId, formData)
        setIsPending(false)
    }

    // Bind the server action with extra args if needed, or just call it directly as above if it takes (tripId, formData).
    // The action signature is (tripId: string, formData: FormData).
    // We can't pass the modified FormData directly to the binding easily if we use `action={addExpenseWithId}`.
    // Instead we can use `action` prop with a client-side wrapper or `onSubmit`.
    // Since we are modifying formData, `onSubmit` or `formAction` that constructs data is better, 
    // BUT Next.js Server Actions on <form action> strictly take FormData from the DOM.
    // To append extra data, we can use hidden inputs controlled by state.

    // We use a client-side handler to append the extra state (split_type, selected_users) 
    // to the FormData before invoking the server action.
    // However, since we can't easily modify the FormData passed to a Server Action in the `action` prop 
    // without using hidden inputs (which we did), we CAN just use the Server Action directly if the hidden inputs are present.
    // BUT `handleSubmit` was doing `formData.append` which is cleaner than relying on hidden inputs for complex sets, 
    // OR we can just rely on the hidden inputs we added:
    // <input type="hidden" name="split_type" value={splitType} />
    // ... hidden inputs for selected_users ...
    //
    // The hidden inputs approach is robust and works with Progressive Enhancement (if we rendered them on server, but here it's client component).
    // Let's rely on the hidden inputs for `splitType` and `selectedUsers` which are already in the JSX!
    //
    // WAIT, `handleSubmit` in my previous code was doing `formData.append`. 
    // The hidden inputs in the JSX `input type="hidden" ...` ALREADY put the data in the formData.
    // So `addExpenseWithId` works! 
    // The ONLY issue is proper loading state `isPending`. 
    // We can use `useFormStatus` hook in a child component, or use `handleSubmit` wrapper.
    // Let's use `handleSubmit` wrapper to set `isPending` and ensuring data is there.

    // Explicitly using the wrapper:

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                    <input
                        type="text"
                        name="description"
                        id="description"
                        required
                        className="glass-input w-full text-lg placeholder:text-slate-500/50"
                        placeholder="What is this for?"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-200 mb-1">Amount</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="text-gray-400 font-bold text-sm">{currency}</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                id="amount"
                                required
                                className="glass-input w-full pl-8 text-lg font-mono font-medium"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-200 mb-1">Date</label>
                        <input
                            type="date"
                            name="date"
                            id="date"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="glass-input w-full text-slate-200"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="payer_id" className="block text-sm font-medium text-slate-200 mb-1">Paid By</label>
                    <div className="relative">
                        <select
                            name="payer_id"
                            id="payer_id"
                            defaultValue={currentUserId}
                            className="glass-input w-full appearance-none pr-10 cursor-pointer"
                        >
                            {members.map((m) => (
                                <option key={m.user_id} className="bg-slate-900 text-slate-200" value={m.user_id}>
                                    {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="block text-sm font-medium text-slate-200">Split Method</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setSplitType('equal_all')}
                        className={`py-3 px-4 text-sm font-medium rounded-xl transition-all flex flex-col items-center gap-2 border ${splitType === 'equal_all'
                            ? 'bg-brand-500/20 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                            : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                            }`}
                    >
                        <span className="text-lg">👥</span>
                        Everyone
                    </button>
                    <button
                        type="button"
                        onClick={() => setSplitType('equal_selected')}
                        className={`py-3 px-4 text-sm font-medium rounded-xl transition-all flex flex-col items-center gap-2 border ${splitType === 'equal_selected'
                            ? 'bg-brand-500/20 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                            : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                            }`}
                    >
                        <span className="text-lg">✨</span>
                        Specific
                    </button>
                </div>

                {/* Hidden Inputs for Split Type & Selection */}
                <input type="hidden" name="split_type" value={splitType} />
                {splitType === 'equal_selected' && Array.from(selectedMembers).map(id => (
                    <input key={id} type="hidden" name="selected_users" value={id} />
                ))}

                {/* Member Selection List */}
                {splitType === 'equal_selected' && (
                    <div className="glass-card bg-black/20 p-3 mt-2 rounded-xl space-y-1 max-h-60 overflow-y-auto custom-scrollbar border border-white/5">
                        <div className="flex items-center justify-between px-2 mb-2 pb-2 border-b border-white/5">
                            <span className="text-xs font-medium text-slate-400">Select Members</span>
                            <span className="text-xs text-brand-300">{selectedMembers.size} selected</span>
                        </div>
                        {members.map((m) => (
                            <label key={m.user_id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedMembers.has(m.user_id) ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-600 bg-transparent group-hover:border-slate-500'}`}>
                                    {selectedMembers.has(m.user_id) && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.has(m.user_id)}
                                    onChange={() => toggleMember(m.user_id)}
                                    className="hidden"
                                />
                                <span className={`text-sm font-medium transition-colors ${selectedMembers.has(m.user_id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                    {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                <p className="text-xs text-center text-slate-400 min-h-[1.5em]">
                    {splitType === 'equal_all'
                        ? `Splitting equally ($${(members.length > 0 ? (Number((document.getElementById('amount') as HTMLInputElement)?.value || 0) / members.length).toFixed(2) : '0.00')}/person) among everyone.`
                        : `Splitting equally among ${selectedMembers.size} people.`
                    }
                </p>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isPending || (splitType === 'equal_selected' && selectedMembers.size === 0)}
                    className="btn-primary w-full py-3.5 text-base shadow-xl shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500"
                >
                    {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Saving...
                        </span>
                    ) : 'Save Expense'}
                </button>
                <div className="text-center mt-4">
                    <a href={`/trips/${tripId}`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</a>
                </div>
            </div>
        </form>
    )
}

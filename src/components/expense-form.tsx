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
}

export default function ExpenseForm({ tripId, members, currentUserId }: ExpenseFormProps) {
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
        <form action={handleSubmit} className="space-y-4">
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
                <select name="payer_id" id="payer_id" defaultValue={currentUserId} className="glass-input mt-1 w-full text-slate-900 appearance-none bg-white/50">
                    {members.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                            {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                        </option>
                    ))}
                </select>
            </div>

            {/* Split Type Selector */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Split Between</label>
                <div className="flex gap-4 p-1 bg-white/10 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setSplitType('equal_all')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${splitType === 'equal_all'
                            ? 'bg-brand-500 text-white shadow-lg'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Everyone
                    </button>
                    <button
                        type="button"
                        onClick={() => setSplitType('equal_selected')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${splitType === 'equal_selected'
                            ? 'bg-brand-500 text-white shadow-lg'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Specific People
                    </button>
                </div>
            </div>

            {/* Hidden Inputs for Split Type & Selection (to pass to Server Action via FormData) */}
            <input type="hidden" name="split_type" value={splitType} />
            {splitType === 'equal_selected' && Array.from(selectedMembers).map(id => (
                <input key={id} type="hidden" name="selected_users" value={id} />
            ))}

            {/* Member Selection List */}
            {splitType === 'equal_selected' && (
                <div className="glass p-4 rounded-xl space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {members.map((m) => (
                        <label key={m.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={selectedMembers.has(m.user_id)}
                                onChange={() => toggleMember(m.user_id)}
                                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-white/50"
                            />
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${selectedMembers.has(m.user_id) ? 'text-white' : 'text-slate-400'}`}>
                                    {m.profiles?.display_name || m.profiles?.email || 'Unknown'}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            )}

            <div className="text-xs text-brand-100 italic text-center mt-2">
                {splitType === 'equal_all'
                    ? `Splitting equally among all ${members.length} members.`
                    : `Splitting equally among ${selectedMembers.size} selected members.`
                }
            </div>

            <button type="submit" disabled={isPending || (splitType === 'equal_selected' && selectedMembers.size === 0)} className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                {isPending ? 'Saving...' : 'Save Expense'}
            </button>
            <div className="text-center mt-4">
                <a href={`/trips/${tripId}`} className="text-sm text-slate-300 hover:text-white hover:underline">Cancel</a>
            </div>
        </form>
    )
}

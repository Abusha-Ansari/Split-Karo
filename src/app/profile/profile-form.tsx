'use client'

import { updateProfile } from './actions'
import { useState } from 'react'

export default function ProfileForm({ profile }: { profile: any }) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        setMessage(null)

        const result = await updateProfile(formData)

        if (result?.error) {
            setMessage({ type: 'error', text: typeof result.error === 'string' ? result.error : 'Invalid input' })
        } else if (result?.success) {
            setMessage({ type: 'success', text: result.success })
        }
        setIsPending(false)
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            {message && (
                <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-slate-200">Display Name</label>
                <input
                    type="text"
                    name="display_name"
                    id="display_name"
                    defaultValue={profile?.display_name || ''}
                    className="glass-input mt-1 w-full text-slate-900"
                    placeholder="e.g. John Doe"
                />
            </div>

            <div>
                <label htmlFor="avatar_url" className="block text-sm font-medium text-slate-200">Avatar URL (Optional)</label>
                <input
                    type="url"
                    name="avatar_url"
                    id="avatar_url"
                    defaultValue={profile?.avatar_url || ''}
                    className="glass-input mt-1 w-full text-slate-900"
                    placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-slate-400 mt-1">Paste a direct link to an image.</p>
            </div>

            <button type="submit" disabled={isPending} className="btn-primary w-full mt-4 disabled:opacity-50">
                {isPending ? 'Saving...' : 'Update Profile'}
            </button>
        </form>
    )
}

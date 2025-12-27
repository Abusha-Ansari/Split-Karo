'use client'

import { useState } from 'react'

export default function InviteCard({ inviteCode }: { inviteCode: string }) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        const url = `${window.location.origin}/join?code=${inviteCode}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="glass-card bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-brand-500/30">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                Invite Friends
            </h2>
            <div className="bg-black/30 p-3 rounded-xl mb-4 flex justify-between items-center border border-white/5">
                <code className="text-brand-300 font-mono tracking-wider text-lg">{inviteCode}</code>
            </div>

            <button
                onClick={copyToClipboard}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${copied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
            >
                {copied ? (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Copied!
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                        Click to copy invite URL
                    </>
                )}
            </button>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true)
        }

        // Check for iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        setIsIOS(/iphone|ipad|ipod/.test(userAgent))

        // Capture install prompt event
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice

        if (choiceResult.outcome === 'accepted') {
            setDeferredPrompt(null)
        }
    }

    if (isStandalone) return null

    // Don't show if no prompt available (unless iOS where we need custom instructions)
    if (!deferredPrompt && !isIOS) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="glass-card bg-indigo-600/90 border-indigo-500/50 p-4 shadow-xl flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">Install App</h3>
                    <p className="text-indigo-100 text-xs mt-1">
                        {isIOS
                            ? "Tap the share button and select 'Add to Home Screen'"
                            : "Install this app for a better experience"
                        }
                    </p>
                </div>
                {!isIOS && (
                    <button
                        onClick={handleInstallClick}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-100 transition-colors"
                    >
                        Install
                    </button>
                )}
                <button
                    onClick={() => {
                        setDeferredPrompt(null)
                        setIsIOS(false)
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    )
}

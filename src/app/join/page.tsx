import { joinTrip } from './actions'

export default async function JoinPage({
    searchParams,
}: {
    searchParams: Promise<{ code?: string }>
}) {
    const { code } = await searchParams
    const defaultCode = code || ''

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md">
                    Join a Trip
                </h2>
                <p className="mt-2 text-center text-sm text-slate-300">
                    Enter the invite code shared with you.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-card">
                    <form action={joinTrip as any} className="space-y-6">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-slate-200">
                                Invite Code
                            </label>
                            <div className="mt-1">
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    required
                                    defaultValue={defaultCode}
                                    className="glass-input w-full text-slate-900 font-mono tracking-wider text-center text-lg uppercase"
                                    placeholder="ABCD-1234"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="btn-primary w-full"
                            >
                                Join Trip
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

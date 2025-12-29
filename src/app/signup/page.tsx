import { signup } from '../login/actions'
import VerificationModal from './verification-modal'
import PasswordInput from '@/components/password-input'

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>
}) {
    const { error, message } = await searchParams

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md">
                    Create your account
                </h2>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-card">
                    {error && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <VerificationModal message={message} />
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="display_name" className="block text-sm font-medium text-slate-200">
                                Display Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="display_name"
                                    name="display_name"
                                    type="text"
                                    required
                                    className="glass-input w-full text-slate-900 placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="glass-input w-full text-slate-900 placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                                Password
                            </label>
                            <div className="mt-1">
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                formAction={signup}
                                className="btn-primary w-full"
                            >
                                Sign up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    )
}

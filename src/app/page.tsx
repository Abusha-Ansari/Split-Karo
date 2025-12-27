import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-600/20 blur-[100px] animate-float" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-brand-900/20 blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="glass-card max-w-lg w-full text-center space-y-8 p-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg tracking-tight">
            Expense<span className="text-brand-300">Tracker</span>
          </h1>
          <p className="text-xl text-slate-200">
            Split bills, track expenses, and settle up with friends effortlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="btn-secondary w-full sm:w-auto px-8">
            Login
          </Link>
          <Link href="/signup" className="btn-primary w-full sm:w-auto px-8">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}

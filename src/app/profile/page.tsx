import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto p-4 py-12">
            <div className="max-w-md mx-auto glass-card">
                <h1 className="text-2xl font-bold mb-6 text-white text-center">Edit Profile</h1>
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 overflow-hidden relative">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            (profile?.display_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                        )}
                    </div>
                    <p className="text-slate-300 text-sm">{user.email}</p>
                </div>

                <ProfileForm profile={profile} />
            </div>
        </div>
    )
}

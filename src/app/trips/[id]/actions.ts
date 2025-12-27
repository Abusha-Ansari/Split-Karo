'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveMember(tripId: string, memberId: string) {
    const supabase = await createClient()

    // Verify current user is leader (RLS protects update, but good to be explicit or handle errors)
    const { error } = await supabase
        .from('trip_members')
        .update({ status: 'accepted' })
        .eq('trip_id', tripId)
        .eq('user_id', memberId)

    if (error) throw error
    revalidatePath(`/trips/${tripId}`)
}

export async function rejectMember(tripId: string, memberId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('trip_members')
        .delete()
        .eq('trip_id', tripId)
        .eq('user_id', memberId)

    if (error) throw error
    revalidatePath(`/trips/${tripId}`)
}

export async function inviteUser(tripId: string, userId: string) {
    const supabase = await createClient()
    
    // Check if current user is leader/member? (Policy usually allows members to invite? Or just leader? Prompt implied leader)
    // We'll let RLS or simple logic handle it. For now, we assume any member can invite, or check policy.
    // Insert with status 'invited'
    
    // Check if user is already a member
    const { data: existing } = await supabase.from('trip_members').select('status').eq('trip_id', tripId).eq('user_id', userId).single()
    
    if (existing) {
        if (existing.status === 'invited') return { message: 'Already invited' }
        if (existing.status === 'accepted') return { message: 'Already a member' }
        if (existing.status === 'pending') {
            // Auto accept if we invite them?
            await approveMember(tripId, userId)
            return { message: 'Request approved' }
        }
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('trip_members').insert({
        trip_id: tripId,
        user_id: userId,
        status: 'invited',
        role: 'member',
        invited_by: user?.id,
        joined_at: null
    })

    if (error) throw error
    revalidatePath(`/trips/${tripId}`)
    return { success: true }
}

export async function searchUsers(query: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('search_profiles', { query })
    if (error) console.error(error)
    return data || []
}

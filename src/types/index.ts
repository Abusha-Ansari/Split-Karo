export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
  unique_invite_code: string | null
}

export interface Trip {
  id: string
  name: string
  description: string | null
  currency: string
  leader_id: string
  created_at: string
  starts_at: string | null
  ends_at: string | null
  invite_code: string | null
  trip_members?: TripMember[]
}

export interface TripMember {
  id: string
  trip_id: string
  user_id: string
  role: 'leader' | 'member'
  status: 'invited' | 'pending' | 'accepted' | 'declined'
  joined_at: string | null
  invited_by: string | null
  profiles?: Profile
}

export interface Expense {
  id: string
  trip_id: string
  created_by: string
  payer_id: string
  amount: number
  currency: string
  description: string
  date: string
  receipt_url: string | null
  split_type: 'equal_all' | 'equal_selected' | 'custom'
  created_at: string
}

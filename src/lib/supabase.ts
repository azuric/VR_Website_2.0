import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  discord_username?: string
  vr_experience_level?: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  tag: string
  description?: string
  logo_url?: string
  captain_id: string
  max_members: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  name: string
  description?: string
  game_mode: string
  tournament_type: string
  max_participants: number
  entry_fee: number
  prize_pool: number
  registration_start: string
  registration_end: string
  tournament_start: string
  tournament_end?: string
  status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
}

export interface TournamentRegistration {
  id: string
  tournament_id: string
  team_id?: string
  user_id?: string
  registration_type: 'team' | 'individual'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_id?: string
  registered_at: string
}

// Helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as Profile
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Profile
}

export async function getTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('tournament_start', { ascending: true })
  
  if (error) throw error
  return data as Tournament[]
}

export async function registerForTournament(tournamentId: string, registrationData: {
  team_id?: string
  user_id?: string
  registration_type: 'team' | 'individual'
}) {
  const { data, error } = await supabase
    .from('tournament_registrations')
    .insert({
      tournament_id: tournamentId,
      ...registrationData,
      payment_status: 'pending'
    })
    .select()
    .single()
  
  if (error) throw error
  return data as TournamentRegistration
}


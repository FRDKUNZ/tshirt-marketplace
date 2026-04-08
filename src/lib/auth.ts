import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database'

type UsersRow = Database['public']['Tables']['users']['Row']

export type UserSession = {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin' | null
  avatar_url: string | null
}

export async function getSession(): Promise<UserSession | null> {
  const supabase = await createClient()

  // Use getUser() instead of getSession() for security
  // getSession() reads from cookies (insecure), getUser() validates with Supabase Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Get user profile from database
  const { data: profile, error } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single() as { data: Pick<UsersRow, 'full_name' | 'role'> | null, error: any | null }

  if (error) {
    console.error('getSession profile lookup error:', error.message, 'code:', error.code)
  }

  if (!profile) {
    console.warn('getSession: no profile found for user:', user.id)
  }

  return {
    id: user.id,
    email: user.email ?? '',
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    role: (profile?.role as 'user' | 'admin' | null) ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/auth/login')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.role !== 'admin') {
    redirect('/')
  }
  return session
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function getUserProfile() {
  const session = await requireAuth()
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.id)
    .single()

  if (error) {
    console.error('getUserProfile error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: session.id,
    })

    // If the user row doesn't exist yet (trigger hasn't fired),
    // return a partial profile from session data
    if (error.code === 'PGRST116' || error.code === '23505') {
      const fallback: UsersRow = {
        id: session.id,
        full_name: session.full_name,
        email: session.email,
        phone: null,
        address: null,
        city: null,
        province: null,
        postal_code: null,
        country: 'Indonesia',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return fallback
    }

    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return profile
}

export async function updateUserProfile(
  updates: Partial<Pick<UsersRow, 'full_name' | 'phone' | 'address' | 'city' | 'province' | 'postal_code'>>
) {
  const session = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('users')
    .update(updates)
    .eq('id', session.id)
    .select()
    .single()

  if (error) {
    console.error('updateUserProfile error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      userId: session.id,
    })
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return data
}

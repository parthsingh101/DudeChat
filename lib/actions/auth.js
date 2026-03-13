'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData) {
  const supabase = await createClient()

  const username = formData.get('username')
  const password = formData.get('password')
  
  if (!username || !password) {
    return { error: 'Username and password are required' }
  }

  // 1. Find email associated with the username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', username)
    .single()

  if (profileError || !profile?.email) {
    return { error: 'Invalid username or password' }
  }

  // 2. Sign in with the retrieved email
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: password
  })

  if (error) {
    console.error('Login error:', error.message)
    return { error: error.message }
  }

  redirect('/chat')
}

export async function signup(formData) {
  const supabase = await createClient()

  const fullName = formData.get('fullName')
  const username = formData.get('username')
  const email = formData.get('email')
  const password = formData.get('password')

  if (!fullName || !username || !email || !password) {
    return { error: 'All fields are required' }
  }

  // Check if username is taken
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()
    
  if (existingUser) {
    return { error: 'Username is already taken' }
  }

  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        username: username,
      }
    }
  })

  if (error) {
    console.error('Signup error:', error.message)
    if (error.message.toLowerCase().includes('rate limit')) {
      return { 
        error: "Supabase Rate Limit! Go to Dashboard -> Authentication -> Rate Limits and increase limits."
      }
    }
    return { error: error.message }
  }

  redirect('/chat')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

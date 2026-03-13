'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, user }
}

export async function uploadAvatar(formData) {
  try {
    const { supabase, user } = await getUser()
    const file = formData.get('avatar')
    
    if (!file || file.size === 0) {
      return { error: 'No file selected' }
    }
    
    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return { error: 'File size must be less than 2MB' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return { error: 'Failed to upload image' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      return { error: 'Successfully uploaded but failed to update profile' }
    }

    revalidatePath('/', 'layout')
    return { success: true, avatarUrl: publicUrl }
  } catch (err) {
    return { error: err.message }
  }
}

export async function updateUsername(formData) {
  try {
    const { supabase, user } = await getUser()
    const username = formData.get('username')

    if (!username || username.length < 3) {
      return { error: 'Username must be at least 3 characters' }
    }

    // Check if taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()

    if (existing) {
      return { error: 'Username is already taken' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id)

    if (error) return { error: error.message }
    
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    return { error: err.message }
  }
}

export async function updatePassword(formData) {
  try {
    const { supabase } = await getUser()
    const password = formData.get('password')

    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters' }
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) return { error: error.message }
    return { success: true }
  } catch (err) {
    return { error: err.message }
  }
}

export async function deleteAccount() {
  try {
    const { supabase, user } = await getUser()
    
    // Call our secure RPC to delete the user
    const { error } = await supabase.rpc('delete_user')
    
    if (error) {
      console.error('Delete account error:', error)
      return { error: 'Failed to delete account. Please try again.' }
    }

    // Sign out since the account is gone
    await supabase.auth.signOut()
    redirect('/login')
  } catch (err) {
    if (err.message === 'NEXT_REDIRECT') throw err
    console.error('Unexpected error during delete:', err)
    return { error: 'An unexpected error occurred.' }
  }
}

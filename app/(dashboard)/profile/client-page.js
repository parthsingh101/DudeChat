'use client'

import { useState } from 'react'
import { uploadAvatar, updateUsername, updatePassword, deleteAccount } from '@/lib/actions/profile'
import toast from 'react-hot-toast'
import { Camera, Save, Lock, User, Trash2, AlertTriangle } from 'lucide-react'

export default function ProfilePage({ profile }) {
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarLoading(true)
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await uploadAvatar(formData)
    if (res?.error) toast.error(res.error)
    else toast.success('Avatar updated!')
    setAvatarLoading(false)
  }

  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    setUsernameLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateUsername(formData)
    if (res?.error) toast.error(res.error)
    else toast.success('Username updated!')
    setUsernameLoading(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    const formData = new FormData(e.currentTarget)
    if (formData.get('password') !== formData.get('confirmPassword')) {
      toast.error('Passwords do not match')
      setPasswordLoading(false)
      return
    }
    const res = await updatePassword(formData)
    if (res?.error) toast.error(res.error)
    else { toast.success('Password updated!'); e.currentTarget.reset() }
    setPasswordLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete your account? This cannot be undone.')) return
    setDeleteLoading(true)
    const res = await deleteAccount()
    if (res?.error) { toast.error(res.error); setDeleteLoading(false) }
  }

  const inputClass = "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition"
  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border-2)', color: 'var(--text)' }

  const cardStyle = { background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '1rem', padding: '1.5rem' }

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 sm:p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">

        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)', letterSpacing: '0.18em' }}>
            Profile Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage your account details and preferences.
          </p>
        </div>

        {/* Avatar */}
        <div style={cardStyle}>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text)', letterSpacing: '0.12em' }}>
            Profile Picture
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative group flex-shrink-0">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center font-bold overflow-hidden"
                style={{ background: 'var(--accent)', color: 'white', fontSize: '2rem', boxShadow: '0 0 20px var(--accent-glow)' }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || '?').toUpperCase()
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 w-full h-full bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {avatarLoading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{profile?.full_name || profile?.username}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>@{profile?.username}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>Recommended: 256×256px, max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Edit Username + Password */}
        <div style={cardStyle} className="space-y-6">
          <form onSubmit={handleUsernameSubmit}>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text)', letterSpacing: '0.12em' }}>
              Edit Username
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4" style={{ color: 'var(--text-dim)' }} />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  defaultValue={profile?.username}
                  pattern="^[a-zA-Z0-9_]{3,20}$"
                  className={`${inputClass} pl-9`}
                  style={inputStyle}
                  placeholder="New username"
                />
              </div>
              <button
                type="submit"
                disabled={usernameLoading}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 12px var(--accent-glow)' }}
              >
                {usernameLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </form>

          <div style={{ borderTop: '1px solid var(--border)' }} />

          <form onSubmit={handlePasswordSubmit}>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text)', letterSpacing: '0.12em' }}>
              Change Password
            </h2>
            <div className="space-y-3 max-w-sm">
              {[['password', 'New Password'], ['confirmPassword', 'Confirm Password']].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4" style={{ color: 'var(--text-dim)' }} />
                    </div>
                    <input
                      name={name}
                      type="password"
                      required
                      minLength={6}
                      className={`${inputClass} pl-9`}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 mt-1"
                style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 12px var(--accent-glow)' }}
              >
                {passwordLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.25)', borderRadius: '1rem', padding: '1.5rem' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}>
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Once you delete your account, all your messages, connections, and requests are permanently deleted.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            style={{ background: 'rgba(185,28,28,0.1)', color: 'var(--accent)', border: '1px solid rgba(185,28,28,0.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(185,28,28,0.1)'; e.currentTarget.style.color = 'var(--accent)' }}
          >
            {deleteLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Account
          </button>
        </div>

      </div>
    </div>
  )
}

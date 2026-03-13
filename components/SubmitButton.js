'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ label, pendingLabel = 'Loading...' }) {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-3 transition shadow-lg hover:shadow-indigo-600/30"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

'use client'

import { signup } from '@/lib/actions/auth';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { UserPlus, User, Lock, Mail, AtSign } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await signup(formData);
    
    if (res?.error) {
      toast.error(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create an Account</h2>
        <p className="text-slate-400 text-sm">Join DudeChat today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User className="h-5 w-5" />
            </div>
            <input
              name="fullName"
              type="text"
              required
              className="block w-full pl-10 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 sm:text-sm"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <AtSign className="h-5 w-5" />
            </div>
            <input
              name="username"
              type="text"
              required
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title="Username must be 3-20 characters long and contain only letters, numbers, and underscores."
              className="block w-full pl-10 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 sm:text-sm"
              placeholder="johndoe_99"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              name="email"
              type="email"
              required
              className="block w-full pl-10 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 sm:text-sm"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="block w-full pl-10 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-3 transition shadow-lg hover:shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
          Sign Up
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}

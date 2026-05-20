'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Activity, ArrowRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'hsl(224, 50%, 4%)' }}
    >
      {/* ambient glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(158, 64%, 48%, 0.1) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(199, 85%, 50%, 0.05) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm mx-4 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
            style={{
              background: 'linear-gradient(135deg, hsl(158, 64%, 48%) 0%, hsl(158, 64%, 36%) 100%)',
              boxShadow: '0 0 30px hsl(158, 64%, 48%, 0.3)',
            }}
          >
            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Khazna Analytics</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">AI-powered support intelligence</p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-7"
          style={{
            background: 'hsl(222, 35%, 7%)',
            border: '1px solid hsl(220, 18%, 12%)',
            boxShadow: '0 20px 60px hsl(224, 50%, 2%, 0.8)',
          }}
        >
          <h2 className="text-base font-semibold mb-6 text-foreground">Sign in to your workspace</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md outline-none transition-all duration-150"
                  style={{
                    background: 'hsl(220, 18%, 10%)',
                    border: '1px solid hsl(220, 18%, 14%)',
                    color: 'hsl(210, 30%, 94%)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'hsl(158, 64%, 48%, 0.5)'
                    e.target.style.boxShadow = '0 0 0 3px hsl(158, 64%, 48%, 0.08)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'hsl(220, 18%, 14%)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md outline-none transition-all duration-150"
                  style={{
                    background: 'hsl(220, 18%, 10%)',
                    border: '1px solid hsl(220, 18%, 14%)',
                    color: 'hsl(210, 30%, 94%)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'hsl(158, 64%, 48%, 0.5)'
                    e.target.style.boxShadow = '0 0 0 3px hsl(158, 64%, 48%, 0.08)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'hsl(220, 18%, 14%)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                className="text-xs px-3 py-2.5 rounded-md"
                style={{
                  background: 'hsl(0, 78%, 58%, 0.1)',
                  border: '1px solid hsl(0, 78%, 58%, 0.2)',
                  color: 'hsl(0, 78%, 70%)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all duration-150 disabled:opacity-60"
              style={{
                background: loading
                  ? 'hsl(158, 64%, 42%)'
                  : 'linear-gradient(135deg, hsl(158, 64%, 48%) 0%, hsl(158, 64%, 40%) 100%)',
                color: 'hsl(224, 50%, 4%)',
                boxShadow: loading ? 'none' : '0 0 20px hsl(158, 64%, 48%, 0.2)',
              }}
            >
              {loading ? (
                <span className="font-mono text-xs tracking-widest">AUTHENTICATING...</span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-muted-foreground font-mono">
          KHAZNA · SUPPORT INTELLIGENCE PLATFORM
        </p>
      </div>
    </div>
  )
}

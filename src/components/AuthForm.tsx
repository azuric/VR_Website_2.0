'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

interface AuthFormProps {
  onAuthSuccess?: (user: User) => void
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user && onAuthSuccess) {
        onAuthSuccess(session.user)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user && onAuthSuccess) {
        onAuthSuccess(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [onAuthSuccess])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome back!</h2>
          <p className="text-gray-300 mb-4">
            Signed in as: <span className="text-cyan-400">{user.email}</span>
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Join the VR Combat League
      </h2>
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#06b6d4',
                brandAccent: '#0891b2',
                brandButtonText: 'white',
                defaultButtonBackground: '#374151',
                defaultButtonBackgroundHover: '#4b5563',
                defaultButtonBorder: '#6b7280',
                defaultButtonText: 'white',
                dividerBackground: '#374151',
                inputBackground: '#1f2937',
                inputBorder: '#374151',
                inputBorderHover: '#4b5563',
                inputBorderFocus: '#06b6d4',
                inputText: 'white',
                inputLabelText: '#d1d5db',
                inputPlaceholder: '#9ca3af',
                messageText: '#ef4444',
                messageTextDanger: '#ef4444',
                anchorTextColor: '#06b6d4',
                anchorTextHoverColor: '#0891b2',
              },
              space: {
                spaceSmall: '4px',
                spaceMedium: '8px',
                spaceLarge: '16px',
                labelBottomMargin: '8px',
                anchorBottomMargin: '4px',
                emailInputSpacing: '4px',
                socialAuthSpacing: '4px',
                buttonPadding: '10px 15px',
                inputPadding: '10px 15px',
              },
              fontSizes: {
                baseBodySize: '13px',
                baseInputSize: '14px',
                baseLabelSize: '14px',
                baseButtonSize: '14px',
              },
              fonts: {
                bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                labelFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
              },
            },
          },
        }}
        providers={['discord', 'google']}
        redirectTo={`${window.location.origin}/auth/callback`}
        onlyThirdPartyProviders={false}
        magicLink={true}
        showLinks={true}
        view="sign_in"
      />
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Menu, X, Trophy, Users, Calendar, Settings, LogOut } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMobileMenuOpen(false)
  }

  const navigation = [
    { name: 'Royal Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Hall of Lords', href: '/leaderboards', icon: Users },
    { name: 'My Battles', href: '/matches', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and primary nav */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center mr-3">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">Lords of Esport</span>
                </div>
              </div>
              
              {/* Desktop navigation */}
              {user && (
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center">
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm hidden sm:block">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-white p-2 rounded-md transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <a
                  href="/auth"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </a>
              )}

              {/* Mobile menu button */}
              {user && (
                <div className="md:hidden ml-4">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-gray-300 hover:text-white p-2 rounded-md transition-colors"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </a>
              ))}
              <div className="border-t border-gray-700 pt-4 pb-3">
                <div className="px-3 text-gray-300 text-sm mb-2">
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Lords of Esport. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Rule the Virtual Realm | In Partnership with VRXtra Kingston
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


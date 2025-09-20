'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import Layout from '@/components/Layout'
import AuthForm from '@/components/AuthForm'
import TournamentCard from '@/components/TournamentCard'
import { supabase, getTournaments, Tournament } from '@/lib/supabase'
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    if (user) {
      loadTournaments()
    }
  }, [user])

  const loadTournaments = async () => {
    try {
      const data = await getTournaments()
      setTournaments(data)
    } catch (error) {
      console.error('Error loading tournaments:', error)
    }
  }

  const handleTournamentRegister = async (tournamentId: string) => {
    if (!user) return
    
    try {
      // This would integrate with your payment system
      alert('Tournament registration would be processed here with Stripe integration')
      // For now, just reload tournaments
      await loadTournaments()
    } catch (error) {
      console.error('Error registering for tournament:', error)
      alert('Registration failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-yellow-400">Lords of Esport</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Rule the Virtual Realm. Where VR warriors forge their legends in the ultimate Population One battleground.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Royal Competition</h3>
              <p className="text-gray-300">Elite tournament structure with substantial prize pools and pathways to legendary status.</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Noble Alliance</h3>
              <p className="text-gray-300">Official partnership with VRXtra Kingston provides professional-grade facilities and royal treatment.</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ascend to Glory</h3>
              <p className="text-gray-300">Master Population One's revolutionary combat system and claim your throne in the virtual realm.</p>
            </div>
          </div>

          {/* Auth Form */}
          <div className="max-w-md mx-auto">
            <AuthForm onAuthSuccess={setUser} />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-300">
            Ready to dominate the virtual arena? Check out the latest tournaments and climb the leaderboards.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center mr-3">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{tournaments.length}</div>
                <div className="text-sm text-gray-400">Active Tournaments</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-sm text-gray-400">Active Players</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400">Your Matches</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1000</div>
                <div className="text-sm text-gray-400">Ranking Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tournaments Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Upcoming Tournaments</h2>
            <a
              href="/tournaments"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              View All →
            </a>
          </div>
          
          {tournaments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.slice(0, 6).map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onRegister={handleTournamentRegister}
                  isRegistered={false} // You would check this against user registrations
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No tournaments available</h3>
              <p className="text-gray-400 mb-4">
                Check back soon for exciting new tournaments, or contact us to suggest one!
              </p>
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Suggest Tournament
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="text-center text-gray-400 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity. Join a tournament to get started!</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}


'use client'

import { Tournament } from '@/lib/supabase'
import { Calendar, Users, Trophy, Clock } from 'lucide-react'

interface TournamentCardProps {
  tournament: Tournament
  onRegister?: (tournamentId: string) => void
  isRegistered?: boolean
}

export default function TournamentCard({ tournament, onRegister, isRegistered }: TournamentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'bg-green-600'
      case 'upcoming':
        return 'bg-blue-600'
      case 'in_progress':
        return 'bg-yellow-600'
      case 'completed':
        return 'bg-gray-600'
      case 'cancelled':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'Open'
      case 'upcoming':
        return 'Upcoming'
      case 'in_progress':
        return 'Live'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const canRegister = tournament.status === 'registration_open' && !isRegistered
  const registrationEnded = new Date(tournament.registration_end) < new Date()

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-cyan-500 transition-colors">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(tournament.status)}`}>
              {getStatusText(tournament.status)}
            </span>
          </div>
          {tournament.prize_pool > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Prize Pool</div>
              <div className="text-2xl font-bold text-yellow-400">
                £{tournament.prize_pool.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {tournament.description && (
          <p className="text-gray-300 mb-4 line-clamp-2">{tournament.description}</p>
        )}

        {/* Tournament Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-300">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">Max {tournament.max_participants} players</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Trophy className="w-4 h-4 mr-2" />
            <span className="text-sm">{tournament.tournament_type.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{formatDate(tournament.tournament_start)}</span>
          </div>
          {tournament.entry_fee > 0 && (
            <div className="flex items-center text-gray-300">
              <span className="text-sm">Entry: £{tournament.entry_fee}</span>
            </div>
          )}
        </div>

        {/* Registration Info */}
        {tournament.status === 'registration_open' && (
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex items-center text-cyan-400 mb-1">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Registration closes:</span>
            </div>
            <div className="text-white text-sm">
              {formatDate(tournament.registration_end)}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          {canRegister && onRegister && (
            <button
              onClick={() => onRegister(tournament.id)}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Register Now
            </button>
          )}
          
          {isRegistered && (
            <div className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-center">
              ✓ Registered
            </div>
          )}
          
          {registrationEnded && tournament.status === 'upcoming' && (
            <div className="flex-1 bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium text-center">
              Registration Closed
            </div>
          )}
          
          {tournament.status === 'completed' && (
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              View Results
            </button>
          )}
          
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Details
          </button>
        </div>
      </div>
    </div>
  )
}


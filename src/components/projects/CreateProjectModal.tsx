'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/utils'
import type { TeamType } from '@/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Check, Globe, Lock, Plus, Users } from 'lucide-react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[4].value)
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [teamId, setTeamId] = useState('')
  const [teams, setTeams] = useState<TeamType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Inline team creation
  const [showNewTeam, setShowNewTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchTeams()
    }
  }, [isOpen])

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams')
      if (res.ok) {
        const data = await res.json()
        const teamList = Array.isArray(data) ? data : []
        setTeams(teamList)
        if (teamList.length > 0 && !teamId) {
          setTeamId(teamList[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    }
  }

  const handleCreateTeam = async () => {
    const trimmed = newTeamName.trim()
    if (!trimmed) return

    setCreatingTeam(true)
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (res.ok) {
        const team = await res.json()
        setTeams(prev => [...prev, team])
        setTeamId(team.id)
        setNewTeamName('')
        setShowNewTeam(false)
      }
    } catch (err) {
      console.error('Failed to create team:', err)
    } finally {
      setCreatingTeam(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Projektname ist erforderlich')
      return
    }
    if (!teamId) {
      setError('Bitte wählen Sie ein Team oder erstellen Sie ein neues')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || null,
          color,
          privacy,
          teamId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create project')
      }

      // Reset form
      setName('')
      setDescription('')
      setColor(PROJECT_COLORS[4].value)
      setPrivacy('public')
      setShowNewTeam(false)
      setNewTeamName('')

      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Projekt erstellen"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Projekt erstellen
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Message */}
        {error && (
          <div className="text-sm text-asana-danger bg-red-50 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Project Name */}
        <Input
          label="Projektname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Projektname eingeben..."
          autoFocus
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-asana-text-primary mb-1.5">
            Beschreibung
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Worum geht es in diesem Projekt?"
            rows={3}
            className={cn(
              'w-full px-3 py-2 text-sm bg-white border border-asana-border rounded-md resize-none',
              'placeholder:text-asana-text-secondary text-asana-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-asana-link focus:border-asana-link',
              'hover:border-gray-400 transition-colors'
            )}
          />
        </div>

        {/* Team Selection */}
        <div>
          <label className="block text-sm font-medium text-asana-text-primary mb-1.5">
            Team
          </label>

          {teams.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setTeamId(team.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
                      teamId === team.id
                        ? 'border-asana-link bg-blue-50 text-asana-link'
                        : 'border-asana-border text-asana-text-secondary hover:border-gray-400'
                    )}
                  >
                    <Users size={14} />
                    {team.name}
                  </button>
                ))}
              </div>

              {/* New Team inline */}
              {showNewTeam ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleCreateTeam() }
                      if (e.key === 'Escape') { setShowNewTeam(false); setNewTeamName('') }
                    }}
                    placeholder="Team-Name..."
                    autoFocus
                    className="flex-1 px-3 py-1.5 text-sm border border-asana-border rounded-md focus:outline-none focus:ring-2 focus:ring-asana-link focus:border-asana-link"
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateTeam}
                    loading={creatingTeam}
                    disabled={!newTeamName.trim()}
                  >
                    Erstellen
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setShowNewTeam(false); setNewTeamName('') }}
                    className="text-xs text-asana-text-secondary hover:text-asana-text-primary"
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewTeam(true)}
                  className="flex items-center gap-1.5 text-sm text-asana-link hover:text-asana-coral-hover transition-colors"
                >
                  <Plus size={14} />
                  Neues Team erstellen
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-asana-text-secondary">
                Erstellen Sie zuerst ein Team für Ihr Projekt.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleCreateTeam() }
                  }}
                  placeholder="z.B. Marketing, Entwicklung, Produktion..."
                  autoFocus={teams.length === 0}
                  className="flex-1 px-3 py-2 text-sm border border-asana-border rounded-md focus:outline-none focus:ring-2 focus:ring-asana-link focus:border-asana-link"
                />
                <Button
                  size="sm"
                  onClick={handleCreateTeam}
                  loading={creatingTeam}
                  disabled={!newTeamName.trim()}
                >
                  Team erstellen
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-asana-text-primary mb-2">
            Farbe
          </label>
          <div className="flex items-center gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-transform',
                  color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-asana-link' : 'hover:scale-105'
                )}
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {color === c.value && (
                  <Check size={14} className="text-white" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-medium text-asana-text-primary mb-2">
            Sichtbarkeit
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPrivacy('public')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border transition-colors flex-1',
                privacy === 'public'
                  ? 'border-asana-link bg-blue-50 text-asana-link'
                  : 'border-asana-border text-asana-text-secondary hover:border-gray-400'
              )}
            >
              <Globe size={16} />
              <div className="text-left">
                <div className="font-medium">Öffentlich</div>
                <div className="text-xs opacity-75">Sichtbar für das Team</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPrivacy('private')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border transition-colors flex-1',
                privacy === 'private'
                  ? 'border-asana-link bg-blue-50 text-asana-link'
                  : 'border-asana-border text-asana-text-secondary hover:border-gray-400'
              )}
            >
              <Lock size={16} />
              <div className="text-left">
                <div className="font-medium">Privat</div>
                <div className="text-xs opacity-75">Nur für Mitglieder</div>
              </div>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

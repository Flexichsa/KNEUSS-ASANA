'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/utils'
import type { TeamType } from '@/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Check, Globe, Lock } from 'lucide-react'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Projektname ist erforderlich')
      return
    }
    if (!teamId) {
      setError('Bitte wählen Sie ein Team')
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

      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const teamOptions = teams.map((t) => ({
    label: t.name,
    value: t.id,
  }))

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

        {/* Team */}
        <Select
          label="Team"
          value={teamId}
          onChange={setTeamId}
          options={teamOptions}
          placeholder="Team auswählen..."
        />

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

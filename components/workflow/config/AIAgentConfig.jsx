'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { dbClient } from '../../../lib/supabase/dbClient'
import { useAuth } from '../../providers/AuthProvider'
import Button from '../../ui/button'
import FormInput from '../../ui/formInputField'
export default function AIAgentConfig({ config, onSave, onClose }) {
  const [agents, setAgents] = useState([])
  const [selectedAgentId, setSelectedAgentId] = useState(config?.agentId || '')
  const [message, setMessage] = useState(config?.message || '')
  const [sessionId, setSessionId] = useState(config?.sessionId || '')
  const { user, profile, loading: authLoading } = useAuth()
  useEffect(() => {
    fetchAgents()
  }, [])
  // <- ADD THIS EFFECT
  useEffect(() => {
    setSelectedAgentId(config?.agentId || '')
    setMessage(config?.message || '')
    setSessionId(config?.sessionId || '')
  }, [config])
  const fetchAgents = async () => {
    try {
      const userAgents = await dbClient.getUserAgents(user?.id)
      console.log('Fetched agents:', userAgents)
      setAgents(userAgents || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    }
  }

  const handleSave = () => {
    if (!selectedAgentId) {
      toast.error('Please select an AI agent')
      return
    }
    if (!message) {
      toast.error('Please enter a message')
      return
    }

    onSave({
      agentId: selectedAgentId,
      message,
      sessionId
    })
  }

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Select AI Agent *
        </label>
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className='w-full rounded-lg bg-neutral-900 px-3 py-2'
        >
          <option value=''>Choose an agent...</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Message *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='w-full rounded-lg bg-neutral-800 px-3 py-2'
          rows='4'
          placeholder='Enter message for AI agent. Use {{node_id.field}} to reference data from previous nodes.'
        />
        <p className='mt-1 text-xs text-neutral-400'>
          Tip: Use{' '}
          <code className='rounded bg-neutral-800 px-1'>
            {'{{trigger_1.data}}'}
          </code>{' '}
          to access trigger data
        </p>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Session ID (Optional)
        </label>
        <FormInput
          className='w-full'
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder='e.g., user-123 or {{trigger_1.userId}}'
        />
      </div>

      <div className='flex justify-between space-x-3 pt-4'>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Submit</Button>
      </div>
    </div>
  )
}

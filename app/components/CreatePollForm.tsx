'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Candidate {
  name: string
  profile: string
}

export default function CreatePollForm() {
  const [position, setPosition] = useState('')
  const [description, setDescription] = useState('')
  const [candidates, setCandidates] = useState<Candidate[]>([{ name: '', profile: '' }])
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const response = await fetch('/api/polls', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ position, description, candidates }),
    })
    if (response.ok) {
      router.push('/polls')
      router.refresh()
    } else {
      alert('Failed to create poll')
    }
  }

  const addCandidate = () => {
    setCandidates([...candidates, { name: '', profile: '' }])
  }

  const updateCandidate = (index: number, field: keyof Candidate, value: string) => {
    const newCandidates = [...candidates]
    newCandidates[index][field] = value
    setCandidates(newCandidates)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700">
          Position
        </label>
        <input
          type="text"
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
        />
      </div>
      {candidates.map((candidate, index) => (
        <div key={index} className="space-y-2">
          <input
            type="text"
            placeholder="Candidate Name"
            value={candidate.name}
            onChange={(e) => updateCandidate(index, 'name', e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
          <textarea
            placeholder="Candidate Profile"
            value={candidate.profile}
            onChange={(e) => updateCandidate(index, 'profile', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addCandidate}
        className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Add Candidate
      </button>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Create Poll
      </button>
    </form>
  )
}


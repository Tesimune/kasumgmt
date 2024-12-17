'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Candidate {
  id: string;
  name: string;
  profile: string | null;
  pollId: string;
}

interface PollItemProps {
  id: string;
  position: string;
  description: string;
  candidates: {
    id: string;
    name: string;
    profile: string | null;
    pollId: string;
  }[];
  votes: { candidateId: string; user: {} }[];
  isUserVoted: boolean;
}

export default function PollItem({
  id,
  position,
  description,
  candidates,
  votes,
  isUserVoted,
}: PollItemProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    const counts = candidates.reduce((acc, candidate) => {
      acc[candidate.id] =
        votes?.filter((vote) => vote.candidateId === candidate.id).length || 0;
      return acc;
    }, {} as Record<string, number>);
    setVoteCounts(counts);
  }, [votes, candidates]);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    setIsVoting(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pollId: id, candidateId: selectedCandidate }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.ok) {
            alert(data.error);
          } else {
            router.refresh();
          }
        });
    } catch (error) {
      alert(error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className='border p-4 rounded-md shadow-sm'>
      <h3 className='text-xl font-semibold mb-2'>{position}</h3>
      {description && <p className='text-gray-600 mb-4'>{description}</p>}
      <form className='space-y-2'>
        {candidates.map((candidate) => (
          <div key={candidate.id} className='flex items-center justify-between'>
            <label className='flex items-center space-x-2'>
              <input
                type='radio'
                name='poll-candidate'
                value={candidate.id}
                checked={selectedCandidate === candidate.id}
                onChange={() => setSelectedCandidate(candidate.id)}
                className='form-radio text-green-600'
                disabled={isUserVoted}
              />
              <span>{candidate.name}</span>
            </label>
            <span className='text-sm text-gray-500'>
              {voteCounts[candidate.id] || 0} votes
            </span>
          </div>
        ))}
      </form>
      <button
        onClick={handleVote}
        disabled={isUserVoted || !selectedCandidate || isVoting}
        className='mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50'
      >
        {isVoting ? 'Casting Vote...' : 'Vote'}
      </button>
    </div>
  );
}

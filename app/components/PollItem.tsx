'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface Candidate {
  id: string;
  name: string;
  profile: string | null;
  pollId: string;
}

interface PollItemProps {
  id: string;
  position: string;
  description: string | null;
  candidates: Candidate[];
  votes: {
    candidateId: string;
    pollId: string;
    userId: string;
  }[];
  isUserVoted: boolean; // Backend provided
  isAdmin: boolean;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export default function PollItem({
  id,
  position,
  description,
  candidates,
  votes,
  isUserVoted,
  isAdmin,
}: PollItemProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  const router = useRouter();

  // Calculate vote counts
  useEffect(() => {
    const counts = candidates.reduce((acc, candidate) => {
      acc[candidate.id] = votes.filter(
        (vote) => vote.candidateId === candidate.id
      ).length;
      return acc;
    }, {} as Record<string, number>);
    setVoteCounts(counts);
  }, [votes, candidates]);

  // Handle voting
  const handleVote = async () => {
    if (!selectedCandidate || isAdmin) return;

    const userConfirmed = window.confirm(
      'Are you sure you want to cast your vote?'
    );
    if (!userConfirmed) return;

    setIsVoting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pollId: id, candidateId: selectedCandidate }),
      });

      if (!response.ok) {
        throw new Error('Failed to cast vote');
      }

      alert('Vote Recorded');
      router.refresh(); // Reload data from backend
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  // Prepare chart data
  const pieChartData = candidates.map((candidate) => ({
    name: candidate.name,
    value: voteCounts[candidate.id] || 0,
  }));

  return (
    <div className='border p-4 rounded-md shadow-sm'>
      <h3 className='text-xl font-semibold mb-2'>{position}</h3>
      {description && <p className='text-gray-600 mb-4'>{description}</p>}

      {/* Voting Form */}
      {!isUserVoted && !isAdmin ? (
        <form className='space-y-2'>
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className='flex items-center justify-between'
            >
              <label className='flex items-center space-x-2'>
                <input
                  type='radio'
                  name={`poll-candidate-${id}`} // Unique name per poll
                  value={candidate.id}
                  checked={selectedCandidate === candidate.id}
                  onChange={() => setSelectedCandidate(candidate.id)}
                  className='form-radio text-green-600'
                />
                <span>{candidate.name}</span>
              </label>
            </div>
          ))}
        </form>
      ) : (
        <div className='text-green-600 font-semibold'>Vote Recorded</div>
      )}

      {/* Submit Vote Button */}
      {!isUserVoted && !isAdmin && (
        <button
          onClick={handleVote}
          disabled={!selectedCandidate || isVoting}
          className='mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50'
        >
          {isVoting ? 'Casting Vote...' : 'Vote'}
        </button>
      )}

      {/* Admin Results Section */}
      {isAdmin && (
        <div className='mt-4'>
          <h4 className='text-lg font-semibold mb-2'>Results</h4>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

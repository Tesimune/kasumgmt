'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { getStartTime, getEndTime, formatTimeRemaining } from '../utils/timeUtils';

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
  isUserVoted: boolean; // Backend-provided
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
  isUserVoted: initialIsUserVoted,
  isAdmin,
}: PollItemProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [isUserVoted, setIsUserVoted] = useState(initialIsUserVoted);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isElectionEnded, setIsElectionEnded] = useState(false); // New state variable

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

  // Timer for voting
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const startTime = getStartTime();
      const endTime = getEndTime();

      if (now < startTime) {
        setTimeRemaining(startTime.getTime() - now.getTime());
      } else if (now >= startTime && now < endTime) {
        setTimeRemaining(endTime.getTime() - now.getTime());
      } else {
        setTimeRemaining(null);
        setIsElectionEnded(true); // Update to set election ended
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check if voting is allowed
  const isVotingAllowed = () => {
    const now = new Date();
    const startTime = getStartTime();
    const endTime = getEndTime();
    return now >= startTime && now < endTime;
  };

  // Handle voting
  const handleVote = async () => {
    if (!selectedCandidate || isAdmin) return;

    const userConfirmed = window.confirm(
      'Are you sure you want to cast this vote?'
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

      // Optimistically update the UI
      setVoteCounts((prev) => ({
        ...prev,
        [selectedCandidate]: (prev[selectedCandidate] || 0) + 1,
      }));
      setIsUserVoted(true);
      setSelectedCandidate(null);

      alert('Vote Recorded');
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  // Calculate total votes
  const calculateTotalVotes = () => {
    return Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
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

      {/* Timer Display */}
      <div className='mb-4'>
        {timeRemaining !== null ? (
          <p className='text-lg font-semibold'>
            {currentTime < getStartTime()
              ? 'Voting starts in: '
              : 'Voting ends in: '}
            {formatTimeRemaining(timeRemaining)}
          </p>
        ) : (
          <p className='text-lg font-semibold'>Voting has ended</p>
        )}
      </div>

      {/* Voting Form */}
      {!isUserVoted && !isAdmin && isVotingAllowed() ? (
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
        <div className='text-green-600 font-semibold'>
          {isUserVoted
            ? 'Vote Recorded'
            : !isVotingAllowed()
            ? 'Voting is not currently allowed'
            : ''}
        </div>
      )}

      {/* Submit Vote Button */}
      {!isUserVoted && !isAdmin && isVotingAllowed() && (
        <button
          onClick={handleVote}
          disabled={!selectedCandidate || isVoting}
          className='mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50'
        >
          {isVoting ? 'Casting Vote...' : 'Vote'}
        </button>
      )}

      {/* Results Section */}
      {(isAdmin || isElectionEnded) && (
        <div className='mt-4'>
          <div className='flex justify-between'>
            <h4 className='text-lg font-semibold mb-2'>Results</h4>
            {isAdmin && (
              <Link
                href={`/polls/${id}`}
                className='bg-green-600 text-white py-2 px-3 rounded-md'
              >
                View Details
              </Link>
            )}
          </div>
          {(isAdmin || isElectionEnded) && (
            <p className='text-xl font-bold mb-2'>
              Total Votes: {calculateTotalVotes()}
            </p>
          )}
          {isAdmin && (
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
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
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
          )}
        </div>
      )}
    </div>
  );
}


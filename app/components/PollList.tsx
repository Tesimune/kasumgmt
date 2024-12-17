'use client';

import { useEffect, useState } from 'react';
import PollItem from './PollItem';

interface Poll {
  id: string;
  position: string;
  description: string | null;
  candidates: {
    id: string;
    name: string;
    profile: string | null;
  }[];
  votes: {
    candidateId: string;
    user: { id: string };
  }[];
}

export default function PollList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserId(decodedToken.id);
    }

    const fetchPolls = async () => {
      const response = await fetch('/api/polls', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPolls(data);
      } else {
        console.error('Failed to fetch polls');
      }
    };

    fetchPolls();
  }, []);

  const hasUserVoted = (votes: { candidateId: string; user: { id: string } }[], userId: string | null) => {
    if (!userId) return false;

    return votes.some((vote) => vote.user.id === userId);
  };

  return (
    <div className="space-y-6">
      {polls.map((poll) => (
        <PollItem
          key={poll.id}
          id={poll.id}
          position={poll.position}
          description={poll.description || ''}
          candidates={poll.candidates.map((candidate) => ({
            ...candidate,
            pollId: poll.id,
          }))}
          votes={poll.votes}
          isUserVoted={hasUserVoted(poll.votes, userId)}
        />
      ))}
    </div>
  );
}

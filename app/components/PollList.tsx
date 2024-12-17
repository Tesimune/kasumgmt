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
    pollId: string;
    userId: string;
  }[];
}

interface User {
  id: string;
  role: string;
}

export default function PollList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPolls = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user data
        const userResponse = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else {
          throw new Error('Failed to fetch user data');
        }

        // Fetch polls
        const pollsResponse = await fetch('/api/polls', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (pollsResponse.ok) {
          const pollsData = await pollsResponse.json();
          setPolls(pollsData);
        } else {
          throw new Error('Failed to fetch polls');
        }
      } catch (error) {
        console.error('Error:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndPolls();
  }, []);

  const hasUserVoted = (votes: Poll['votes'], userId: string | null) => {
    if (!userId) return false;
    return votes.some((vote) => vote.userId === userId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view polls.</div>;
  }

  return (
    <div className='space-y-6'>
      {polls.map((poll) => (
        <PollItem
          key={poll.id}
          id={poll.id}
          position={poll.position}
          description={poll.description}
          candidates={poll.candidates.map((candidate) => ({
            ...candidate,
            pollId: poll.id,
          }))}
          votes={poll.votes}
          isUserVoted={hasUserVoted(poll.votes, user.id)}
          isAdmin={user.role === 'admin'}
        />
      ))}
    </div>
  );
}


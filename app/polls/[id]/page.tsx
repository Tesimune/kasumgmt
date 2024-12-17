'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';

interface Vote {
  id: string;
  user: { matric: string };
  candidate: { name: string };
  createdAt: string;
}

export default function AdminVotes() {
  const router = useRouter();
  const { id: pollId } = useParams();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    if (pollId && isAdmin) fetchVotes();
  }, [pollId, isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Unauthorized');

      const user = await response.json();
      if (user.role === 'admin') {
        setIsAdmin(true);
      } else {
        router.push('/polls');
      }
    } catch {
      router.push('/polls');
    }
  };

  const fetchVotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/polls/${pollId}/?pollId=${pollId}`);
      const data = await response.json();
      setVotes(data);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVote = async (voteId: string) => {
    if (!confirm('Are you sure you want to delete this vote?')) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/vote/${voteId}?id=${voteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete vote');

      alert('Vote deleted successfully');
      fetchVotes();
    } catch (error) {
      console.error('Error deleting vote:', error);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AuthWrapper>
      {isAdmin ? (
        <div className='max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-3xl font-bold'>Votes for Poll</h1>
            <button
              onClick={logout}
              className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
            >
              Log out
            </button>
          </div>

          {loading ? (
            <p>Loading votes...</p>
          ) : votes.length === 0 ? (
            <p>No votes found.</p>
          ) : (
            <table className='table-auto w-full border-collapse border border-gray-200'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border px-4 py-2 text-left'>Voter Matric</th>
                  <th className='border px-4 py-2 text-left'>Candidate</th>
                  <th className='border px-4 py-2 text-left'>Date</th>
                  <th className='border px-4 py-2 text-center'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote) => (
                  <tr key={vote.id} className='hover:bg-gray-50'>
                    <td className='border px-4 py-2'>{vote.user.matric}</td>
                    <td className='border px-4 py-2'>{vote.candidate.name}</td>
                    <td className='border px-4 py-2'>
                      {new Date(vote.createdAt).toLocaleString()}
                    </td>
                    <td className='border px-4 py-2 text-center'>
                      <button
                        onClick={() => handleDeleteVote(vote.id)}
                        className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <p>Checking authorization...</p>
      )}
    </AuthWrapper>
  );
}

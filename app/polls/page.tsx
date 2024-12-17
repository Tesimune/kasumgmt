'use client';

import { useRouter } from 'next/navigation';
import PollList from '../components/PollList';
import AuthWrapper from '../components/AuthWrapper';
import CreatePollForm from '../components/CreatePollForm';

export default function PollsPage() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AuthWrapper>
      <div className='max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Polls</h1>
          <button
            onClick={logout}
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
          >
            Log out
          </button>
        </div>
        {/* <div className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>Create a New Poll</h2>
          <CreatePollForm />
        </div> */}
        <div>
          <h2 className='text-2xl font-bold mb-4'>Current Polls</h2>
          <PollList />
        </div>
      </div>
    </AuthWrapper>
  );
}

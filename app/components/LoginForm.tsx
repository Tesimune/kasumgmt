'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFromToken } from '../lib/auth';

export default function LoginForm() {
  const [matric, setMatric] = useState('');
  const [password, setPassword] = useState('');
  const [login, setLogin] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await getUserFromToken(token);
        if (user) {
          router.push('/polls');
        }
      }
    };

    checkAuthentication();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    setLogin(true);
    e.preventDefault();
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matric, password }),
    });
    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem('token', token);
      router.push('/polls');
    } else {
      alert('Login failed');
    }
    setLogin(false);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='matric'
          className='block text-sm font-medium text-gray-700'
        >
          Matriculation Number
        </label>
        <input
          type='text'
          id='matric'
          value={matric}
          onChange={(e) => setMatric(e.target.value)}
          required
          className='py-2 px-3 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50'
        />
      </div>
      <div>
        <label
          htmlFor='password'
          className='block text-sm font-medium text-gray-700'
        >
          Password
        </label>
        <input
          type='password'
          id='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='py-2 px-3 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50'
        />
      </div>
      <button
        type='submit'
        className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        disabled={login}
      >
        {login ? 'Loading please wait...' : 'Log In'}
      </button>
    </form>
  );
}

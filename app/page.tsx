import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='flex flex-col items-center'>
          <Image
            src='/logo.jpg?height=100&width=100'
            alt='Voting Site Logo'
            width={100}
            height={100}
            className='mb-4'
          />
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Welcome to the Voting Site
          </h2>
        </div>
        <div className='mt-8 space-y-6'>
          <div className='rounded-md shadow'>
            <Link
              href='/login'
              className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10'
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

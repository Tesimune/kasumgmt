import { NextResponse } from 'next/server';
import { getUserFromToken, voteOnPoll } from '@/app/lib/auth';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pollId, candidateId } = await request.json();

  try {
    const vote = await voteOnPoll(user.id, pollId, candidateId);
    return NextResponse.json(vote);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}

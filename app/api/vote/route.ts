import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromToken, voteOnPoll } from '@/app/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { pollId, candidateId } = await request.json()

  try {
    const vote = await voteOnPoll( user.id, pollId, candidateId )
    return NextResponse.json(vote)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 400 })
  }
}


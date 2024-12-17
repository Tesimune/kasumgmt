import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromToken } from '@/app/lib/auth'

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

  const { position, description, candidates } = await request.json()
  try {
    const poll = await prisma.poll.create({
      data: {
        position,
        description,
        candidates: {
          create: candidates,
        },
      },
      include: {
        candidates: true,
      },
    })
    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const polls = await prisma.poll.findMany({
      include: {
        candidates: true,
        votes: {
          include: {
            user: true
          }
        },
      },
    })
    return NextResponse.json(polls)
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 400 })
  }
}


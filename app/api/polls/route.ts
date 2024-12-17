import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromToken } from '@/app/lib/auth'

const prisma = new PrismaClient()

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
            // user: true
          }
        },
      },
    })
    return NextResponse.json(polls)
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
}



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
    return NextResponse.json({ error }, { status: 400 })
  }
}

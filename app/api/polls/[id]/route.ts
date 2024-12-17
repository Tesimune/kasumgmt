import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pollId = url.searchParams.get('pollId');

  if (!pollId) {
    return NextResponse.json(
      { message: 'Poll ID is required.' },
      { status: 400 }
    );
  }

  try {
    const votes = await prisma.vote.findMany({
      where: { pollId },
      include: {
        user: { select: { matric: true } },
        candidate: { select: { name: true } },
      },
    });

    return NextResponse.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { message: 'Failed to fetch votes.' },
      { status: 500 }
    );
  }
}

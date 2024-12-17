import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { message: 'User ID is required.' },
      { status: 400 }
    );
  }


  try {
    await prisma.vote.delete({ where: { id } });
    return NextResponse.json({ message: 'Vote deleted successfully.' });
  } catch {
    return NextResponse.json({ message: 'Vote not found.' }, { status: 404 });
  }
}

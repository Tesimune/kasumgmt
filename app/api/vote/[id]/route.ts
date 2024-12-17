import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.vote.delete({ where: { id } });
    return NextResponse.json({ message: 'Vote deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ message: 'Vote not found.' }, { status: 404 });
  }
}

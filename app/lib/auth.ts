import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function signUp(matric: string, password: string) {
  if (!matric || !password) {
    throw new Error('Matric and password are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        matric,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    return { user, token };
  } catch {
    throw new Error('Failed to create user');
  }
}

export async function login(matric: string, password: string) {
  const user = await prisma.user.findUnique({ where: { matric } });
  if (!user) {
    throw new Error('User not found');
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
  return { user, token };
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch {
    throw new Error('Invalid token');
  }
}

export async function voteOnPoll(
  userId: string,
  pollId: string,
  candidateId: string
) {
  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        pollId,
      },
    });

    if (existingVote) {
      throw new Error('User has already voted on this poll');
    }

    const pollExists = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!pollExists) {
      throw new Error('Poll not found');
    }

    const candidateExists = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        pollId,
      },
    });

    if (!candidateExists) {
      throw new Error(
        'Candidate not found or does not belong to the specified poll'
      );
    }

    const newVote = await prisma.vote.create({
      data: {
        userId,
        pollId,
        candidateId,
      },
    });

    return newVote;
  } catch (error) {
    throw error;
  }
}

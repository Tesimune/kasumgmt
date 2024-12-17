import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "kasumgmt.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: 'File not found at specified path' },
        { status: 400 }
      );
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const users = data.map((record: any) => ({
      matric: record.matric,
      password: bcrypt.hash(
        record.password ? record.password : 'kaduna',
        10
      ),
    }));

    const resolvedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await user.password,
      }))
    );

    await prisma.user.createMany({ data: resolvedUsers });

    return NextResponse.json(
      { message: 'Data successfully uploaded!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading data:', error);
    return NextResponse.json(
      { message: 'Internal server error', error },
      { status: 500 }
    );
  }
}

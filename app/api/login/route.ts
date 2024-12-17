import { NextResponse } from 'next/server'
import { login } from '@/app/lib/auth'

export async function POST(request: Request) {
  const { matric, password } = await request.json()
  try {
    const { user, token } = await login(matric, password)
    return NextResponse.json({ user, token })
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
}


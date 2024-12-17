import { NextResponse } from 'next/server'
import { login } from '@/app/lib/auth'

export async function POST(request: Request) {
  const { matric, password } = await request.json()
  try {
    const { user, token } = await login(matric, password)
    return NextResponse.json({ user, token })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 400 })
  }
}


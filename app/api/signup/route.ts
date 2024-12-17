import { NextResponse } from 'next/server'
import { signUp } from '@/app/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received data:', body) // Add this line

    const { matric, password } = body
    
    if (!matric || !password) {
      return NextResponse.json({ error: 'Matric and password are required' }, { status: 400 })
    }

    const { user, token } = await signUp(matric, password)
    return NextResponse.json({ user, token })
  } catch (error) {
    console.error('Signup error:', error) // Add this line
    return NextResponse.json({ error: 'Signup failed' }, { status: 400 })
  }
}


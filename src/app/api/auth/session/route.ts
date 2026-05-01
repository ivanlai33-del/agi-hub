import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const session = cookies().get('agi_hub_session')?.value;
  
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = Buffer.from(session, 'base64').toString('utf-8');
    const [userId, role] = decoded.split(':');
    return NextResponse.json({ 
      authenticated: true, 
      userId, 
      role 
    });
  } catch (e) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

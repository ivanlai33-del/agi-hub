import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersPath = path.join(process.cwd(), 'src/data/users.json');

export async function GET() {
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  // Remove passwords before sending to client
  const safeUsers = users.map((u: any) => ({ userId: u.userId, role: u.role }));
  return NextResponse.json(safeUsers);
}

export async function POST(req: Request) {
  try {
    const newUser = await req.json();
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    // Check if user exists
    const index = users.findIndex((u: any) => u.userId === newUser.userId);
    if (index > -1) {
      users[index] = { ...users[index], ...newUser };
    } else {
      users.push(newUser);
    }
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();
    let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    if (userId === 'ivan') {
      return NextResponse.json({ error: 'Cannot delete admin account' }, { status: 403 });
    }
    
    users = users.filter((u: any) => u.userId !== userId);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

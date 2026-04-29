import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/brains.json');

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Brains not found' }, { status: 404 });
  }
}

export async function POST(req: Request) {
  try {
    const newBrain = await req.json();
    const data = fs.readFileSync(filePath, 'utf8');
    const brains = JSON.parse(data);
    
    // Check if updating existing or adding new
    const index = brains.findIndex((b: any) => b.id === newBrain.id);
    if (index !== -1) {
      brains[index] = newBrain;
    } else {
      brains.unshift(newBrain);
    }
    
    fs.writeFileSync(filePath, JSON.stringify(brains, null, 2));
    return NextResponse.json({ success: true, brain: newBrain });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save brain' }, { status: 500 });
  }
}

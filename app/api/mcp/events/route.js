import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'all';
    
    let data = [];

    if (action === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      data = await Event.find({ date: { $gte: today } });
    } else if (action === 'club') {
      const name = searchParams.get('name');
      if (name) {
        data = await Event.find({ organizingClub: { $regex: name, $options: 'i' } });
      }
    } else if (action === 'clubs') {
      const names = searchParams.get('names');
      if (names) {
        const clubList = names.split(',').map(n => n.trim());
        data = await Event.find({ organizingClub: { $in: clubList } });
      }
    } else {
      data = await Event.find({});
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch events data' }, { status: 500 });
  }
}
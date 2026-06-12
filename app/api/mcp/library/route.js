import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/lib/models/Book';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'all';
    
    let data = [];

    if (action === 'available') {
      data = await Book.find({ availableCopies: { $gt: 0 } });
    } else if (action === 'search') {
      const q = searchParams.get('q');
      if (q) {
        data = await Book.find({ title: { $regex: q, $options: 'i' } });
      } else {
        data = await Book.find({});
      }
    } else {
      data = await Book.find({});
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch library data' }, { status: 500 });
  }
}
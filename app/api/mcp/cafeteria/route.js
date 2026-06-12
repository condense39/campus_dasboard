import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MenuItem from '@/lib/models/MenuItem';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'all';
    
    let data = [];

    if (action === 'today') {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      data = await MenuItem.find({ day: today });
    } else if (action === 'day') {
      const day = searchParams.get('day');
      data = await MenuItem.find({ day: day });
    } else if (action === 'meal') {
      const type = searchParams.get('type');
      data = await MenuItem.find({ mealType: type });
    } else if (action === 'veg') {
      data = await MenuItem.find({ isVeg: true });
    } else if (action === 'dishes') {
      const names = searchParams.get('names');
      if (names) {
        data = await MenuItem.find({ itemName: { $in: names.split(',').map(n => n.trim()) } });
      }
    } else {
      data = await MenuItem.find({});
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch cafeteria data' }, { status: 500 });
  }
}
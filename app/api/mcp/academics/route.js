import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import Branch from '@/lib/models/Branch';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    let data = [];

    if (action === 'branches') {
      const branches = await Branch.find({}, { name: 1, _id: 0 });
      data = branches.map(b => b.name);
    } else if (action === 'courses') {
      const branch = searchParams.get('branch');
      const semester = searchParams.get('semester');
      if (branch && semester) {
        data = await Course.find({ branch: branch, semester: parseInt(semester) });
      }
    } else if (action === 'allcourses') {
      const branch = searchParams.get('branch');
      if (branch) {
        data = await Course.find({ branch: branch });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch academics data' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getUserByEmail, updateUser } from '@/lib/user-store';
import { connectDB } from '@/lib/mongodb';
import eventsData from '../../../data/events.json';
import cafeteriaData from '../../../data/cafeteria.json';
import branchesData from '../../../data/branches.json';

function formatUser(doc) {
  if (!doc) return null;
  const obj = { ...doc };
  if (obj._id) obj._id = obj._id.toString();
  delete obj.__v;
  return obj;
}

export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(formatUser(user));
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { username, branch, year, semester, clubs, favDishes, isOnboarded } = body;

    const validatedFields = {};
    if (username !== undefined) validatedFields.username = username;
    if (year !== undefined) validatedFields.year = year;
    if (semester !== undefined) validatedFields.semester = semester;
    if (isOnboarded !== undefined) validatedFields.isOnboarded = Boolean(isOnboarded);

    if (branch !== undefined) {
      if (branch && !branchesData.includes(branch)) {
        return NextResponse.json({ error: 'Invalid branch' }, { status: 400 });
      }
      validatedFields.branch = branch;
    }

    if (clubs !== undefined) {
      if (!Array.isArray(clubs)) {
        return NextResponse.json({ error: 'Clubs must be an array' }, { status: 400 });
      }
      const validClubs = new Set(eventsData.map(e => e['Organizing Club']).filter(Boolean));
      for (const c of clubs) {
        if (!validClubs.has(c)) {
          return NextResponse.json({ error: `Invalid club: ${c}` }, { status: 400 });
        }
      }
      validatedFields.clubs = clubs;
    }

    if (favDishes !== undefined) {
      if (!Array.isArray(favDishes)) {
        return NextResponse.json({ error: 'Favourite dishes must be an array' }, { status: 400 });
      }
      const validDishes = new Set(cafeteriaData.map(d => d['Item Name']).filter(Boolean));
      for (const d of favDishes) {
        if (!validDishes.has(d)) {
          return NextResponse.json({ error: `Invalid dish: ${d}` }, { status: 400 });
        }
      }
      validatedFields.favDishes = favDishes;
    }

    const updatedUser = await updateUser(session.user.email, validatedFields);
    return NextResponse.json(formatUser(updatedUser));
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
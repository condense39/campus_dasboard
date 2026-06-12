'use client';

import { useState, useEffect } from 'react';
import { Utensils, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function DashboardWidgets({ user }) {
  const [menu, setMenu] = useState(null);
  const [events, setEvents] = useState(null);
  const [courses, setCourses] = useState(null);
  
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    // 1. Fetch Menu
    fetch('/api/mcp/cafeteria?action=today')
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          const grouped = data.data.reduce((acc, curr) => {
            if(!acc[curr.mealType]) acc[curr.mealType] = [];
            acc[curr.mealType].push(curr);
            return acc;
          }, {});
          setMenu(grouped);
        }
      })
      .finally(() => setLoadingMenu(false));

    // 2. Fetch Events
    if (user?.clubs && user.clubs.length > 0) {
      const clubsQuery = user.clubs.join(',');
      fetch(`/api/mcp/events?action=clubs&names=${encodeURIComponent(clubsQuery)}`)
        .then(res => res.json())
        .then(data => {
          if(data.success) {
             const today = new Date().toISOString().split('T')[0];
             const upcoming = data.data.filter(e => String(e.date) >= today).slice(0, 4);
             setEvents(upcoming);
          }
        })
        .finally(() => setLoadingEvents(false));
    } else {
      setEvents([]);
      setLoadingEvents(false);
    }

    // 3. Fetch Courses
    if (user?.branch && user?.semester) {
      fetch(`/api/mcp/academics?action=courses&branch=${encodeURIComponent(user.branch)}&semester=${user.semester}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setCourses(data.data);
        })
        .finally(() => setLoadingCourses(false));
    } else {
      setCourses([]);
      setLoadingCourses(false);
    }
  }, [user]);

  const Skeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Widget 1: Today's Menu */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900">Today's Menu</h2>
        </div>
        {loadingMenu ? <Skeleton /> : (
          !menu || Object.keys(menu).length === 0 ? (
            <p className="text-sm text-gray-500">No menu data for today.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(menu).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{type}</h3>
                  <ul className="space-y-2">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-800">{item.itemName}</span>
                        <span className="text-gray-400 text-xs">₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Widget 2: My Club Events */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900">My Club Events</h2>
        </div>
        {loadingEvents ? <Skeleton /> : (
          !user?.clubs?.length ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-800 mb-2">Add clubs to your profile to see your club events here.</p>
              <p className="text-xs text-green-600 font-medium">Use Edit Profile to add clubs.</p>
            </div>
          ) : events?.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming events for your clubs.</p>
          ) : (
            <div className="space-y-4">
              {events.map((e, idx) => (
                <div key={idx} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <h3 className="font-bold text-gray-900 text-sm">{e.eventName}</h3>
                  <p className="text-xs text-green-600 font-medium my-1">{e.organizingClub}</p>
                  <p className="text-xs text-gray-500">{e.date} • {e.venue || 'TBA'}</p>
                </div>
              ))}
              <div className="pt-2">
                 <Link href="/search" className="text-sm font-medium text-green-600 hover:text-green-700">See all in Search &rarr;</Link>
              </div>
            </div>
          )
        )}
      </div>

      {/* Widget 3: My Courses */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
        </div>
        {loadingCourses ? <Skeleton /> : (
          !courses || courses.length === 0 ? (
            <p className="text-sm text-gray-500">No courses found for your branch and semester.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {courses.map((c, idx) => (
                <div key={idx} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-green-600 text-xs">{c.courseCode}</span>
                    <span className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      {c.credits} CR
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{c.courseName}</span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
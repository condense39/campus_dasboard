'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import MultiSelect from '@/components/MultiSelect';

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  
  const [branches, setBranches] = useState([]);
  const [clubsList, setClubsList] = useState([]);
  const [dishesList, setDishesList] = useState([]);
  
  const [username, setUsername] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [clubs, setClubs] = useState([]);
  const [favDishes, setFavDishes] = useState([]);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    } else if (status === 'authenticated' && session?.user?.isOnboarded) {
      window.location.href = '/';
    }
  }, [status, session]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [branchRes, eventRes, cafeRes] = await Promise.all([
          fetch('/api/mcp/academics?action=branches'),
          fetch('/api/mcp/events?action=all'),
          fetch('/api/mcp/cafeteria?action=all')
        ]);
        
        if (branchRes.ok) {
          const data = await branchRes.json();
          setBranches(data.data || []);
        }
        
        if (eventRes.ok) {
          const data = await eventRes.json();
          const eventsData = data.data || [];
          const uniqueClubs = [...new Set(eventsData.map(e => e['Organizing Club']).filter(Boolean))];
          setClubsList(uniqueClubs.sort());
        }
        
        if (cafeRes.ok) {
          const data = await cafeRes.json();
          const cafeData = data.data || [];
          const uniqueDishes = [...new Set(cafeData.map(d => d['Item Name']).filter(Boolean))];
          setDishesList(uniqueDishes.sort());
        }
      } catch (err) {
        console.error("Failed to fetch reference data", err);
      }
    }
    fetchData();
  }, []);

  const getSemestersForYear = (y) => {
    switch (y) {
      case '1st Year': return ['1', '2'];
      case '2nd Year': return ['3', '4'];
      case '3rd Year': return ['5', '6'];
      case '4th Year': return ['7', '8'];
      default: return [];
    }
  };
  
  const availableSemesters = getSemestersForYear(year);

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setYear(newYear);
    const validSems = getSemestersForYear(newYear);
    if (!validSems.includes(semester)) {
      setSemester('');
    }
  };

  const isFormValid = username.trim() !== '' && branch !== '' && year !== '' && semester !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          branch,
          year,
          semester,
          clubs,
          favDishes,
          isOnboarded: true
        })
      });
      
      if (res.ok) {
        await update(); // Refresh session data
        window.location.href = '/';
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && session?.user?.isOnboarded)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete your profile</h1>
          <p className="text-gray-500">Help us personalise your campus experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              type="text"
              required
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
            <select
              required
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-black"
            >
              <option value="" disabled>Select your branch</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <select
                required
                value={year}
                onChange={handleYearChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-black"
              >
                <option value="" disabled>Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={!year}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-black disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="" disabled>{year ? "Select semester" : "Select year first"}</option>
                {availableSemesters.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clubs (Optional)</label>
            <MultiSelect 
              options={clubsList} 
              selected={clubs} 
              onChange={setClubs} 
              placeholder="Search and select clubs..." 
              colorClass="bg-green-100 text-green-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Favourite Dishes (Optional)</label>
            <MultiSelect 
              options={dishesList} 
              selected={favDishes} 
              onChange={setFavDishes} 
              placeholder="Search and select dishes..." 
              colorClass="bg-gray-200 text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSaving}
            className="w-full flex items-center justify-center py-3 px-4 mt-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Save and continue
          </button>
        </form>
      </div>
    </div>
  );
}
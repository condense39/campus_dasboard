'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import MultiSelect from './MultiSelect';

export default function EditProfileModal({ isOpen, onClose, user }) {
  const { update } = useSession();
  
  const [branches, setBranches] = useState([]);
  const [clubsList, setClubsList] = useState([]);
  const [dishesList, setDishesList] = useState([]);

  const [username, setUsername] = useState(user?.username || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [year, setYear] = useState(user?.year || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [clubs, setClubs] = useState(user?.clubs || []);
  const [favDishes, setFavDishes] = useState(user?.favDishes || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername(user?.username || '');
      setBranch(user?.branch || '');
      setYear(user?.year || '');
      setSemester(user?.semester || '');
      setClubs(user?.clubs || []);
      setFavDishes(user?.favDishes || []);
    }
  }, [isOpen, user]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bRes, eRes, cRes] = await Promise.all([
          fetch('/api/mcp/academics?action=branches'),
          fetch('/api/mcp/events?action=all'),
          fetch('/api/mcp/cafeteria?action=all')
        ]);
        if (bRes.ok) {
          const resData = await bRes.json();
          setBranches(resData.data || []);
        }
        if (eRes.ok) {
          const resData = await eRes.json();
          const evData = resData.data || [];
          setClubsList([...new Set(evData.map(e => e.organizingClub || e['Organizing Club']).filter(Boolean))].sort());
        }
        if (cRes.ok) {
          const resData = await cRes.json();
          const cafeData = resData.data || [];
          setDishesList([...new Set(cafeData.map(d => d.itemName || d['Item Name']).filter(Boolean))].sort());
        }
      } catch(e) {}
    }
    fetchData();
  }, []);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, branch, year, semester, clubs, favDishes })
      });
      if (res.ok) {
        await update(); // Update NextAuth session
        window.location.reload(); // Force hard reload to update server components like ProfileCard
      } else {
        alert('Failed to save changes');
        setIsSaving(false);
      }
    } catch(err) {
      alert('Error saving changes');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none text-black">
              <option value="" disabled>Select branch</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year (Read-Only)</label>
              <select disabled value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 outline-none">
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester (Read-Only)</label>
              <select disabled value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 outline-none">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clubs</label>
            <MultiSelect options={clubsList} selected={clubs} onChange={setClubs} placeholder="Search clubs..." colorClass="bg-green-100 text-green-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Favourite Dishes</label>
            <MultiSelect options={dishesList} selected={favDishes} onChange={setFavDishes} placeholder="Search dishes..." colorClass="bg-gray-200 text-gray-800" />
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
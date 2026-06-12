'use client';

import { useState } from 'react';
import EditProfileModal from './EditProfileModal';

export default function ProfileCard({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initials = user?.username ? user.username.substring(0,2).toUpperCase() : '??';

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-600 p-6 relative mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <span className="bg-green-50 text-green-800 px-3 py-1 rounded-md text-sm font-medium">{user?.branch}</span>
          <span className="bg-green-50 text-green-800 px-3 py-1 rounded-md text-sm font-medium">{user?.year}</span>
          <span className="bg-green-50 text-green-800 px-3 py-1 rounded-md text-sm font-medium">Semester {user?.semester}</span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">My Clubs:</h3>
            <div className="flex flex-wrap gap-2">
              {user?.clubs?.length > 0 ? user.clubs.map(club => (
                <span key={club} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">{club}</span>
              )) : <p className="text-sm text-gray-400">No clubs added yet</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Favourite dishes:</h3>
            <div className="flex flex-wrap gap-2">
              {user?.favDishes?.length > 0 ? user.favDishes.map(dish => (
                <span key={dish} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">{dish}</span>
              )) : <p className="text-sm text-gray-400">No favourites added yet</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
    </>
  );
}
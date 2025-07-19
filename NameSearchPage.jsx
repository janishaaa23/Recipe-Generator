import React, { useState, useEffect } from 'react';
import NameSearch from '../components/NameSearch';
import Auth from '../components/Auth';
import { useNavigate } from 'react-router-dom';

export default function NameSearchPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/user/me', {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.data) setUser(data.data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7fa] to-[#dbeafe] dark:from-gray-900 dark:to-gray-800 transition-all duration-300 pb-10">
      <button
        onClick={() => navigate('/')}
        className="mt-6 ml-6 px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition mb-6"
      >
        ← Back to Choices
      </button>
      <Auth user={user} setUser={setUser} />
      <div className="flex flex-col items-center px-4 sm:px-8">
        {user && <NameSearch user={user} />}
      </div>
    </div>
  );
} 
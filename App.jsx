import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from './components/ThemeToggle';
import SavedRecipes from './pages/SavedRecipesPage';
import IngredientSearch from './pages/IngredientSearchPage';
import NameSearch from './pages/NameSearchPage';
import Auth from './components/Auth';

function Header({ user, setUser }) {
  const navigate = useNavigate();
  // Logout logic
  const handleLogout = async () => {
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/user/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      navigate('/');
    } catch (err) {
      // Optionally show error
    }
  };
  return (
    <div className="absolute top-0 right-0 flex items-center gap-2 px-6 pt-6 z-10">
      <span className="mr-4 text-gray-700 dark:text-gray-200 font-semibold text-base">
        {user?.fullname || user?.email}
      </span>
      <ThemeToggle small />
      <button
        onClick={handleLogout}
        className="ml-2 px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold shadow transition"
      >
        Logout
      </button>
    </div>
  );
}

function PageWrapper({ user, setUser, children }) {
  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-[#f4f7fa] to-[#dbeafe] dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      <Header user={user} setUser={setUser} />
      <div className="flex flex-col items-center w-full max-w-2xl pt-32">
        {children}
      </div>
    </div>
  );
}

function LandingPage({ user, setUser }) {
  return (
    <PageWrapper user={user} setUser={setUser}>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-300">
          Recipe Wizard 🧙‍♂️
        </h1>
      </motion.div>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <Link to="/saved" className="block bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-4 rounded-xl shadow-lg text-center transition-all duration-300">Saved Recipes</Link>
        <Link to="/ingredient" className="block bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold py-4 rounded-xl shadow-lg text-center transition-all duration-300">Find by Ingredient</Link>
        <Link to="/name" className="block bg-purple-500 hover:bg-purple-600 text-white text-lg font-semibold py-4 rounded-xl shadow-lg text-center transition-all duration-300">Find by Name</Link>
      </div>
    </PageWrapper>
  );
}

function SavedRecipesPageWrapper({ user, setUser }) {
  return (
    <PageWrapper user={user} setUser={setUser}>
      <SavedRecipes user={user} />
    </PageWrapper>
  );
}

function IngredientSearchPageWrapper({ user, setUser }) {
  return (
    <PageWrapper user={user} setUser={setUser}>
      <IngredientSearch user={user} />
    </PageWrapper>
  );
}

function NameSearchPageWrapper({ user, setUser }) {
  return (
    <PageWrapper user={user} setUser={setUser}>
      <NameSearch user={user} />
    </PageWrapper>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/user/me', {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.data) setUser(data.data);
      });
  }, []);

  // Show Auth page with light background only
  if (!user && location.pathname === '/') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f7fa] to-[#dbeafe] dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
        <Auth user={user} setUser={setUser} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} setUser={setUser} />} />
      <Route path="/saved" element={<SavedRecipesPageWrapper user={user} setUser={setUser} />} />
      <Route path="/ingredient" element={<IngredientSearchPageWrapper user={user} setUser={setUser} />} />
      <Route path="/name" element={<NameSearchPageWrapper user={user} setUser={setUser} />} />
    </Routes>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

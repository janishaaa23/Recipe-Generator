import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const API_USER = import.meta.env.VITE_API_URL + '/api/user';

export default function Auth({ onAuthChange, user, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullname: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const body = isLogin ? { email: form.email, password: form.password } : form;
      const res = await fetch(API_USER + endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');
      setUser(data.data);
      onAuthChange && onAuthChange(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_USER + '/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Logout failed');
      setUser(null);
      onAuthChange && onAuthChange(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-32 px-4"
    >
      <div className="backdrop-blur-2xl bg-white/10 dark:bg-gray-800/30 shadow-xl border border-white/20 dark:border-gray-700 rounded-3xl p-8 w-full max-w-md mx-auto transition-all">
        <h2 className="text-2xl font-bold text-center mb-6 text-white tracking-wide">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <FaUser className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  value={form.fullname}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100/90 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100/90 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100/90 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white py-2 rounded-full font-semibold shadow-lg transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-blue-400 hover:text-blue-200 transition-colors"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>

        {error && <div className="mt-4 text-red-400 text-sm text-center">{error}</div>}
      </div>
    </motion.div>
  );
}

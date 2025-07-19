import React, { useState } from 'react';

// Improved StarRating with hover effect
function StarRating({ rating, setRating }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => setRating(star)}
          className={`text-2xl transition-colors ${
            (hovered || rating) >= star
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {rating ? `${rating} / 5` : 'No rating'}
      </span>
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_URL + '/api/recipe';

export default function NameSearch({ user, onSave }) {
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [rating, setRating] = useState(0);

  const fetchRecipe = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setSavedMsg('');
    try {
      const res = await fetch(`${API_BASE}/by-name`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch recipe');
      setResult(data.data);
      setRating(0); // Reset rating for new result
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    setSavedMsg('');
    try {
      const res = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          content: result,
          searchType: 'name',
          rating,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save recipe');
      setSavedMsg(`✅ Saved: ${data.data.title}`);
      onSave && onSave();
    } catch (err) {
      setSavedMsg(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-xl mx-auto mb-6 transition-colors duration-300 border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">🔍 Search Recipe by Name</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchRecipe();
        }}
        className="flex gap-3 mb-6"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
          placeholder="e.g. Pasta"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
        >
          Search
        </button>
      </form>

      {loading && (
        <div className="text-blue-500 font-medium animate-pulse mb-4">Loading recipe...</div>
      )}

      {error && (
        <div className="text-red-600 font-medium mb-4">{error}</div>
      )}

      {savedMsg && (
        <div className={`font-medium mb-4 ${savedMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
          {savedMsg}
        </div>
      )}

      {result && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 shadow-inner transition">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{result.title}</h3>
          {result.image && (
            <img
              src={result.image}
              alt={result.title}
              className="w-full rounded-lg mb-4 border dark:border-gray-600"
            />
          )}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">🧂 Ingredients</h4>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm">
              {result.ingredients?.map((ing, idx) => (
                <li key={idx}>{ing.original}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">📋 Instructions</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {result.instructions || 'No instructions available.'}
            </p>
          </div>

          <StarRating rating={rating} setRating={setRating} />

          {user && (
            <button
              onClick={saveRecipe}
              disabled={rating === 0}
              className={`mt-3 w-full text-center py-2 rounded-lg font-medium transition ${
                rating === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Save Recipe
            </button>
          )}
        </div>
      )}
    </div>
  );
}

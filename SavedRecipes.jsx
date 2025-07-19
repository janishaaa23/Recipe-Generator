import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL + '/api/recipe';

function StarRatingDisplay({ rating }) {
  return (
    <div className="flex items-center mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {rating ? `${rating} / 5` : 'No rating'}
      </span>
    </div>
  );
}

function RecipeCard({ recipe, onDelete }) {
  let content = {};
  try {
    content = JSON.parse(recipe.content);
  } catch (e) {}

  return (
    <div className="flex flex-col justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white truncate">{recipe.title}</h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${recipe.searchType === 'ingredient' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-white'}`}>
            {recipe.searchType}
          </span>
        </div>
        {content.image && <img src={content.image} alt={recipe.title} className="rounded-lg mb-3 w-full object-cover max-h-40" />}
        {content.summary && (
          <div className="mb-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3" dangerouslySetInnerHTML={{ __html: content.summary }} />
        )}
        <div className="mb-2">
          <p className="font-semibold text-gray-800 dark:text-white">Ingredients:</p>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
            {content.ingredients?.map((ing, i) => (
              <li key={i}>{ing.original}</li>
            ))}
          </ul>
        </div>
        <div className="mb-2">
          <p className="font-semibold text-gray-800 dark:text-white">Instructions:</p>
          <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
            {content.instructions || 'No instructions.'}
          </p>
        </div>
        {content.sourceUrl && (
          <a
            href={content.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            View Source
          </a>
        )}
        {typeof recipe.rating === 'number' && <StarRatingDisplay rating={recipe.rating} />}
      </div>
      <div className="mt-4 text-right">
        <button
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors duration-200"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function SavedRecipes({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const fetchSaved = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/saved`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch saved recipes');
      setRecipes(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSaved();
    else setRecipes([]);
  }, [user]);

  const deleteRecipe = async (id) => {
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete recipe');
      setMsg('Deleted!');
      fetchSaved();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 w-full max-w-6xl mx-auto mb-6 transition-colors duration-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Your Saved Recipes</h2>
      {loading && <div className="text-blue-600 dark:text-blue-400">Loading...</div>}
      {error && <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>}
      {msg && <div className="text-green-600 dark:text-green-400 mb-2">{msg}</div>}
      {!loading && recipes.length === 0 && (
        <div className="text-gray-500 dark:text-gray-400">You haven’t saved any recipes yet.</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id} recipe={recipe} onDelete={() => deleteRecipe(recipe._id)} />
        ))}
      </div>
    </div>
  );
}

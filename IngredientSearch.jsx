import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL + '/api/recipe';

function StarRating({ rating, setRating }) {
  return (
    <div className="flex items-center mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl focus:outline-none transition-colors duration-200 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
          onClick={() => setRating(star)}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{rating ? `${rating} / 5` : 'No rating'}</span>
    </div>
  );
}

export default function IngredientSearch({ user, onSave }) {
  const [ingredients, setIngredients] = useState(['']);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [ratings, setRatings] = useState({});

  const handleIngredientChange = (idx, value) => {
    const newIngredients = [...ingredients];
    newIngredients[idx] = value;
    setIngredients(newIngredients);
  };
  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (idx) => setIngredients(ingredients.filter((_, i) => i !== idx));

  const fetchRecipes = async () => {
    setLoading(true);
    setError('');
    setRecipes([]);
    setSavedMsg('');
    setRatings({});
    try {
      const res = await fetch(`${API_BASE}/by-ingredients`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredients.filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch recipes');
      setRecipes(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipe) => {
    setSavedMsg('');
    const rating = ratings[recipe.id] || 0;
    try {
      const res = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: recipe.title, content: recipe, searchType: 'ingredient', rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save recipe');
      setSavedMsg(`Saved: ${data.data.title}`);
      onSave && onSave();
    } catch (err) {
      setSavedMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-xl rounded-3xl p-8 w-full max-w-4xl mb-10 transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">Search Recipes by Ingredients</h2>
      <form onSubmit={e => { e.preventDefault(); fetchRecipes(); }} className="space-y-4">
        {ingredients.map((ing, idx) => (
          <div key={idx} className="flex items-center">
            <input
              type="text"
              value={ing}
              onChange={e => handleIngredientChange(idx, e.target.value)}
              className="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 mr-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder={`Ingredient ${idx + 1}`}
              required
            />
            {ingredients.length > 1 && (
              <button type="button" onClick={() => removeIngredient(idx)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-lg font-bold px-2 transition-transform duration-200">&times;</button>
            )}
          </div>
        ))}
        <div className="flex justify-between items-center gap-4">
          <button type="button" onClick={addIngredient} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200">+ Add Ingredient</button>
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md font-semibold transition-all duration-300">Find Recipes</button>
        </div>
      </form>
      {loading && <div className="mt-4 text-center text-blue-600 dark:text-blue-400">Searching for delicious ideas...</div>}
      {error && <div className="mt-4 text-center text-red-600 dark:text-red-400">{error}</div>}
      {savedMsg && <div className="mt-4 text-center text-green-600 dark:text-green-400">{savedMsg}</div>}
      {recipes.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, idx) => (
              <div key={recipe.id || idx} className="bg-white dark:bg-gray-700 shadow-md rounded-xl p-5 flex flex-col">
                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">{recipe.title}</h3>
                {recipe.image && <img src={recipe.image} alt={recipe.title} className="mb-3 rounded-md object-cover w-full h-48" />}
                {recipe.summary && <div className="mb-2 text-sm text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{__html: recipe.summary}} />}
                <div className="mb-2">
                  <b className="text-gray-800 dark:text-white">Ingredients:</b>
                  <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                    {recipe.ingredients?.map((ing, i) => (
                      <li key={i}>{ing.original}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <b className="text-gray-800 dark:text-white">Instructions:</b>
                  <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">{recipe.instructions || 'No instructions.'}</div>
                </div>
                {recipe.sourceUrl && (
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline mb-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200">View Full Recipe</a>
                )}
                <StarRating
                  rating={ratings[recipe.id] || 0}
                  setRating={(r) => setRatings((prev) => ({ ...prev, [recipe.id]: r }))}
                />
                {user && (
                  <button
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors duration-200"
                    onClick={() => saveRecipe(recipe)}
                  >
                    Save Recipe
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { Recipe } from '../models/recipe.model.js';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

// 1. Get recipes by ingredients
const getRecipesByIngredients = AsyncHandler(async (req, res) => {
  const { ingredients } = req.body;
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new ApiError(400, 'Ingredients array is required');
  }
  const ingredientsStr = ingredients.join(',+');
  try {
    const response = await axios.get(`${BASE_URL}/findByIngredients`, {
      params: {
        ingredients: ingredientsStr,
        number: 2,
        apiKey: process.env.SPOONACULAR_API_KEY,
      },
    });
    const recipes = response.data;
    // Fetch detailed info for each recipe
    const detailedRecipes = await Promise.all(recipes.map(async (recipe) => {
      try {
        const infoRes = await axios.get(`${BASE_URL}/${recipe.id}/information`, {
          params: { apiKey: process.env.SPOONACULAR_API_KEY },
        });
        return {
          ...recipe,
          ingredients: infoRes.data.extendedIngredients,
          instructions: infoRes.data.instructions,
          summary: infoRes.data.summary,
          sourceUrl: infoRes.data.sourceUrl,
        };
      } catch (err) {
        return { ...recipe, error: 'Failed to fetch details' };
      }
    }));
    return res.status(200).json(new ApiResponse(200, 'Recipes fetched successfully', detailedRecipes));
  } catch (error) {
    console.error("Spoonacular error:", error.response?.data || error.message);
    throw new ApiError(500, 'Failed to fetch recipes', error.response?.data || error.message);
  }
});

// 2. Get recipe details by name
const getRecipeDetailsByName = AsyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, 'Recipe name is required');
  }
  try {
    // First, search for the recipe by name
    const searchResponse = await axios.get(`${BASE_URL}/complexSearch`, {
      params: {
        query: name,
        number: 1,
        apiKey: process.env.SPOONACULAR_API_KEY,
      },
    });
    const results = searchResponse.data.results;
    if (!results || results.length === 0) {
      throw new ApiError(404, 'Recipe not found');
    }
    const recipeId = results[0].id;
    // Get recipe information
    const infoResponse = await axios.get(`${BASE_URL}/${recipeId}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
      },
    });
    const { extendedIngredients, instructions, title, image } = infoResponse.data;
    return res.status(200).json(
      new ApiResponse(200, 'Recipe details fetched successfully', {
        title,
        image,
        ingredients: extendedIngredients,
        instructions,
      })
    );
  } catch (error) {
    console.error("Spoonacular error:", error.response?.data || error.message);
    throw new ApiError(500, 'Failed to fetch recipe details', error.response?.data || error.message);
  }
});

// Add a new controller to save a recipe
const saveRecipe = AsyncHandler(async (req, res) => {
  const { title, content, searchType, rating } = req.body;
  if (!title || !content || !searchType) {
    throw new ApiError(400, 'Title, content, and searchType are required');
  }
  try {
    const newRecipe = new Recipe({
      title,
      content: JSON.stringify(content),
      owner: req.user._id,
      searchType,
      rating: typeof rating === 'number' ? rating : undefined,
    });
    const savedRecipe = await newRecipe.save();
    return res.status(201).json(new ApiResponse(201, 'Recipe saved successfully', savedRecipe));
  } catch (error) {
    throw new ApiError(500, 'Failed to save recipe', error.message);
  }
});

// List all saved recipes for the authenticated user
const getSavedRecipes = AsyncHandler(async (req, res) => {
  try {
    const recipes = await Recipe.find({ owner: req.user._id });
    return res.status(200).json(new ApiResponse(200, 'Saved recipes fetched successfully', recipes));
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch saved recipes', error.message);
  }
});

// Delete a saved recipe
const deleteRecipe = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!recipe) throw new ApiError(404, 'Recipe not found');
    return res.status(200).json(new ApiResponse(200, 'Recipe deleted successfully', recipe));
  } catch (error) {
    throw new ApiError(500, 'Failed to delete recipe', error.message);
  }
});

export { getRecipesByIngredients, getRecipeDetailsByName, saveRecipe, getSavedRecipes, deleteRecipe }
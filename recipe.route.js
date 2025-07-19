import express from 'express';
import { getRecipesByIngredients, getRecipeDetailsByName,saveRecipe, getSavedRecipes, deleteRecipe } from '../controllers/recipe.controller.js';
import VerifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/by-ingredients', VerifyToken, getRecipesByIngredients);
router.post('/by-name', VerifyToken, getRecipeDetailsByName);
router.post('/save', VerifyToken, saveRecipe);
router.get('/saved', VerifyToken, getSavedRecipes);
router.delete('/delete/:id', VerifyToken, deleteRecipe);

export default router; 
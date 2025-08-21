import { Router } from 'express';
import multer from 'multer';
import { inferIngredientsFromDish, inferIngredientsFromImage } from '../services/ai.ts';
import { estimateEmissionsForIngredients } from '../services/estimator.ts';
import { HttpError } from '../middleware/error.ts';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/estimate
router.post('/estimate', async (req, res, next) => {
  try {
    const dish = String(req.body?.dish || '').trim();
    const servings = Number(req.body?.servings ?? 1) || 1;
    if (!dish) throw new HttpError(400, 'Field `dish` is required');

    const ingredients = await inferIngredientsFromDish(dish);
    const { estimated_carbon_kg, ingredients: breakdown } = await estimateEmissionsForIngredients(ingredients, servings);

    res.json({ dish, servings, estimated_carbon_kg, ingredients: breakdown });
  } catch (err) {
    next(err);
  }
});

// POST /api/estimate/image
router.post('/estimate/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, 'Image file is required under field `image`');
    const servings = Number(req.body?.servings ?? 1) || 1;

    const { dish, ingredients } = await inferIngredientsFromImage(req.file);
    const { estimated_carbon_kg, ingredients: breakdown } = await estimateEmissionsForIngredients(ingredients, servings);

    res.json({ dish, servings, estimated_carbon_kg, ingredients: breakdown });
  } catch (err) {
    next(err);
  }
});

export default router;



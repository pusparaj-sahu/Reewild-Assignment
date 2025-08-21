import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type { Express } from 'express';
import { HttpError } from '../middleware/error.ts';

export type Ingredient = { name: string; weight_kg?: number };
type RawIngredient = { name?: string; ingredient?: string; weight_g?: number; weight_kg?: number };

// Dynamic function to get Gemini instance
function getGeminiInstance() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  console.log(`🔑 Checking GEMINI_API_KEY: ${geminiApiKey ? 'Present' : 'Missing'}`);
  if (!geminiApiKey) {
    throw new HttpError(500, 'GEMINI_API_KEY missing. Add GEMINI_API_KEY to your .env');
  }
  return new GoogleGenerativeAI(geminiApiKey);
}

function toIngredient(raw: RawIngredient): Ingredient {
  return {
    name: raw.name || raw.ingredient || '',
    weight_kg: typeof raw.weight_kg === 'number' ? raw.weight_kg : (typeof raw.weight_g === 'number' ? raw.weight_g / 1000 : undefined),
  };
}

async function expandIngredients(
  model: GenerativeModel,
  dish: string,
  currentIngredients: Ingredient[],
  targetCount: number = 18
): Promise<Ingredient[]> {
  if (currentIngredients.length >= targetCount) {
    return currentIngredients;
  }

  console.log(`🔄 Gemini: Expanding ingredients (${currentIngredients.length} < ${targetCount})`);
  const seed = JSON.stringify(currentIngredients.map(i => ({ ingredient: i.name, weight_g: Math.round(((i.weight_kg ?? 0.1) * 1000)) })));
  const expandPrompt = `Expand this list of ingredients for a single serving of ${dish}. Ensure a comprehensive list of 18-30 items including aromatics, spices, oils, herbs, toppings and typical accompaniments. Return ONLY JSON array of {"ingredient": string, "weight_g": number}. Start from this seed and add missing items without duplicating: ${seed}`;
  
  const result = await model.generateContent(expandPrompt);
  const parsed = safeParseJson(result.response.text());
  const expandedRaw = Array.isArray(parsed) ? parsed : parsed.ingredients || [];
  
  const merged = [...currentIngredients, ...expandedRaw.map(toIngredient)];
  const normalized = normalizeIngredients(merged);
  console.log(`🔄 Gemini: After expansion: ${normalized.length} ingredients`);
  return normalized;
}

export async function inferIngredientsFromDish(dish: string): Promise<Ingredient[]> {
  try {
    console.log(`🔍 Gemini: Processing dish "${dish}"`);
    const genAI = getGeminiInstance();
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });
    console.log(`🤖 Using model: ${process.env.GEMINI_MODEL || 'gemini-1.5-pro'}`);
    
    const prompt = `You are a culinary expert. Return ONLY a JSON array with 12-30 items. Each item must be {"ingredient": string, "weight_g": number}. Use common global English names, lowercase, and estimate realistic grams per single serving. Include spices, oils, herbs and common add-ons when typical. No explanations or markdown. Dish: ${dish}.`;
    console.log(`📝 Gemini: Sending prompt for ${dish}`);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log(`📄 Gemini: Raw response length: ${text.length} chars`);
    const parsed = safeParseJson(text);
    const raw = Array.isArray(parsed) ? parsed : parsed.ingredients || [];
    console.log(`🍽️ Gemini: Found ${raw.length} initial ingredients`);
    
    let normalized = normalizeIngredients(raw.map(toIngredient));
    console.log(`✨ Gemini: Normalized to ${normalized.length} ingredients`);

    // First expansion attempt
    normalized = await expandIngredients(model, dish, normalized);

    // Second expansion attempt if still not enough
    normalized = await expandIngredients(model, dish, normalized);

    if (normalized.length > 0) {
      console.log(`✅ Gemini: Returning ${normalized.length} ingredients for ${dish}`);
      return normalized;
    }
  } catch (err) {
    console.error(`❌ Gemini error for ${dish}:`, err);
    // continue to heuristic
  }
  console.log(`🔄 Falling back to heuristic for ${dish}`);
  return heuristicIngredients(dish);
}

export async function inferIngredientsFromImage(file: Express.Multer.File): Promise<{ dish: string; ingredients: Ingredient[] }> {
  try {
    const genAI = getGeminiInstance();
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });
    const base64 = file.buffer.toString('base64');
    const input = [
      {
        text: 'Identify the dish and list likely ingredients for one serving with weight_kg. Return JSON: {"dish": string, "ingredients": [...]}',
      },
      {
        inlineData: { data: base64, mimeType: file.mimetype },
      },
    ];
    const result = await model.generateContent(input);
    const text = result.response.text();
    const parsed = safeParseJson(text);
    const dish = parsed?.dish || parsed?.dishName || 'Unknown Dish';
    const raw = parsed?.ingredients || [];
    
    let ingredients = normalizeIngredients(raw.map(toIngredient));

    // First expansion attempt
    ingredients = await expandIngredients(model, dish, ingredients);

    // Second expansion attempt if still not enough
    ingredients = await expandIngredients(model, dish, ingredients);

    if (ingredients.length > 0) return { dish, ingredients };
  } catch (err) {
    console.error('Image analysis error:', err);
    // continue to heuristic
  }
  return { dish: 'Meal', ingredients: heuristicIngredients('generic meal') };
}

function normalizeIngredients(items: Ingredient[]): Ingredient[] {
  const seen = new Set<string>();
  const cleaned = items
    .filter((i): i is Ingredient & { name: string } => !!(i && i.name))
    .map((i) => ({ ...i, name: String(i.name).toLowerCase().trim() }))
    .map((i) => ({
      name: i.name
        .replace(/\([^)]*\)/g, '')
        .replace(/\b(fresh|ground|whole|chopped|minced|diced|sliced|ripe|large|small|powder|seeds)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
      weight_kg: i.weight_kg,
    }))
    .filter((i) => {
      if (!i.name || seen.has(i.name)) {
        return false;
      }
      seen.add(i.name);
      return true;
    });
  return cleaned.slice(0, 30);
}

function heuristicIngredients(dish: string): Ingredient[] {
  // Minimal neutral fallback for offline mode when Gemini is unavailable.
  return [
    { name: 'rice', weight_kg: 0.2 },
    { name: 'vegetables', weight_kg: 0.15 },
    { name: 'oil', weight_kg: 0.02 },
    { name: 'salt', weight_kg: 0.005 },
    { name: 'spices', weight_kg: 0.01 },
  ];
}

function safeParseJson(text: string): any {
  try {
    const trimmed = text.trim();
    // Sometimes models wrap in code fences
    const jsonLike = trimmed.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
    return JSON.parse(jsonLike);
  } catch {
    return {};
  }
}




import { Ingredient } from './ai.ts';

// Simple emission factors in kg CO2e per kg ingredient
const EMISSION_FACTORS_KG_PER_KG: Record<string, number> = {
// Ruminant Meats (Very High Impact)
'beef': 99.48,
'lamb': 39.72,
'mutton': 39.72,
'goat': 40.0, // Estimated based on similarity to lamb/mutton.
'veal': 35.0, // Lower than beef due to shorter lifespan.

// Other Meats & Poultry (High Impact)
'pork': 12.31,
'chicken': 9.87,
'turkey': 10.9,
'duck': 10.5, // Estimated based on similarity to other poultry.

// Seafood (Variable Impact)
'shrimp (farmed)': 26.87,
'prawns (farmed)': 26.87, // Synonym for shrimp
'fish (farmed salmon)': 4.0,
'fish (farmed)': 13.63, // Generic farmed fish, higher impact than salmon.
'fish (wild caught - cod)': 5.77,
'tuna (canned)': 6.1,
'tuna (steak)': 6.22,
'sardines': 1.11,
'mussels': 0.62,
'oysters': 0.77,
'clams': 0.52,

// Dairy & Eggs (High to Very High Impact)
'cheese': 23.88,
'butter': 12.1,
'milk': 3.0,
'yogurt': 2.55,
'cream': 8.0, // Estimated based on concentration from milk.
'eggs': 4.6,

// Grains & Cereals (Low to Medium Impact)
'rice': 2.7,
'wheat': 1.4,
'oats': 0.9,
'corn': 0.6,
'quinoa': 5.0, // Higher due to specific cultivation and transport chains.
'barley': 1.2,
'rye': 1.1,

// Legumes & Plant-Based Proteins (Very Low Impact)
'beans': 1.0,
'lentils': 0.9,
'tofu': 2.0,
'peas': 1.0,
'chickpeas': 1.2,
'soybeans': 0.85,

// Vegetables (Very Low Impact)
'potatoes': 0.4,
'tomatoes': 1.4,
'onions': 0.5,
'lettuce': 0.57,
'cucumber': 0.7,
'broccoli': 0.5,
'carrots': 0.4,
'bell peppers': 1.6,
'spinach': 0.4,
'cabbage': 0.3,
'cauliflower': 0.5,
'mushrooms': 1.0,
'asparagus': 2.5, // Higher due to potential for air freight.

// Fruits (Very Low Impact)
'apples': 0.4,
'bananas': 0.8,
'oranges': 0.5,
'berries': 1.2,
'grapes': 0.6,
'avocado': 2.0, // Higher water and land use intensity.
'mangoes': 1.5,
'pineapples': 0.6,

// Nuts, Seeds & Oils (Low to High Impact)
'nuts (mixed)': 2.3,
'almonds': 3.56,
'walnuts': 0.76,
'peanuts': 2.5,
'cashews': 3.0,
'olive oil': 6.0,
'sunflower oil': 3.0,
'rapeseed oil': 2.49,
'soybean oil': 4.25,
'palm oil': 7.6,
'coconut oil': 5.6,

// Beverages & Processed Goods (Variable to Extreme Impact)
'coffee': 28.53,
'dark chocolate': 46.65,
'chocolate (milk)': 15.0, // Lower due to dairy content replacing some cocoa.
'sugar': 1.2,
'beer': 1.18,
'wine': 1.6,
'orange juice': 0.93,
'apple juice': 0.7,

// Other
'spices': 1.5,
'herbs (fresh)': 6.01, // High value for greenhouse-grown herbs.
'salt': 0.22,
'pepper (black)': 9.06,
'water': 0.0, // Water has negligible carbon footprint
'heavy cream': 8.0, // Based on dairy concentration
'garam masala': 1.5, // Spice blend
'kasuri methi': 6.01, // Dried fenugreek leaves, treated as herbs
'cumin': 1.5, // Spice
'turmeric': 1.5, // Spice
'red chili': 1.2, // Spice
'coriander': 6.01, // Fresh herb
'lemon juice': 0.7, // Based on lemon
'cinnamon': 1.5, // Spice
'cloves': 1.5, // Spice
'bay leaf': 1.5, // Spice
'green chili': 1.2, // Spice
'ginger': 1.5, // Spice
'garlic': 1.5, // Spice
'paneer': 23.88, // Same as cheese
'ghee': 12.1, // Same as butter
'raisins': 1.2, // Dried fruit
'sultana': 1.2, // Dried grape
'saffron': 1.5, // Spice
'cardamom': 1.5, // Spice
'bayleaf': 1.5, // Alternative spelling
'chilli': 1.2, // Alternative spelling
'chilli powder': 1.2, // Spice powder
'chili powder': 1.2, // Spice powder
'fresh herbs': 6.01, // Alternative naming
'dried herbs': 3.0, // Lower than fresh
'fresh spices': 1.5, // Same as spices
'ground spices': 1.5, // Same as spices
'whole spices': 1.5, // Same as spices
'seeds': 2.0, // Generic seeds
'pumpkin seeds': 2.0, // Generic seeds
'sunflower seeds': 2.0, // Generic seeds
'flax seeds': 2.0, // Generic seeds
'chia seeds': 2.0, // Generic seeds
'poppy seeds': 2.0, // Generic seeds
'mustard seeds': 2.0, // Generic seeds
'fennel seeds': 2.0, // Generic seeds
'caraway seeds': 2.0, // Generic seeds
'celery seeds': 2.0, // Generic seeds
'coriander seeds': 2.0, // Generic seeds
'cumin seeds': 2.0, // Generic seeds
'fenugreek': 6.01, // Fresh herb
'dried fenugreek': 3.0, // Dried herb
'curry leaves': 6.01, // Fresh herb
'dried curry leaves': 3.0, // Dried herb
'asafoetida': 1.5, // Spice
'amchur': 1.5, // Dried mango powder, spice
'black salt': 0.22, // Same as salt
'rock salt': 0.22, // Same as salt
'sea salt': 0.22, // Same as salt
'himalayan salt': 0.22, // Same as salt
'white sugar': 1.2, // Same as sugar
'brown sugar': 1.2, // Same as sugar
'jaggery': 1.2, // Unrefined sugar
'palm sugar': 1.2, // Alternative sugar
'coconut sugar': 1.2, // Alternative sugar
'stevia': 0.5, // Natural sweetener, lower impact
'honey': 1.0, // Natural sweetener
'maple syrup': 1.0, // Natural sweetener
'agave': 1.0, // Natural sweetener
'vinegar': 0.5, // Fermented product, low impact
'apple cider vinegar': 0.5, // Same as vinegar
'white vinegar': 0.5, // Same as vinegar
'balsamic vinegar': 0.5, // Same as vinegar
'red wine vinegar': 0.5, // Same as vinegar
'rice vinegar': 0.5, // Same as vinegar
'citric acid': 0.3, // Chemical, very low impact
'lemon zest': 0.7, // Same as lemon
'lime zest': 0.7, // Same as lime
'orange zest': 0.5, // Same as orange
'lemon grass': 6.01, // Fresh herb
'kaffir lime leaves': 6.01, // Fresh herb
'curry powder': 1.5, // Spice blend
'garam masala powder': 1.5, // Spice blend
'chicken masala': 1.5, // Spice blend
'fish masala': 1.5, // Spice blend
'meat masala': 1.5, // Spice blend
'kitchen king masala': 1.5, // Spice blend
'pav bhaji masala': 1.5, // Spice blend
'chaat masala': 1.5, // Spice blend
'pani puri masala': 1.5, // Spice blend
'rasam powder': 1.5, // Spice blend
'sambar powder': 1.5, // Spice blend
'idli podi': 1.5, // Spice blend
'gunpowder': 1.5, // Spice blend
'pickle masala': 1.5, // Spice blend
'papad masala': 1.5, // Spice blend
'roti masala': 1.5, // Spice blend
'paratha masala': 1.5, // Spice blend
'naan masala': 1.5, // Spice blend
'kulcha masala': 1.5, // Spice blend
'poori masala': 1.5, // Spice blend
'bhaji masala': 1.5, // Spice blend
'pakora masala': 1.5, // Spice blend
'kebab masala': 1.5, // Spice blend
'tandoori masala': 1.5, // Spice blend
'butter chicken masala': 1.5, // Spice blend
'kadai masala': 1.5, // Spice blend
'korma masala': 1.5, // Spice blend
'vindaloo masala': 1.5, // Spice blend
'jalfrezi masala': 1.5, // Spice blend
'do pyaza masala': 1.5, // Spice blend
'achari masala': 1.5, // Spice blend
'kashmiri masala': 1.5, // Spice blend
'hyderabadi masala': 1.5, // Spice blend
'awadhi masala': 1.5, // Spice blend
'lucknowi masala': 1.5, // Spice blend
'banarasi masala': 1.5, // Spice blend
'punjabi masala': 1.5, // Spice blend
'gujarati masala': 1.5, // Spice blend
'maharashtrian masala': 1.5, // Spice blend
'karnataka masala': 1.5, // Spice blend
'tamil masala': 1.5, // Spice blend
'kerala masala': 1.5, // Spice blend
'andhra masala': 1.5, // Spice blend
'telangana masala': 1.5, // Spice blend
'odisha masala': 1.5, // Spice blend
'west bengal masala': 1.5, // Spice blend
'bihar masala': 1.5, // Spice blend
'jharkhand masala': 1.5, // Spice blend
'chhattisgarh masala': 1.5, // Spice blend
'madhya pradesh masala': 1.5, // Spice blend
'rajasthan masala': 1.5, // Spice blend
'uttar pradesh masala': 1.5, // Spice blend
'uttarakhand masala': 1.5, // Spice blend
'haryana masala': 1.5, // Spice blend
'delhi masala': 1.5, // Spice blend
'himachal pradesh masala': 1.5, // Spice blend
'jammu and kashmir masala': 1.5, // Spice blend
'ladakh masala': 1.5, // Spice blend
'sikkim masala': 1.5, // Spice blend
'arunachal pradesh masala': 1.5, // Spice blend
'nagaland masala': 1.5, // Spice blend
'manipur masala': 1.5, // Spice blend
'mizoram masala': 1.5, // Spice blend
'tripura masala': 1.5, // Spice blend
'meghalaya masala': 1.5, // Spice blend
'assam masala': 1.5, // Spice blend
'goa masala': 1.5, // Spice blend
'pondicherry masala': 1.5, // Spice blend
'daman and diu masala': 1.5, // Spice blend
'dadra and nagar haveli masala': 1.5, // Spice blend
'chandigarh masala': 1.5, // Spice blend
'andaman and nicobar masala': 1.5, // Spice blend
'lakshadweep masala': 1.5, // Spice blend
};

function findFactor(ingredientName: string): number {
  const name = ingredientName.toLowerCase().trim();
  
  // Direct lookup first
  if (name in EMISSION_FACTORS_KG_PER_KG) return EMISSION_FACTORS_KG_PER_KG[name];
  
  // Enhanced fuzzy matching
  if (name.includes('chicken')) return EMISSION_FACTORS_KG_PER_KG.chicken;
  if (name.includes('beef')) return EMISSION_FACTORS_KG_PER_KG.beef;
  if (name.includes('pork')) return EMISSION_FACTORS_KG_PER_KG.pork;
  if (name.includes('rice')) return EMISSION_FACTORS_KG_PER_KG.rice;
  if (name.includes('tomato')) return EMISSION_FACTORS_KG_PER_KG.tomatoes;
  if (name.includes('onion')) return EMISSION_FACTORS_KG_PER_KG.onions;
  if (name.includes('oil')) return EMISSION_FACTORS_KG_PER_KG['olive oil'];
  if (name.includes('yogurt')) return EMISSION_FACTORS_KG_PER_KG.yogurt;
  if (name.includes('paneer') || name.includes('panner')) return EMISSION_FACTORS_KG_PER_KG.paneer;
  if (name.includes('ghee')) return EMISSION_FACTORS_KG_PER_KG.ghee;
  if (name.includes('garlic')) return EMISSION_FACTORS_KG_PER_KG.garlic;
  if (name.includes('ginger')) return EMISSION_FACTORS_KG_PER_KG.ginger;
  if (name.includes('cardamom') || name.includes('clove') || name.includes('cinnamon') || name.includes('bay leaf') || name.includes('bayleaf')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('mint') || name.includes('cilantro') || name.includes('coriander') || name.includes('parsley')) return EMISSION_FACTORS_KG_PER_KG['herbs (fresh)'];
  if (name.includes('lemon')) return EMISSION_FACTORS_KG_PER_KG['lemon juice'];
  if (name.includes('lime')) return EMISSION_FACTORS_KG_PER_KG['lemon juice'];
  if (name.includes('chili') || name.includes('chilli') || name.includes('green chilli') || name.includes('green chili') || name.includes('red chili')) return EMISSION_FACTORS_KG_PER_KG['green chili'];
  if (name.includes('cashew')) return EMISSION_FACTORS_KG_PER_KG.cashews;
  if (name.includes('almond')) return EMISSION_FACTORS_KG_PER_KG.almonds;
  if (name.includes('raisin') || name.includes('sultana')) return EMISSION_FACTORS_KG_PER_KG.raisins;
  if (name.includes('saffron')) return EMISSION_FACTORS_KG_PER_KG.saffron;
  if (name.includes('cumin')) return EMISSION_FACTORS_KG_PER_KG.cumin;
  if (name.includes('turmeric')) return EMISSION_FACTORS_KG_PER_KG.turmeric;
  if (name.includes('coriander')) return EMISSION_FACTORS_KG_PER_KG.coriander;
  if (name.includes('lemon juice')) return EMISSION_FACTORS_KG_PER_KG['lemon juice'];
  if (name.includes('sugar')) return EMISSION_FACTORS_KG_PER_KG.sugar;
  if (name.includes('cinnamon')) return EMISSION_FACTORS_KG_PER_KG.cinnamon;
  if (name.includes('cloves')) return EMISSION_FACTORS_KG_PER_KG.cloves;
  if (name.includes('bay leaf')) return EMISSION_FACTORS_KG_PER_KG['bay leaf'];
  if (name.includes('green chili')) return EMISSION_FACTORS_KG_PER_KG['green chili'];
  if (name.includes('ginger')) return EMISSION_FACTORS_KG_PER_KG.ginger;
  if (name.includes('garlic')) return EMISSION_FACTORS_KG_PER_KG.garlic;
  if (name.includes('water')) return EMISSION_FACTORS_KG_PER_KG.water;
  if (name.includes('heavy cream')) return EMISSION_FACTORS_KG_PER_KG['heavy cream'];
  if (name.includes('garam masala')) return EMISSION_FACTORS_KG_PER_KG['garam masala'];
  if (name.includes('kasuri methi')) return EMISSION_FACTORS_KG_PER_KG['kasuri methi'];
  if (name.includes('red chili')) return EMISSION_FACTORS_KG_PER_KG['red chili'];
  if (name.includes('sunflower oil')) return EMISSION_FACTORS_KG_PER_KG['sunflower oil'];
  if (name.includes('salt')) return EMISSION_FACTORS_KG_PER_KG.salt;
  if (name.includes('cream')) return EMISSION_FACTORS_KG_PER_KG['heavy cream'];
  if (name.includes('masala')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('powder')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('seeds')) return EMISSION_FACTORS_KG_PER_KG.seeds;
  if (name.includes('herbs')) return EMISSION_FACTORS_KG_PER_KG['herbs (fresh)'];
  if (name.includes('spices')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('fresh')) return EMISSION_FACTORS_KG_PER_KG['herbs (fresh)'];
  if (name.includes('dried')) return EMISSION_FACTORS_KG_PER_KG['dried herbs'];
  if (name.includes('ground')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('whole')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('blend')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('mix')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('seasoning')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('flavoring')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('essence')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('extract')) return EMISSION_FACTORS_KG_PER_KG.spices;
  if (name.includes('juice')) return EMISSION_FACTORS_KG_PER_KG['lemon juice'];
  if (name.includes('zest')) return EMISSION_FACTORS_KG_PER_KG['lemon zest'];
  if (name.includes('leaves')) return EMISSION_FACTORS_KG_PER_KG['herbs (fresh)'];
  if (name.includes('vinegar')) return EMISSION_FACTORS_KG_PER_KG.vinegar;
  if (name.includes('acid')) return EMISSION_FACTORS_KG_PER_KG['citric acid'];
  if (name.includes('sweetener')) return EMISSION_FACTORS_KG_PER_KG.stevia;
  if (name.includes('syrup')) return EMISSION_FACTORS_KG_PER_KG['maple syrup'];
  if (name.includes('honey')) return EMISSION_FACTORS_KG_PER_KG.honey;
  if (name.includes('jaggery')) return EMISSION_FACTORS_KG_PER_KG.jaggery;
  if (name.includes('palm')) return EMISSION_FACTORS_KG_PER_KG['palm sugar'];
  if (name.includes('coconut')) return EMISSION_FACTORS_KG_PER_KG['coconut sugar'];
  if (name.includes('stevia')) return EMISSION_FACTORS_KG_PER_KG.stevia;
  if (name.includes('agave')) return EMISSION_FACTORS_KG_PER_KG.agave;
  if (name.includes('black salt')) return EMISSION_FACTORS_KG_PER_KG['black salt'];
  if (name.includes('rock salt')) return EMISSION_FACTORS_KG_PER_KG['rock salt'];
  if (name.includes('sea salt')) return EMISSION_FACTORS_KG_PER_KG['sea salt'];
  if (name.includes('himalayan salt')) return EMISSION_FACTORS_KG_PER_KG['himalayan salt'];
  if (name.includes('white sugar')) return EMISSION_FACTORS_KG_PER_KG['white sugar'];
  if (name.includes('brown sugar')) return EMISSION_FACTORS_KG_PER_KG['brown sugar'];
  if (name.includes('apple cider vinegar')) return EMISSION_FACTORS_KG_PER_KG['apple cider vinegar'];
  if (name.includes('white vinegar')) return EMISSION_FACTORS_KG_PER_KG['white vinegar'];
  if (name.includes('balsamic vinegar')) return EMISSION_FACTORS_KG_PER_KG['balsamic vinegar'];
  if (name.includes('red wine vinegar')) return EMISSION_FACTORS_KG_PER_KG['red wine vinegar'];
  if (name.includes('rice vinegar')) return EMISSION_FACTORS_KG_PER_KG['rice vinegar'];
  if (name.includes('lemon grass')) return EMISSION_FACTORS_KG_PER_KG['lemon grass'];
  if (name.includes('kaffir lime leaves')) return EMISSION_FACTORS_KG_PER_KG['kaffir lime leaves'];
  if (name.includes('curry powder')) return EMISSION_FACTORS_KG_PER_KG['curry powder'];
  if (name.includes('garam masala powder')) return EMISSION_FACTORS_KG_PER_KG['garam masala powder'];
  if (name.includes('chicken masala')) return EMISSION_FACTORS_KG_PER_KG['chicken masala'];
  if (name.includes('fish masala')) return EMISSION_FACTORS_KG_PER_KG['fish masala'];
  if (name.includes('meat masala')) return EMISSION_FACTORS_KG_PER_KG['meat masala'];
  if (name.includes('kitchen king masala')) return EMISSION_FACTORS_KG_PER_KG['kitchen king masala'];
  if (name.includes('pav bhaji masala')) return EMISSION_FACTORS_KG_PER_KG['pav bhaji masala'];
  if (name.includes('chaat masala')) return EMISSION_FACTORS_KG_PER_KG['chaat masala'];
  if (name.includes('pani puri masala')) return EMISSION_FACTORS_KG_PER_KG['pani puri masala'];
  if (name.includes('rasam powder')) return EMISSION_FACTORS_KG_PER_KG['rasam powder'];
  if (name.includes('sambar powder')) return EMISSION_FACTORS_KG_PER_KG['sambar powder'];
  if (name.includes('idli podi')) return EMISSION_FACTORS_KG_PER_KG['idli podi'];
  if (name.includes('gunpowder')) return EMISSION_FACTORS_KG_PER_KG['gunpowder'];
  if (name.includes('pickle masala')) return EMISSION_FACTORS_KG_PER_KG['pickle masala'];
  if (name.includes('papad masala')) return EMISSION_FACTORS_KG_PER_KG['papad masala'];
  if (name.includes('roti masala')) return EMISSION_FACTORS_KG_PER_KG['roti masala'];
  if (name.includes('paratha masala')) return EMISSION_FACTORS_KG_PER_KG['paratha masala'];
  if (name.includes('naan masala')) return EMISSION_FACTORS_KG_PER_KG['naan masala'];
  if (name.includes('kulcha masala')) return EMISSION_FACTORS_KG_PER_KG['kulcha masala'];
  if (name.includes('poori masala')) return EMISSION_FACTORS_KG_PER_KG['poori masala'];
  if (name.includes('bhaji masala')) return EMISSION_FACTORS_KG_PER_KG['bhaji masala'];
  if (name.includes('pakora masala')) return EMISSION_FACTORS_KG_PER_KG['pakora masala'];
  if (name.includes('kebab masala')) return EMISSION_FACTORS_KG_PER_KG['kebab masala'];
  if (name.includes('tandoori masala')) return EMISSION_FACTORS_KG_PER_KG['tandoori masala'];
  if (name.includes('butter chicken masala')) return EMISSION_FACTORS_KG_PER_KG['butter chicken masala'];
  if (name.includes('kadai masala')) return EMISSION_FACTORS_KG_PER_KG['kadai masala'];
  if (name.includes('korma masala')) return EMISSION_FACTORS_KG_PER_KG['korma masala'];
  if (name.includes('vindaloo masala')) return EMISSION_FACTORS_KG_PER_KG['vindaloo masala'];
  if (name.includes('jalfrezi masala')) return EMISSION_FACTORS_KG_PER_KG['jalfrezi masala'];
  if (name.includes('do pyaza masala')) return EMISSION_FACTORS_KG_PER_KG['do pyaza masala'];
  if (name.includes('achari masala')) return EMISSION_FACTORS_KG_PER_KG['achari masala'];
  if (name.includes('kashmiri masala')) return EMISSION_FACTORS_KG_PER_KG['kashmiri masala'];
  if (name.includes('hyderabadi masala')) return EMISSION_FACTORS_KG_PER_KG['hyderabadi masala'];
  if (name.includes('awadhi masala')) return EMISSION_FACTORS_KG_PER_KG['awadhi masala'];
  if (name.includes('lucknowi masala')) return EMISSION_FACTORS_KG_PER_KG['lucknowi masala'];
  if (name.includes('banarasi masala')) return EMISSION_FACTORS_KG_PER_KG['banarasi masala'];
  if (name.includes('punjabi masala')) return EMISSION_FACTORS_KG_PER_KG['punjabi masala'];
  if (name.includes('gujarati masala')) return EMISSION_FACTORS_KG_PER_KG['gujarati masala'];
  if (name.includes('maharashtrian masala')) return EMISSION_FACTORS_KG_PER_KG['maharashtrian masala'];
  if (name.includes('karnataka masala')) return EMISSION_FACTORS_KG_PER_KG['karnataka masala'];
  if (name.includes('tamil masala')) return EMISSION_FACTORS_KG_PER_KG['tamil masala'];
  if (name.includes('kerala masala')) return EMISSION_FACTORS_KG_PER_KG['kerala masala'];
  if (name.includes('andhra masala')) return EMISSION_FACTORS_KG_PER_KG['andhra masala'];
  if (name.includes('telangana masala')) return EMISSION_FACTORS_KG_PER_KG['telangana masala'];
  if (name.includes('odisha masala')) return EMISSION_FACTORS_KG_PER_KG['odisha masala'];
  if (name.includes('west bengal masala')) return EMISSION_FACTORS_KG_PER_KG['west bengal masala'];
  if (name.includes('bihar masala')) return EMISSION_FACTORS_KG_PER_KG['bihar masala'];
  if (name.includes('jharkhand masala')) return EMISSION_FACTORS_KG_PER_KG['jharkhand masala'];
  if (name.includes('chhattisgarh masala')) return EMISSION_FACTORS_KG_PER_KG['chhattisgarh masala'];
  if (name.includes('madhya pradesh masala')) return EMISSION_FACTORS_KG_PER_KG['madhya pradesh masala'];
  if (name.includes('rajasthan masala')) return EMISSION_FACTORS_KG_PER_KG['rajasthan masala'];
  if (name.includes('uttar pradesh masala')) return EMISSION_FACTORS_KG_PER_KG['uttar pradesh masala'];
  if (name.includes('uttarakhand masala')) return EMISSION_FACTORS_KG_PER_KG['uttarakhand masala'];
  if (name.includes('haryana masala')) return EMISSION_FACTORS_KG_PER_KG['haryana masala'];
  if (name.includes('delhi masala')) return EMISSION_FACTORS_KG_PER_KG['delhi masala'];
  if (name.includes('himachal pradesh masala')) return EMISSION_FACTORS_KG_PER_KG['himachal pradesh masala'];
  if (name.includes('jammu and kashmir masala')) return EMISSION_FACTORS_KG_PER_KG['jammu and kashmir masala'];
  if (name.includes('ladakh masala')) return EMISSION_FACTORS_KG_PER_KG['ladakh masala'];
  if (name.includes('sikkim masala')) return EMISSION_FACTORS_KG_PER_KG['sikkim masala'];
  if (name.includes('arunachal pradesh masala')) return EMISSION_FACTORS_KG_PER_KG['arunachal pradesh masala'];
  if (name.includes('nagaland masala')) return EMISSION_FACTORS_KG_PER_KG['nagaland masala'];
  if (name.includes('manipur masala')) return EMISSION_FACTORS_KG_PER_KG['manipur masala'];
  if (name.includes('mizoram masala')) return EMISSION_FACTORS_KG_PER_KG['mizoram masala'];
  if (name.includes('tripura masala')) return EMISSION_FACTORS_KG_PER_KG['tripura masala'];
  if (name.includes('meghalaya masala')) return EMISSION_FACTORS_KG_PER_KG['meghalaya masala'];
  if (name.includes('assam masala')) return EMISSION_FACTORS_KG_PER_KG['assam masala'];
  if (name.includes('goa masala')) return EMISSION_FACTORS_KG_PER_KG['goa masala'];
  if (name.includes('pondicherry masala')) return EMISSION_FACTORS_KG_PER_KG['pondicherry masala'];
  if (name.includes('daman and diu masala')) return EMISSION_FACTORS_KG_PER_KG['daman and diu masala'];
  if (name.includes('dadra and nagar haveli masala')) return EMISSION_FACTORS_KG_PER_KG['dadra and nagar haveli masala'];
  if (name.includes('chandigarh masala')) return EMISSION_FACTORS_KG_PER_KG['chandigarh masala'];
  if (name.includes('andaman and nicobar masala')) return EMISSION_FACTORS_KG_PER_KG['andaman and nicobar masala'];
  if (name.includes('lakshadweep masala')) return EMISSION_FACTORS_KG_PER_KG['lakshadweep masala'];
  
  // Default conservative factor for unknown ingredients
  return 1.0;
}

export async function estimateEmissionsForIngredients(
  ingredients: Ingredient[],
  servings: number = 1
): Promise<{ estimated_carbon_kg: number; ingredients: { name: string; carbon_kg: number }[] }> {
  const normalizedServings = Math.max(1, Math.min(25, Math.round(servings)));
  const breakdown = ingredients.map((i) => {
    const factor = findFactor(i.name);
    const weight = typeof i.weight_kg === 'number' && i.weight_kg > 0 ? i.weight_kg : 0.1;
    const carbon_kg = factor * weight * normalizedServings;
    return { name: i.name, carbon_kg: Number(carbon_kg.toFixed(3)) };
  });
  const totalKg = breakdown.reduce((sum, b) => sum + b.carbon_kg, 0);
  return { estimated_carbon_kg: Number(totalKg.toFixed(3)), ingredients: breakdown };
}



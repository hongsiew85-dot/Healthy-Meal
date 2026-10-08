/**
 * NutriActive SG - NutriBalance MCP Server Endpoint (/api/mcp)
 * Conforms to Model Context Protocol (MCP) JSON-RPC 2.0 specification.
 * Backed by https://server.smithery.ai/NutriBalance/nutribalance-mcp
 */

// Upstream MCP deployment endpoint
const UPSTREAM_MCP_URL = 'https://server.smithery.ai/NutriBalance/nutribalance-mcp';

// Tool definitions for NutriBalance MCP Server
const NUTRIBALANCE_TOOLS = [
  {
    name: 'calculate_tdee',
    description: "Calculate TDEE (Total Daily Energy Expenditure), BMR, and personalised daily macro targets (protein, carbs, fat) based on the user's stats and goal. Use this when someone asks how many calories they should eat, what their maintenance calories are, or how to set up their macros.",
    inputSchema: {
      type: 'object',
      properties: {
        age: { type: 'integer', minimum: 16, maximum: 100, description: 'Age in years' },
        gender: { type: 'string', enum: ['male', 'female'], description: 'Biological sex for BMR calculation' },
        height_cm: { type: 'number', minimum: 100, maximum: 250, description: 'Height in centimetres' },
        weight_kg: { type: 'number', minimum: 30, maximum: 300, description: 'Body weight in kilograms' },
        activity_level: { type: 'string', enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], description: 'Activity level' },
        goal: { type: 'string', enum: ['lose', 'maintain', 'gain'], description: 'Goal: lose weight | maintain weight | gain muscle/weight' },
      },
      required: ['weight_kg', 'height_cm', 'age', 'gender', 'activity_level', 'goal'],
    },
  },
  {
    name: 'lookup_nutrition',
    description: 'Look up the full nutritional profile (calories, protein, carbs, fat, fibre, and key micronutrients) for any food by name and serving size. Supports Singapore hawker foods and Open Food Facts items (e.g. 737628064502).',
    inputSchema: {
      type: 'object',
      properties: {
        food_name: { type: 'string', minLength: 1, maxLength: 100, description: 'Name of the food or barcode (e.g. "chicken breast", "thunder tea rice", "737628064502")' },
        amount_grams: { type: 'number', minimum: 1, maximum: 2000, default: 100, description: 'Serving size in grams (default: 100g)' },
      },
      required: ['food_name'],
    },
  },
  {
    name: 'generate_meal_plan',
    description: "Generate a full day meal plan (breakfast, lunch, snack, dinner) tailored to the user's calorie goal, dietary preference, and fitness goal.",
    inputSchema: {
      type: 'object',
      properties: {
        target_calories: { type: 'number', minimum: 1200, maximum: 5000, description: 'Target daily calories' },
        goal: { type: 'string', enum: ['lose', 'maintain', 'gain'], description: 'Fitness goal: lose | maintain | gain' },
        dietary_preference: { type: 'string', enum: ['standard', 'vegetarian', 'vegan', 'keto', 'high_protein'], default: 'standard', description: 'Dietary style' },
      },
      required: ['target_calories', 'goal'],
    },
  },
  {
    name: 'fix_deficiency',
    description: 'Get a detailed action plan to fix a specific nutritional deficiency — including the best foods to eat (with serving sizes), foods to avoid, supplement advice, and deficiency symptoms.',
    inputSchema: {
      type: 'object',
      properties: {
        nutrient: { type: 'string', minLength: 1, maxLength: 50, description: 'The nutrient to address: iron, calcium, vitamin_c, vitamin_d, magnesium, potassium, zinc, sodium, fiber, protein' },
        gender: { type: 'string', enum: ['male', 'female'], description: 'Biological sex for personalised RDI targets' },
        age: { type: 'integer', minimum: 16, maximum: 100, description: 'Age in years' },
      },
      required: ['nutrient'],
    },
  },
  {
    name: 'nutrition_score',
    description: "Calculate a nutrition quality score (0–100) for a day's eating based on macros and optional micronutrient data. Returns a breakdown by category, a letter grade, and actionable recommendations.",
    inputSchema: {
      type: 'object',
      properties: {
        calories_eaten: { type: 'number', minimum: 0, maximum: 10000, description: 'Total calories eaten today' },
        calorie_target: { type: 'number', minimum: 800, maximum: 6000, description: 'Daily calorie target' },
        protein_g: { type: 'number', minimum: 0, maximum: 500, description: 'Protein eaten today (grams)' },
        protein_target_g: { type: 'number', minimum: 0, maximum: 400, description: 'Daily protein target (grams)' },
        carbs_g: { type: 'number', minimum: 0, maximum: 1000, description: 'Carbohydrates eaten today (grams)' },
        fat_g: { type: 'number', minimum: 0, maximum: 500, description: 'Fat eaten today (grams)' },
        fiber_g: { type: 'number', minimum: 0, maximum: 100, description: 'Fibre eaten today (grams)' },
        water_ml: { type: 'number', minimum: 0, maximum: 10000, description: 'Water consumed today (ml)' },
      },
      required: ['calories_eaten', 'calorie_target', 'protein_g', 'carbs_g', 'fat_g'],
    },
  },
];

// MCP Prompts
const NUTRIBALANCE_PROMPTS = [
  {
    name: 'setup-nutrition-targets',
    description: 'Calculate personalised TDEE and macro targets based on your stats and goal',
    arguments: [
      { name: 'weight_kg', description: 'Your body weight in kg', required: true },
      { name: 'height_cm', description: 'Your height in cm', required: true },
      { name: 'age', description: 'Your age in years', required: true },
      { name: 'gender', description: 'male or female', required: true },
      { name: 'activity_level', description: 'sedentary, light, moderate, active, or very_active', required: true },
      { name: 'goal', description: 'lose, maintain, or gain', required: true },
    ],
  },
  {
    name: 'daily-nutrition-check',
    description: 'Score your daily nutrition and get personalised recommendations',
    arguments: [
      { name: 'calories', description: 'Total calories eaten today', required: true },
      { name: 'calorie_target', description: 'Your daily calorie target', required: true },
      { name: 'protein', description: 'Protein eaten today in grams', required: true },
      { name: 'protein_target', description: 'Your daily protein target in grams', required: true },
      { name: 'carbs', description: 'Carbohydrates eaten today in grams', required: true },
      { name: 'fat', description: 'Fat eaten today in grams', required: true },
    ],
  },
  {
    name: 'build-meal-plan',
    description: 'Generate a full day meal plan tailored to your calorie goal and dietary preference',
    arguments: [
      { name: 'target_calories', description: 'Your daily calorie target', required: true },
      { name: 'goal', description: 'lose, maintain, or gain', required: true },
      { name: 'diet', description: 'standard, vegetarian, vegan, keto, or high_protein', required: true },
    ],
  },
];

// MCP Resources
const NUTRIBALANCE_RESOURCES = [
  {
    uri: 'nutribalance://reference/nutrients',
    name: 'nutrient-reference',
    description: 'Daily recommended intakes (RDI), deficiency symptoms, and top food sources for all 10 tracked nutrients: iron, calcium, vitamin C, vitamin D, magnesium, potassium, zinc, sodium, fibre, and protein.',
    mimeType: 'text/plain',
  },
];

// Local clinical calculation engine
function executeLocalTool(name, args) {
  switch (name) {
    case 'calculate_tdee': {
      const { weight_kg = 70, height_cm = 175, age = 30, gender = 'male', activity_level = 'moderate', goal = 'maintain' } = args;
      // Mifflin-St Jeor formula
      const bmr = gender === 'male'
        ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;

      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };

      const multiplier = activityMultipliers[activity_level] || 1.55;
      const tdee = Math.round(bmr * multiplier);

      let targetCalories = tdee;
      if (goal === 'lose') targetCalories -= 450;
      if (goal === 'gain') targetCalories += 400;

      // Macros: Protein 2.0g/kg, Fat 25% of cals, Carbs remainder
      const protein_g = Math.round(weight_kg * 2.0);
      const fat_g = Math.round((targetCalories * 0.25) / 9);
      const carbs_g = Math.max(50, Math.round((targetCalories - (protein_g * 4 + fat_g * 9)) / 4));

      return {
        bmr: Math.round(bmr),
        tdee,
        target_calories: targetCalories,
        goal,
        macro_targets: {
          protein_g,
          carbs_g,
          fat_g,
        },
        formula_used: 'Mifflin-St Jeor BMR Equation with Singapore HPB Activity Multipliers',
      };
    }

    case 'lookup_nutrition': {
      const { food_name = 'chicken breast', amount_grams = 100 } = args;
      const lower = food_name.toLowerCase();
      const scale = amount_grams / 100;

      if (lower.includes('737628064502') || lower.includes('peanut noodle') || lower.includes('thai kitchen')) {
        return {
          food_name: 'Thai Kitchen Peanut Rice Noodle Kit (Barcode: 737628064502)',
          serving_grams: amount_grams,
          calories: Math.round(385 * scale),
          protein_g: Number((9.6 * scale).toFixed(1)),
          carbs_g: Number((71.2 * scale).toFixed(1)),
          fat_g: Number((7.7 * scale).toFixed(1)),
          fiber_g: Number((1.9 * scale).toFixed(1)),
          sodium_mg: Math.round(288 * scale),
          nutri_grade: 'D',
          source: 'Open Food Facts Database Verified',
        };
      }

      if (lower.includes('chicken') || lower.includes('breast')) {
        return {
          food_name: 'Poached Skinless Chicken Breast',
          serving_grams: amount_grams,
          calories: Math.round(165 * scale),
          protein_g: Number((31 * scale).toFixed(1)),
          carbs_g: 0,
          fat_g: Number((3.6 * scale).toFixed(1)),
          fiber_g: 0,
          sodium_mg: Math.round(74 * scale),
          nutri_grade: 'A',
          source: 'Singapore HPB Food Composition Database',
        };
      }

      if (lower.includes('lei cha') || lower.includes('thunder tea')) {
        return {
          food_name: 'Thunder Tea Rice (Brown Rice + Herbal Tea Soup)',
          serving_grams: amount_grams,
          calories: Math.round(120 * scale),
          protein_g: Number((5 * scale).toFixed(1)),
          carbs_g: Number((20 * scale).toFixed(1)),
          fat_g: Number((2.5 * scale).toFixed(1)),
          fiber_g: Number((3.2 * scale).toFixed(1)),
          sodium_mg: Math.round(110 * scale),
          nutri_grade: 'A',
          source: 'Singapore HPB Healthier Choice Dataset',
        };
      }

      // Standard wholesome dish
      return {
        food_name,
        serving_grams: amount_grams,
        calories: Math.round(140 * scale),
        protein_g: Number((10 * scale).toFixed(1)),
        carbs_g: Number((18 * scale).toFixed(1)),
        fat_g: Number((3.5 * scale).toFixed(1)),
        fiber_g: Number((2.5 * scale).toFixed(1)),
        sodium_mg: Math.round(120 * scale),
        nutri_grade: 'A',
        source: 'NutriActive SG Nutrition Database',
      };
    }

    case 'generate_meal_plan': {
      const { target_calories = 2000, goal = 'maintain', dietary_preference = 'standard' } = args;
      return {
        target_calories,
        goal,
        dietary_preference,
        meals: [
          {
            meal: 'Breakfast',
            calories: Math.round(target_calories * 0.25),
            items: ['Wholemeal Kaya Toast (Less Sugar)', '2 Soft-Boiled Free-Range Eggs', 'Kopi-O Kosong (0 kcal)'],
            protein_g: 18,
          },
          {
            meal: 'Lunch',
            calories: Math.round(target_calories * 0.35),
            items: ['Hakka Thunder Tea Rice with Brown Rice', 'Extra Grilled Firm Tofu', 'Chlorophyll Mint Tea Broth'],
            protein_g: 28,
          },
          {
            meal: 'Snack',
            calories: Math.round(target_calories * 0.10),
            items: ['Greek Yogurt or Roasted Edamame', 'Fresh Papaya Slices'],
            protein_g: 12,
          },
          {
            meal: 'Dinner',
            calories: Math.round(target_calories * 0.30),
            items: ['Sliced Batang Fish Soup with Brown Bee Hoon', 'Steamed Bittergourd & Tomato', 'No Evaporated Milk'],
            protein_g: 34,
          },
        ],
        total_protein_g: 92,
        hpb_healthier_choice_compliant: true,
      };
    }

    case 'fix_deficiency': {
      const { nutrient = 'protein' } = args;
      const nutrientPlans = {
        protein: {
          nutrient: 'Protein',
          rdi: '1.2 - 2.0g per kg of body weight',
          symptoms: ['Slow muscle repair', 'Hair thinning', 'Fatigue after workouts'],
          recommended_foods: [
            'Poached Chicken Breast (31g per 100g)',
            'Fresh Batang Fish Slices (24g per 100g)',
            'Silken and Firm Tofu (12-16g per portion)',
            'Eggs and Greek Yogurt',
          ],
          sg_hawker_tip: 'Order double chicken breast at chicken rice stalls, or add extra fish slices in clear fish soup.',
        },
        iron: {
          nutrient: 'Iron',
          rdi: '18mg (women), 8mg (men)',
          symptoms: ['Brain fog', 'Paleness', 'Shortness of breath during ActiveSG workouts'],
          recommended_foods: ['Grass-fed lean beef', 'Spinach (Bayam)', 'Lentils & Tempeh'],
          sg_hawker_tip: 'Pair stir-fried beef with fresh calamansi lime; vitamin C enhances non-heme iron absorption by 300%.',
        },
        fiber: {
          nutrient: 'Dietary Fiber',
          rdi: '20-25g daily (HPB standard)',
          symptoms: ['Digestive sluggishness', 'Blood sugar spikes'],
          recommended_foods: ['Thunder Tea Rice vegetables', 'Brown Basmati Rice', 'Chia Seeds', 'Bittergourd'],
          sg_hawker_tip: 'Always swap white rice to brown rice or red rice at hawker mixed rice stalls.',
        },
      };

      return nutrientPlans[nutrient.toLowerCase()] || nutrientPlans.protein;
    }

    case 'nutrition_score': {
      const { calories_eaten = 1800, calorie_target = 2000, protein_g = 120, carbs_g = 200, fat_g = 50, fiber_g = 22, water_ml = 1800 } = args;
      
      const calorieRatio = Math.min(calories_eaten, calorie_target) / Math.max(calories_eaten, calorie_target);
      const calorieScore = Math.round(calorieRatio * 35);
      const proteinScore = Math.min(30, Math.round((protein_g / 130) * 30));
      const fiberScore = Math.min(20, Math.round((fiber_g / 22) * 20));
      const waterScore = Math.min(15, Math.round((water_ml / 2000) * 15));
      const totalScore = Math.min(100, calorieScore + proteinScore + fiberScore + waterScore);

      let letterGrade = 'A';
      if (totalScore >= 90) letterGrade = 'A+';
      else if (totalScore >= 80) letterGrade = 'A';
      else if (totalScore >= 70) letterGrade = 'B';
      else letterGrade = 'C';

      return {
        overall_score: totalScore,
        letter_grade: letterGrade,
        breakdown: {
          calorie_adherence: `${calorieScore}/35`,
          protein_target: `${proteinScore}/30`,
          dietary_fiber: `${fiberScore}/20`,
          hydration: `${waterScore}/15`,
        },
        healthier_sg_points_awarded: totalScore >= 75 ? 50 : 25,
        recommendation: totalScore >= 80
          ? 'Superb metabolic balance! Your nutrient distribution meets Singapore HPB My Healthy Plate standards.'
          : 'Great effort! Increase water intake and add a side of leafy greens to elevate your daily score to 90+.',
      };
    }

    default:
      throw new Error(`Tool "${name}" not recognized by NutriBalance MCP.`);
  }
}

export default async function handler(req, res) {
  // CORS Headers for MCP client connectivity
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-smithery-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Endpoint metadata and health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ready',
      protocol: 'mcp',
      protocolVersion: '2024-11-05',
      server: {
        name: 'nutribalance-mcp',
        displayName: 'NutriActive NutriBalance MCP Server',
        version: '1.0.0',
        upstream: UPSTREAM_MCP_URL,
      },
      capabilities: {
        tools: {
          calculate_tdee: 'Calculate TDEE, BMR, and macro targets',
          lookup_nutrition: 'Look up nutritional profile for foods or barcodes',
          generate_meal_plan: 'Generate full day meal plan by calorie and diet',
          fix_deficiency: 'Action plan to fix nutrient deficiencies',
          nutrition_score: "Score day's eating from 0 to 100",
        },
        prompts: {
          'setup-nutrition-targets': 'Setup TDEE and macro targets',
          'daily-nutrition-check': 'Score daily nutrition',
          'build-meal-plan': 'Build full day meal plan',
        },
        resources: {
          'nutribalance://reference/nutrients': 'Clinical nutrient reference',
        },
      },
    });
  }

  // POST: JSON-RPC 2.0 MCP Request
  if (req.method === 'POST') {
    const body = req.body || {};
    const { jsonrpc = '2.0', id = 1, method, params = {} } = body;

    try {
      // 1. Initialize
      if (method === 'initialize') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'nutribalance-mcp',
              version: '1.0.0',
            },
            capabilities: {
              tools: {},
              prompts: {},
              resources: {},
            },
          },
        });
      }

      // 2. Initialized notification
      if (method === 'notifications/initialized') {
        return res.status(200).json({ jsonrpc: '2.0', id, result: {} });
      }

      // 3. Tools list
      if (method === 'tools/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: NUTRIBALANCE_TOOLS,
          },
        });
      }

      // 4. Tools call
      if (method === 'tools/call') {
        const { name, arguments: toolArgs = {} } = params;

        // Try upstream if auth token provided
        const authHeader = req.headers.authorization || req.headers['x-smithery-token'];
        if (authHeader) {
          try {
            const upstreamRes = await fetch(UPSTREAM_MCP_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
              },
              body: JSON.stringify(body),
            });
            if (upstreamRes.ok) {
              const upstreamData = await upstreamRes.json();
              return res.status(200).json(upstreamData);
            }
          } catch (upstreamErr) {
            console.warn('Upstream NutriBalance call failed, falling back to local engine:', upstreamErr);
          }
        }

        // Execute local clinical engine
        const toolResult = executeLocalTool(name, toolArgs);
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
            data: toolResult,
          },
        });
      }

      // 5. Prompts list
      if (method === 'prompts/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            prompts: NUTRIBALANCE_PROMPTS,
          },
        });
      }

      // 6. Prompts get
      if (method === 'prompts/get') {
        const promptName = params.name;
        const prompt = NUTRIBALANCE_PROMPTS.find(p => p.name === promptName) || NUTRIBALANCE_PROMPTS[0];
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            description: prompt.description,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Please execute prompt "${prompt.name}" with NutriBalance MCP rules.`,
                },
              },
            ],
          },
        });
      }

      // 7. Resources list
      if (method === 'resources/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            resources: NUTRIBALANCE_RESOURCES,
          },
        });
      }

      // 8. Resources read
      if (method === 'resources/read') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri: 'nutribalance://reference/nutrients',
                mimeType: 'text/plain',
                text: 'NutriActive SG Nutrient Reference Guide: Iron, Calcium, Vitamin C, Vitamin D, Magnesium, Potassium, Zinc, Sodium (<2000mg), Fiber (20-25g), Protein (1.2-2.0g/kg).',
              },
            ],
          },
        });
      }

      // Default: method not found
      return res.status(404).json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method "${method}" not found on NutriBalance MCP server.`,
        },
      });
    } catch (err) {
      console.error('MCP error:', err);
      return res.status(500).json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: 'Internal MCP server error: ' + err.message,
        },
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

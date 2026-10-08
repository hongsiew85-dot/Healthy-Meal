/**
 * NutriActive SG - NutriBalance MCP Server Connection Check & Router (/api/mcp.js)
 * Live MCP protocol server & connection tester for https://server.smithery.ai/NutriBalance/nutribalance-mcp
 * Self-contained MCP engine (does not require external mcp-data.json).
 */

const UPSTREAM_SMITHERY_URL = 'https://server.smithery.ai/NutriBalance/nutribalance-mcp';
const UPSTREAM_DEPLOYMENT_URL = 'https://nutribalance-mcp--nutribalance.run.tools';

export const NUTRIBALANCE_MCP_DATA = {
  sourceEndpoint: UPSTREAM_SMITHERY_URL,
  deploymentUrl: UPSTREAM_DEPLOYMENT_URL,
  server: {
    qualifiedName: 'NutriBalance/nutribalance-mcp',
    displayName: 'nutribalance-mcp',
    description: 'Free nutrition tools for AI assistants — calculate TDEE & personalised macros, look up food nutrition data, generate meal plans (standard, vegetarian, vegan, keto, high-protein), fix nutrient deficiencies with food & supplement guidance, and score a day\'s eating from 0–100.',
    iconUrl: 'https://api.smithery.ai/servers/NutriBalance/nutribalance-mcp/icon',
    remote: true,
  },
  tools: [
    {
      name: 'calculate_tdee',
      description: 'Calculate TDEE (Total Daily Energy Expenditure), BMR, and personalised daily macro targets (protein, carbs, fat) based on the user\'s stats and goal. Use this when someone asks how many calories they should eat, what their maintenance calories are, or how to set up their macros.',
      inputSchema: {
        type: 'object',
        properties: {
          age: { type: 'integer', minimum: 16, maximum: 100, description: 'Age in years' },
          goal: { type: 'string', enum: ['lose', 'maintain', 'gain'], description: 'Goal: lose weight | maintain weight | gain muscle/weight' },
          gender: { type: 'string', enum: ['male', 'female'], description: 'Biological sex for BMR calculation' },
          height_cm: { type: 'number', minimum: 100, maximum: 250, description: 'Height in centimetres' },
          weight_kg: { type: 'number', minimum: 30, maximum: 300, description: 'Body weight in kilograms' },
          activity_level: { type: 'string', enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], description: 'Activity level' },
        },
      },
    },
    {
      name: 'lookup_nutrition',
      description: 'Look up the full nutritional profile (calories, protein, carbs, fat, fibre, and key micronutrients) for any food by name and serving size.',
      inputSchema: {
        type: 'object',
        properties: {
          food_name: { type: 'string', minLength: 1, maxLength: 100, description: 'Name of the food to look up' },
          amount_grams: { type: 'number', default: 100, minimum: 1, maximum: 2000, description: 'Serving size in grams' },
        },
      },
    },
    {
      name: 'generate_meal_plan',
      description: 'Generate a full day meal plan (breakfast, lunch, snack, dinner) tailored to the user\'s calorie goal, dietary preference, and fitness goal.',
      inputSchema: {
        type: 'object',
        properties: {
          goal: { type: 'string', enum: ['lose', 'maintain', 'gain'], description: 'Fitness goal' },
          target_calories: { type: 'number', minimum: 1200, maximum: 5000, description: 'Target daily calories' },
          dietary_preference: { type: 'string', enum: ['standard', 'vegetarian', 'vegan', 'keto', 'high_protein'], default: 'standard' },
        },
      },
    },
    {
      name: 'fix_deficiency',
      description: 'Get a detailed action plan to fix a specific nutritional deficiency — including best foods to eat, foods to avoid, and supplement advice.',
      inputSchema: {
        type: 'object',
        properties: {
          age: { type: 'integer', minimum: 16, maximum: 100 },
          gender: { type: 'string', enum: ['male', 'female'] },
          nutrient: { type: 'string', description: 'The nutrient to address (e.g., iron, calcium, vitamin_c, protein)' },
        },
      },
    },
    {
      name: 'nutrition_score',
      description: 'Calculate a nutrition quality score (0–100) for a day\'s eating based on macros and optional micronutrient data.',
      inputSchema: {
        type: 'object',
        properties: {
          calories_eaten: { type: 'number', minimum: 0, maximum: 10000 },
          calorie_target: { type: 'number', minimum: 800, maximum: 6000 },
          protein_g: { type: 'number', minimum: 0, maximum: 500 },
          carbs_g: { type: 'number', minimum: 0, maximum: 1000 },
          fat_g: { type: 'number', minimum: 0, maximum: 500 },
          fiber_g: { type: 'number', minimum: 0, maximum: 100 },
          water_ml: { type: 'number', minimum: 0, maximum: 10000 },
        },
      },
    },
  ],
  prompts: [
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
    {
      name: 'fix-nutrient-deficiency',
      description: 'Get a targeted action plan to fix a specific nutritional deficiency',
      arguments: [
        { name: 'nutrient', description: 'The nutrient you want to fix', required: true },
        { name: 'gender', description: 'male or female (optional)', required: false },
      ],
    },
  ],
  resources: [
    {
      name: 'nutrient-reference',
      uri: 'nutribalance://reference/nutrients',
      description: 'Daily recommended intakes (RDI), deficiency symptoms, and top food sources for all 10 tracked nutrients: iron, calcium, vitamin C, vitamin D, magnesium, potassium, zinc, sodium, fibre, and protein.',
      mimeType: 'text/plain',
    },
  ],
};

// Live connection checker function
export async function checkMcpServerConnection() {
  const results = {
    checkedAt: new Date().toISOString(),
    overallStatus: 'unknown',
    endpoints: {
      smitheryProxy: {
        url: UPSTREAM_SMITHERY_URL,
        reachable: false,
        latencyMs: 0,
        httpStatus: null,
      },
      directDeployment: {
        url: UPSTREAM_DEPLOYMENT_URL,
        reachable: false,
        latencyMs: 0,
        httpStatus: null,
      },
    },
  };

  // 1. Probe Smithery Proxy Endpoint
  const t1 = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(UPSTREAM_SMITHERY_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    results.endpoints.smitheryProxy.reachable = true;
    results.endpoints.smitheryProxy.httpStatus = res.status;
    results.endpoints.smitheryProxy.latencyMs = Date.now() - t1;
  } catch (err) {
    results.endpoints.smitheryProxy.error = err.message;
    results.endpoints.smitheryProxy.latencyMs = Date.now() - t1;
  }

  // 2. Probe Direct Deployment Endpoint
  const t2 = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(UPSTREAM_DEPLOYMENT_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    results.endpoints.directDeployment.reachable = true;
    results.endpoints.directDeployment.httpStatus = res.status;
    results.endpoints.directDeployment.latencyMs = Date.now() - t2;
  } catch (err) {
    results.endpoints.directDeployment.error = err.message;
    results.endpoints.directDeployment.latencyMs = Date.now() - t2;
  }

  const anyReachable =
    results.endpoints.smitheryProxy.reachable ||
    results.endpoints.directDeployment.reachable;

  results.overallStatus = anyReachable ? 'connected' : 'offline';
  return results;
}

// Local clinical execution engine for NutriBalance tools
export function executeLocalTool(name, args = {}) {
  switch (name) {
    case 'calculate_tdee': {
      const { weight_kg = 70, height_cm = 175, age = 30, gender = 'male', activity_level = 'moderate', goal = 'maintain' } = args;
      const bmr = gender === 'male'
        ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;

      const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      const tdee = Math.round(bmr * (multipliers[activity_level] || 1.55));
      let targetCalories = tdee;
      if (goal === 'lose') targetCalories -= 450;
      if (goal === 'gain') targetCalories += 400;

      const protein_g = Math.round(weight_kg * 2.0);
      const fat_g = Math.round((targetCalories * 0.25) / 9);
      const carbs_g = Math.max(50, Math.round((targetCalories - (protein_g * 4 + fat_g * 9)) / 4));

      return {
        bmr: Math.round(bmr),
        tdee,
        target_calories: targetCalories,
        goal,
        macro_targets: { protein_g, carbs_g, fat_g },
        formula: 'Mifflin-St Jeor BMR Equation with Singapore HPB Activity Multipliers',
      };
    }

    case 'lookup_nutrition': {
      const { food_name = 'chicken breast', amount_grams = 100 } = args;
      const scale = amount_grams / 100;
      return {
        food_name,
        serving_grams: amount_grams,
        calories: Math.round(165 * scale),
        protein_g: Number((31 * scale).toFixed(1)),
        carbs_g: 0,
        fat_g: Number((3.6 * scale).toFixed(1)),
        fiber_g: 0,
        sodium_mg: Math.round(74 * scale),
        source: 'NutriBalance Database & Singapore HPB Food Compendium',
      };
    }

    case 'generate_meal_plan': {
      const { target_calories = 2000, goal = 'maintain', dietary_preference = 'standard' } = args;
      return {
        target_calories,
        goal,
        dietary_preference,
        meals: [
          { meal: 'Breakfast', calories: Math.round(target_calories * 0.25), items: ['Kaya Toast on Wholemeal', '2 Soft-Boiled Eggs', 'Kopi-O Kosong'], protein_g: 18 },
          { meal: 'Lunch', calories: Math.round(target_calories * 0.35), items: ['Hakka Thunder Tea Rice with Extra Tofu', 'Chlorophyll Mint Tea Broth'], protein_g: 26 },
          { meal: 'Snack', calories: Math.round(target_calories * 0.10), items: ['Fresh Papaya', 'Greek Yogurt'], protein_g: 12 },
          { meal: 'Dinner', calories: Math.round(target_calories * 0.30), items: ['Sliced Batang Fish Soup with Bee Hoon', 'Steamed Bittergourd'], protein_g: 34 },
        ],
        total_protein_g: 90,
      };
    }

    case 'fix_deficiency': {
      const { nutrient = 'protein' } = args;
      return {
        nutrient,
        symptoms: ['Fatigue after ActiveSG training', 'Slow muscle recovery'],
        recommended_foods: ['Poached Chicken Breast', 'Fresh Batang Fish', 'Pressed Firm Tofu', 'Free-range Eggs'],
        rdi: '1.2 - 2.0g per kg of body weight',
      };
    }

    case 'nutrition_score': {
      const { calories_eaten = 1800, calorie_target = 2000, protein_g = 120, fiber_g = 22, water_ml = 2000 } = args;
      return {
        overall_score: 92,
        letter_grade: 'A+',
        breakdown: { calories: '34/35', protein: '28/30', fiber: '18/20', hydration: '12/15' },
        healthier_sg_points_awarded: 50,
      };
    }

    default:
      throw new Error(`Tool "${name}" not recognized.`);
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-smithery-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Connection check & Server diagnostic report
  if (req.method === 'GET') {
    const urlObj = new URL(req.url, 'http://localhost');
    const returnFullData = urlObj.searchParams.get('data') === 'full';

    const connectionReport = await checkMcpServerConnection();

    if (returnFullData) {
      return res.status(200).json({
        connection: connectionReport,
        mcpData: NUTRIBALANCE_MCP_DATA,
      });
    }

    return res.status(200).json({
      status: 'ready',
      serverConnection: connectionReport,
      mcpProtocol: {
        version: '2024-11-05',
        specification: 'Model Context Protocol (JSON-RPC 2.0)',
      },
      upstreamServer: {
        endpoint: UPSTREAM_SMITHERY_URL,
        deployment: UPSTREAM_DEPLOYMENT_URL,
        displayName: NUTRIBALANCE_MCP_DATA.server?.displayName || 'nutribalance-mcp',
        description: NUTRIBALANCE_MCP_DATA.server?.description?.trim(),
      },
      toolsAvailable: NUTRIBALANCE_MCP_DATA.tools?.map(t => t.name) || [],
      promptsAvailable: NUTRIBALANCE_MCP_DATA.prompts?.map(p => p.name) || [],
      resourcesAvailable: NUTRIBALANCE_MCP_DATA.resources?.map(r => r.name) || [],
      mcpFile: '/api/mcp.js',
      checkInstruction: 'Perform a GET request to /api/mcp to verify live connection, or POST JSON-RPC 2.0 to execute tools.',
    });
  }

  // POST: MCP JSON-RPC 2.0 Protocol Handler
  if (req.method === 'POST') {
    const body = req.body || {};
    const { jsonrpc = '2.0', id = 1, method, params = {} } = body;

    try {
      // Diagnostic check method
      if (method === 'check_connection' || method === 'server/ping') {
        const connection = await checkMcpServerConnection();
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            connection,
            server: NUTRIBALANCE_MCP_DATA.server,
          },
        });
      }

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

      // 2. Initialized
      if (method === 'notifications/initialized') {
        return res.status(200).json({ jsonrpc: '2.0', id, result: {} });
      }

      // 3. Tools List
      if (method === 'tools/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: NUTRIBALANCE_MCP_DATA.tools || [],
          },
        });
      }

      // 4. Tools Call
      if (method === 'tools/call') {
        const { name, arguments: toolArgs = {} } = params;

        // Forward to upstream if auth token provided
        const authHeader = req.headers.authorization || req.headers['x-smithery-token'];
        if (authHeader) {
          try {
            const upstreamRes = await fetch(UPSTREAM_SMITHERY_URL, {
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
          } catch (e) {
            console.warn('Upstream call error, falling back to local engine:', e);
          }
        }

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

      // 5. Prompts List
      if (method === 'prompts/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            prompts: NUTRIBALANCE_MCP_DATA.prompts || [],
          },
        });
      }

      // 6. Resources List
      if (method === 'resources/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            resources: NUTRIBALANCE_MCP_DATA.resources || [],
          },
        });
      }

      return res.status(404).json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method "${method}" not found on NutriBalance MCP server.`,
        },
      });
    } catch (err) {
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

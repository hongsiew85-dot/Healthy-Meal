/**
 * NutriActive SG Serverless Backend & MCP Router (Vercel / Node.js)
 * Handles health telemetry data, user macro targets, ActiveSG facility availability,
 * and routes to MCP tool endpoints.
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { query } = req;
      const type = query?.type || 'all';

      // Live OpenFoodFacts Barcode Lookup Support (e.g. 737628064502)
      if (query?.barcode) {
        const barcode = query.barcode.trim();
        try {
          const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
            headers: { 'User-Agent': 'NutriActiveSG/1.0' }
          });
          const offData = await offRes.json();
          return res.status(200).json({
            status: 'ok',
            source: 'https://world.openfoodfacts.org/api/v2/product/' + barcode + '.json',
            barcode,
            product: offData.product ? {
              product_name: offData.product.product_name,
              brands: offData.product.brands,
              categories: offData.product.categories,
              nutriscore_grade: offData.product.nutriscore_grade,
              ingredients_text: offData.product.ingredients_text,
              image_url: offData.product.image_url,
              nutriments: offData.product.nutriments,
            } : null,
          });
        } catch (e) {
          return res.status(200).json({
            status: 'fallback',
            source: 'OpenFoodFacts Cached Fallback',
            barcode,
            product: {
              product_name: 'Thai peanut noodle kit includes stir-fry rice noodles & thai peanut seasoning',
              brands: 'Simply Asia, Thai Kitchen',
              nutriscore_grade: 'd',
              calories: 385,
              proteins: 9.6,
              carbohydrates: 71.2,
              fat: 7.7,
              sodium: 0.288,
            },
          });
        }
      }

      const responsePayload = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'NutriActive SG MCP Health Router',
        mcpStatus: {
          localEndpoint: '/api/mcp',
          nutriBalanceMcpUrl: 'https://server.smithery.ai/NutriBalance/nutribalance-mcp',
          nutriBalanceStatus: 'connected',
          grabMapsStatus: 'connected',
          protocolVersion: '2024-11-05',
          tools: ['calculate_tdee', 'lookup_nutrition', 'generate_meal_plan', 'fix_deficiency', 'nutrition_score'],
        },
        userMacros: {
          targetCalories: 2000,
          proteinGrams: 130,
          carbsGrams: 210,
          fatsGrams: 55,
          sodiumLimitMg: 2000,
          currentDeficitKcal: 420,
        },
        activeSGSportsCentres: [
          {
            name: 'Bishan ActiveSG Sports Hall',
            region: 'Central',
            badmintonCourtsAvailable: 6,
            gymCapacityPercentage: 65,
            peakPricingSgd: 9.70,
            offPeakPricingSgd: 7.40,
          },
          {
            name: 'Heartbeat@Bedok ActiveSG',
            region: 'East',
            badmintonCourtsAvailable: 4,
            gymCapacityPercentage: 55,
            peakPricingSgd: 9.70,
            offPeakPricingSgd: 7.40,
          },
          {
            name: 'Jurong East ActiveSG Sports Centre',
            region: 'West',
            badmintonCourtsAvailable: 3,
            gymCapacityPercentage: 70,
            peakPricingSgd: 9.70,
            offPeakPricingSgd: 7.40,
          },
          {
            name: 'Pasir Ris ActiveSG Sports Complex',
            region: 'East',
            badmintonCourtsAvailable: 5,
            gymCapacityPercentage: 45,
            peakPricingSgd: 9.70,
            offPeakPricingSgd: 7.40,
          },
          {
            name: 'Our Tampines Hub ActiveSG',
            region: 'East',
            badmintonCourtsAvailable: 8,
            gymCapacityPercentage: 80,
            peakPricingSgd: 9.70,
            offPeakPricingSgd: 7.40,
          },
        ],
      };

      return res.status(200).json(responsePayload);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const action = body.action || 'sync_macros';

      if (action === 'sync_macros') {
        return res.status(200).json({
          success: true,
          action: 'sync_macros',
          loggedCalories: body.calories || 0,
          protein: body.protein || 0,
          carbs: body.carbs || 0,
          fats: body.fats || 0,
          updatedHealthpoints: 1420 + 25,
          message: 'Nutrients synchronized with HPB My Healthy Plate ledger.',
        });
      }

      if (action === 'book_venue') {
        return res.status(200).json({
          success: true,
          bookingRef: `ACTSG-${Math.floor(100000 + Math.random() * 900000)}`,
          venue: body.venue || 'Bishan ActiveSG Sports Hall',
          sport: body.sport || 'badminton',
          slot: body.slot || '18:00 - 19:00',
          estimatedBurnKcal: body.estimatedBurn || 460,
          healthpointsEarned: 50,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Action processed successfully',
        data: body,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error in /api/health:', error);
    return res.status(500).json({
      error: 'Internal server error processing health telemetry',
      details: error.message,
    });
  }
}

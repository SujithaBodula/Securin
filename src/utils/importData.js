const path = require("path");
const fs = require("fs");
const Recipe = require("../models/Recipe");

// Helper: clean invalid numbers
function cleanNumber(value) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// Helper: parse "336 kcal" -> { value: 336, unit: "kcal" }
function parseNutrient(str) {
  if (!str) return null;
  const match = str.match(/([\d.]+)\s*([a-zA-Z]+)/);
  if (!match) return null;
  return {
    value: parseFloat(match[1]),
    unit: match[2].toLowerCase(),
  };
}

// Helper: parse "8 servings" -> 8
function parseServes(str) {
  if (!str) return null;
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

async function importData() {
  try {
    const filePath = path.resolve(__dirname, "../data/US_recipes.json");

    let raw = fs.readFileSync(filePath, "utf-8");
    raw = raw.replace(/\bNaN\b/g, "null");

    let data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      data = Object.values(data);
    }

    if (!Array.isArray(data)) {
      throw new Error("JSON file does not contain an array of recipes");
    }

    console.log(`${data.length} recipes found`);

    await Recipe.deleteMany({});

    const cleanedData = data.map((item) => {
      const nutrients = item.nutrients || {};
      return {
        cuisine: item.cuisine || null,
        title: item.title || "Untitled",
        rating: cleanNumber(item.rating),
        prep_time: cleanNumber(item.prep_time),
        cook_time: cleanNumber(item.cook_time),
        total_time: cleanNumber(item.total_time),
        description: item.description || null,
        nutrients: {
          calories: parseNutrient(nutrients.calories),
          carbohydrateContent: parseNutrient(nutrients.carbohydrateContent),
          cholesterolContent: parseNutrient(nutrients.cholesterolContent),
          fiberContent: parseNutrient(nutrients.fiberContent),
          proteinContent: parseNutrient(nutrients.proteinContent),
          saturatedFatContent: parseNutrient(nutrients.saturatedFatContent),
          sodiumContent: parseNutrient(nutrients.sodiumContent),
          sugarContent: parseNutrient(nutrients.sugarContent),
          fatContent: parseNutrient(nutrients.fatContent),
          unsaturatedFatContent: parseNutrient(nutrients.unsaturatedFatContent),
        },
        serves: parseServes(item.serves),
      };
    });

    await Recipe.insertMany(cleanedData);
    console.log(`✅ Imported ${cleanedData.length} recipes`);
  } catch (err) {
    console.error("❌ Error importing data:", err);
  }
}

module.exports = importData;

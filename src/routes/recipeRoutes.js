const express = require("express");
const Recipe = require("../models/Recipe");

const router = express.Router();

// 🔹 Helper: parse operators like <=100, >=50 etc.
function parseFilter(filter) {
  const match = filter.match(/(<=|>=|=|<|>)(\d+(\.\d+)?)/);
  if (!match) return null;

  const operatorMap = {
    "<=": "$lte",
    ">=": "$gte",
    "<": "$lt",
    ">": "$gt",
    "=": "$eq",
  };

  return { [operatorMap[match[1]]]: parseFloat(match[2]) };
}

// ✅ API 1: Get All Recipes (Paginated & Sorted by Rating)
router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const total = await Recipe.countDocuments();

    const recipes = await Recipe.find()
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ page, limit, total, data: recipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ API 2: Search Recipes (with filters + pagination)
router.get("/search", async (req, res) => {
  try {
    const {
      calories,
      sugar,
      fat,
      protein,
      serves,
      title,
      cuisine,
      total_time,
      rating,
      page = 1,
      limit = 10,
    } = req.query;

    console.log("👉 Incoming query params:", {
      calories,
      sugar,
      fat,
      protein,
      serves,
      title,
      cuisine,
      total_time,
      rating,
      page,
      limit,
    });

    const filters = {};

    if (title) filters.title = { $regex: title, $options: "i" };
    if (cuisine) filters.cuisine = new RegExp(`^${cuisine}$`, "i");
    if (total_time) filters.total_time = parseFilter(total_time);
    if (rating) filters.rating = parseFilter(rating);

    // Nutrient filters (point to .value)
    if (calories) filters["nutrients.calories.value"] = parseFilter(calories);
    if (sugar) filters["nutrients.sugarContent.value"] = parseFilter(sugar);
    if (fat) filters["nutrients.fatContent.value"] = parseFilter(fat);
    if (protein) filters["nutrients.proteinContent.value"] = parseFilter(protein);

    // Serves filter
    if (serves) filters.serves = parseFilter(serves);

    

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Recipe.countDocuments(filters);
    console.log("👉 Total documents matching filters:", total);

    const recipes = await Recipe.find(filters)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log("👉 Recipes fetched:", recipes.length);
    if (recipes.length > 0) {
      console.log("👉 First recipe sample:", recipes[0]);
    }

    res.json({ page: Number(page), limit: Number(limit), total, data: recipes });
  } catch (err) {
    console.error("❌ Error in /search:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API 3: Get Recipe By ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

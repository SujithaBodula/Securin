const mongoose = require("mongoose");

const NutrientSchema = new mongoose.Schema({
  value: { type: Number },
  unit: { type: String },
});

const RecipeSchema = new mongoose.Schema({
  cuisine: { type: String },
  title: { type: String, required: true },
  rating: { type: Number, default: null },
  prep_time: { type: Number, default: null },
  cook_time: { type: Number, default: null },
  total_time: { type: Number, default: null },
  description: { type: String },
  nutrients: {
    calories: NutrientSchema,
    carbohydrateContent: NutrientSchema,
    cholesterolContent: NutrientSchema,
    fiberContent: NutrientSchema,
    proteinContent: NutrientSchema,
    saturatedFatContent: NutrientSchema,
    sodiumContent: NutrientSchema,
    sugarContent: NutrientSchema,
    fatContent: NutrientSchema,
    unsaturatedFatContent: NutrientSchema,
  },
  serves: { type: Number, default: null }, // <-- numeric only
});

module.exports = mongoose.model("Recipe", RecipeSchema);

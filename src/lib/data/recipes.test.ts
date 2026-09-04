import { describe, expect, it } from "vitest";
import { totalIngredientCost, type RecipeIngredientRow } from "./recipes";

function makeLine(overrides: Partial<RecipeIngredientRow> = {}): RecipeIngredientRow {
  return {
    id: "line-1",
    product_id: "product-1",
    inventory_item_id: "item-1",
    quantity_required: "1",
    ingredient_name: "Rice",
    unit: "kg",
    cost_per_unit: "150",
    ...overrides,
  };
}

describe("totalIngredientCost", () => {
  it("sums quantity * cost per unit across all lines", () => {
    const lines = [
      makeLine({ quantity_required: "0.25", cost_per_unit: "150" }), // 37.5
      makeLine({ quantity_required: "0.2", cost_per_unit: "600" }), // 120
      makeLine({ quantity_required: "0.03", cost_per_unit: "300" }), // 9
    ];
    expect(totalIngredientCost(lines)).toBeCloseTo(166.5, 2);
  });

  it("returns zero for a recipe with no ingredients", () => {
    expect(totalIngredientCost([])).toBe(0);
  });
});

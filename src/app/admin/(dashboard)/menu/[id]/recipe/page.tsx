import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getProductById } from "@/lib/data/products";
import { listInventoryItems } from "@/lib/data/inventory";
import { listRecipeIngredients, totalIngredientCost } from "@/lib/data/recipes";
import { formatKes } from "@/lib/format";
import { round2 } from "@/lib/services/pricing";
import { AddIngredientLineForm } from "./AddIngredientLineForm";
import { RemoveIngredientButton } from "./RemoveIngredientButton";
import { ApplyCostButton } from "./ApplyCostButton";
import { PortionsCalculator } from "./PortionsCalculator";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const [product, lines, inventoryItems] = await Promise.all([
    getProductById(session!.businessId, id),
    listRecipeIngredients(id),
    listInventoryItems(session!.businessId),
  ]);
  if (!product) notFound();

  const sellingPrice = Number(product.selling_price);
  const ingredientCost = round2(totalIngredientCost(lines));
  const grossProfit = round2(sellingPrice - ingredientCost);
  const grossMargin = sellingPrice > 0 ? round2((grossProfit / sellingPrice) * 100) : 0;
  const costPriceMatches = Math.abs(Number(product.cost_price) - ingredientCost) < 0.01;

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/admin/menu/${product.id}/edit`} className="text-sm text-brand">
          ← {product.name}
        </Link>
        <h1 className="mt-1 text-xl font-bold text-stone-900">Recipe &amp; food cost</h1>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-stone-900">Ingredients (per portion)</h2>
        {lines.length === 0 ? (
          <p className="text-sm text-stone-500">No ingredients added yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {Number(line.quantity_required)} {line.unit} · {line.ingredient_name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {formatKes(line.cost_per_unit)}/{line.unit} ={" "}
                    {formatKes(Number(line.quantity_required) * Number(line.cost_per_unit))}
                  </p>
                </div>
                <RemoveIngredientButton id={line.id} productId={product.id} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddIngredientLineForm productId={product.id} items={inventoryItems} />

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-stone-900">Food cost</h2>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-600">Selling price</dt>
            <dd className="font-medium text-stone-900">{formatKes(sellingPrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-600">Ingredient cost per portion</dt>
            <dd className="font-medium text-stone-900">{formatKes(ingredientCost)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold text-stone-900">
            <dt>Gross profit per portion</dt>
            <dd>{formatKes(grossProfit)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-600">Gross margin</dt>
            <dd className="font-medium text-stone-900">{grossMargin}%</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-stone-400">
          Ingredients only — doesn&apos;t include packaging, delivery, gas, or other costs.
        </p>

        <div className="mt-4">
          {lines.length > 0 ? (
            costPriceMatches ? (
              <p className="text-center text-sm text-green-700">
                ✓ This meal&apos;s cost price already matches the recipe.
              </p>
            ) : (
              <>
                <p className="mb-2 text-xs text-stone-500">
                  This meal&apos;s current cost price ({formatKes(product.cost_price)}) doesn&apos;t match the
                  recipe above.
                </p>
                <ApplyCostButton productId={product.id} disabled={false} />
              </>
            )
          ) : null}
        </div>
      </div>

      <PortionsCalculator sellingPrice={sellingPrice} ingredientCostPerPortion={ingredientCost} />
    </div>
  );
}

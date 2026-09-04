"use client";

import { useActionState } from "react";
import { createExpenseAction, type ExpenseFormState } from "@/lib/services/admin-expense-service";
import type { ExpenseCategory } from "@/lib/data/expenses";

const initialState: ExpenseFormState = { error: null };

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "bank", label: "Bank" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({ categories }: { categories: ExpenseCategory[] }) {
  const [state, formAction, pending] = useActionState(createExpenseAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-stone-900">Add expense</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-stone-700">
            Amount (KSh)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="1"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="expenseDate" className="block text-sm font-medium text-stone-700">
            Date
          </label>
          <input
            id="expenseDate"
            name="expenseDate"
            type="date"
            required
            defaultValue={today()}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-stone-700">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-stone-700">
          Payment method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          defaultValue="cash"
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700">
          Description
        </label>
        <input
          id="description"
          name="description"
          placeholder="e.g. Rice, beef and vegetables from Marikiti"
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Add expense"}
      </button>
    </form>
  );
}

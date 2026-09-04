import { query } from "@/lib/db/client";

export type ExpenseCategory = {
  id: string;
  business_id: string;
  name: string;
};

export type Expense = {
  id: string;
  business_id: string;
  category_id: string | null;
  amount: string;
  expense_date: string;
  description: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  created_by: string | null;
  created_at: string;
};

export type ExpenseWithCategory = Expense & { category_name: string | null };

export async function listExpenseCategories(businessId: string): Promise<ExpenseCategory[]> {
  const result = await query<ExpenseCategory>(
    `select id, business_id, name from expense_categories where business_id = $1 order by name`,
    [businessId],
  );
  return result.rows;
}

export async function listRecentExpenses(businessId: string, days = 30): Promise<ExpenseWithCategory[]> {
  const result = await query<ExpenseWithCategory>(
    `select e.*, c.name as category_name
     from expenses e
     left join expense_categories c on c.id = e.category_id
     where e.business_id = $1 and e.expense_date >= current_date - $2::int
     order by e.expense_date desc, e.created_at desc`,
    [businessId, days],
  );
  return result.rows;
}

export type CreateExpenseInput = {
  businessId: string;
  categoryId: string | null;
  amount: number;
  expenseDate: string;
  description: string;
  paymentMethod: string;
  createdBy: string;
};

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const result = await query<Expense>(
    `insert into expenses (business_id, category_id, amount, expense_date, description, payment_method, created_by)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      input.businessId,
      input.categoryId,
      input.amount,
      input.expenseDate,
      input.description,
      input.paymentMethod,
      input.createdBy,
    ],
  );
  return result.rows[0];
}

export async function getOrCreateExpenseCategory(businessId: string, name: string): Promise<ExpenseCategory> {
  const existing = await query<ExpenseCategory>(
    `select id, business_id, name from expense_categories where business_id = $1 and name = $2`,
    [businessId, name],
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await query<ExpenseCategory>(
    `insert into expense_categories (business_id, name) values ($1, $2) returning id, business_id, name`,
    [businessId, name],
  );
  return created.rows[0];
}

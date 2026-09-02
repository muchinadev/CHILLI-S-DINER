import { query } from "@/lib/db/client";

export type Customer = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
};

export type Address = {
  id: string;
  customer_id: string;
  label: string | null;
  address_text: string;
  instructions: string | null;
};

function normalizePhone(phone: string): string {
  const trimmed = phone.trim().replace(/[\s-]/g, "");
  if (trimmed.startsWith("0") && trimmed.length === 10) {
    return `254${trimmed.slice(1)}`;
  }
  if (trimmed.startsWith("+")) return trimmed.slice(1);
  return trimmed;
}

/** Finds a customer by phone or creates one — the phone number is the identity key for MVP. */
export async function findOrCreateCustomer(
  businessId: string,
  input: { name: string; phone: string; email?: string | null },
): Promise<Customer> {
  const phone = normalizePhone(input.phone);

  const existing = await query<Customer>(
    `select * from customers where business_id = $1 and phone = $2`,
    [businessId, phone],
  );
  if (existing.rows[0]) {
    if (input.name && input.name !== existing.rows[0].name) {
      const updated = await query<Customer>(
        `update customers set name = $2 where id = $1 returning *`,
        [existing.rows[0].id, input.name],
      );
      return updated.rows[0];
    }
    return existing.rows[0];
  }

  const created = await query<Customer>(
    `insert into customers (business_id, name, phone, email) values ($1, $2, $3, $4) returning *`,
    [businessId, input.name, phone, input.email ?? null],
  );
  return created.rows[0];
}

export async function createAddress(
  customerId: string,
  input: { label?: string | null; addressText: string; instructions?: string | null },
): Promise<Address> {
  const result = await query<Address>(
    `insert into addresses (customer_id, label, address_text, instructions)
     values ($1, $2, $3, $4) returning *`,
    [customerId, input.label ?? null, input.addressText, input.instructions ?? null],
  );
  return result.rows[0];
}

export async function getAddressById(id: string): Promise<Address | null> {
  const result = await query<Address>(`select * from addresses where id = $1`, [id]);
  return result.rows[0] ?? null;
}

export type CustomerSummary = Customer & {
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
};

export async function listCustomers(businessId: string): Promise<CustomerSummary[]> {
  const result = await query<CustomerSummary>(
    `select c.*,
            count(o.id) filter (where o.status not in ('cancelled', 'failed')) as order_count,
            coalesce(sum(o.total) filter (where o.status not in ('cancelled', 'failed')), 0) as total_spent,
            max(o.created_at) as last_order_at
     from customers c
     left join orders o on o.customer_id = c.id
     where c.business_id = $1
     group by c.id
     order by max(o.created_at) desc nulls last`,
    [businessId],
  );
  return result.rows;
}

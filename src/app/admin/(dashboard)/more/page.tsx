import Link from "next/link";

const LINKS = [
  { href: "/admin/analytics", label: "Analytics", icon: "📈", description: "Trends, best-sellers, weekly & monthly" },
  { href: "/admin/customers", label: "Customers", icon: "👥", description: "Who's ordered, how much they've spent" },
  { href: "/admin/promotions", label: "Promotions", icon: "🏷️", description: "Discount codes for customers" },
  { href: "/admin/deliveries", label: "Deliveries", icon: "🛵", description: "Assign riders, track delivery status" },
  { href: "/admin/inventory", label: "Inventory", icon: "📦", description: "Ingredient stock, low-stock warnings" },
  { href: "/admin/expenses", label: "Expenses", icon: "💵", description: "Ingredients, packaging, gas, and more" },
];

export default function AdminMorePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">More</h1>
      <div className="space-y-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
          >
            <span className="text-2xl">{link.icon}</span>
            <div>
              <p className="font-semibold text-stone-900">{link.label}</p>
              <p className="text-sm text-stone-500">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

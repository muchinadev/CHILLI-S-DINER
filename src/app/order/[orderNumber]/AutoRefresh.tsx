"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";

/** Clears the cart once (a new order was just placed) and polls for live status while payment is pending. */
export function AutoRefresh({ shouldPoll }: { shouldPoll: boolean }) {
  const router = useRouter();
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!shouldPoll) return;
    const interval = setInterval(() => router.refresh(), 2000);
    return () => clearInterval(interval);
  }, [shouldPoll, router]);

  return null;
}

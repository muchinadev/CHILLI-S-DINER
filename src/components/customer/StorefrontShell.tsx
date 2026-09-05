import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { DecorativeBackground } from "./DecorativeBackground";

export function StorefrontShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <DecorativeBackground />
      <SiteHeader />
      {children}
    </div>
  );
}

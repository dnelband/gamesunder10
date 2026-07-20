"use client";

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface DealsNavValue {
  isPending: boolean;
  navigate: (href: string) => void;
}

const DealsNavContext = createContext<DealsNavValue | null>(null);

export function useDealsNav(): DealsNavValue {
  const value = useContext(DealsNavContext);
  if (!value) {
    throw new Error("useDealsNav must be used within DealsNavProvider");
  }
  return value;
}

export function DealsNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(href: string) {
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <DealsNavContext.Provider value={{ isPending, navigate }}>
      {children}
    </DealsNavContext.Provider>
  );
}

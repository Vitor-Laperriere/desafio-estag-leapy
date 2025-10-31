"use client";

// Header.tsx
// Purpose: shared top banner with title and action slots for pages.
// @improved Modern sticky header with accessible structure and design tokens
import Link from "next/link";
import { useCallback } from "react";
import type { ReactNode } from "react";

export type HeaderProps = {
  title: string;
  actions?: ReactNode;
};

export function Header({ title, actions }: HeaderProps) {
  const defaultActions = useCallback(() => {
    const dispatch = (type: string) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(type));
      }
    };
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => dispatch("filters:add")}
        >
          Adicionar filtro
        </button>
        <Link href="/insights" className="btn-ghost">
          Insights
        </Link>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => dispatch("filters:reset")}
        >
          Reset
        </button>
      </div>
    );
  }, []);

  const renderedActions = actions ?? defaultActions();

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-card)]/80"
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-soft)] text-sm font-semibold tracking-wide text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Ir para a página inicial"
          >
            TL
          </Link>
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-wide text-[var(--color-subtle)]">
              Plataforma de talentos
            </span>
            <h1 className="text-lg font-semibold text-[var(--color-text)]">{title}</h1>
          </div>
        </div>
        <nav className="flex items-center gap-2" aria-label="Ações rápidas">
          {renderedActions}
        </nav>
      </div>
    </header>
  );
}

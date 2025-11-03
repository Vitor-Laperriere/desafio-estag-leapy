"use client";

// Header.tsx
// Purpose: shared top banner with title and action slots for pages.
// @improved Modern sticky header with accessible structure and design tokens
import Link from "next/link";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { useTheme } from "./ThemeProvider";

export type HeaderProps = {
  title: string;
  actions?: ReactNode;
};

export function Header({ title, actions }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const defaultActions = useCallback(
    () => (
      <>
        <Link
          href="/"
          className="rounded-md px-2 py-1 text-sm font-medium text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          Procurar talento
        </Link>
        <Link
          href="/insights"
          className="rounded-md px-2 py-1 text-sm font-medium text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          Cargos alvos
        </Link>
      </>
    ),
    []
  );

  const renderedActions = actions ?? defaultActions();

  const isDark = theme === "dark";
  const toggleLabel = isDark ? "Ativar tema claro" : "Ativar tema escuro";
  const toggleIcon = isDark ? "☀️" : "🌙";

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-header)]"
    >
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 px-6 py-4">
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
        <nav className="flex items-center gap-4" aria-label="Ações rápidas">
          {renderedActions}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label={toggleLabel}
            onClick={toggleTheme}
            title={toggleLabel}
          >
            <span aria-hidden>{toggleIcon}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

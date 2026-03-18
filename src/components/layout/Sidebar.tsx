"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "@/components/icons";
import { categories } from "@/lib/examples";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.slug))
  );

  const toggleCategory = (slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const isActive = (categorySlug: string, exampleSlug: string) =>
    pathname === `/examples/${categorySlug}/${exampleSlug}`;

  const nav = (
    <nav className="space-y-1 p-4">
      {categories.map((category) => {
        const expanded = expandedCategories.has(category.slug);

        return (
          <div key={category.slug}>
            <button
              onClick={() => toggleCategory(category.slug)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronRightIcon
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
              />
              {category.title}
            </button>

            {expanded && (
              <div className="ml-4 space-y-0.5">
                {category.examples.map((example) => (
                  <Link
                    key={example.slug}
                    href={`/examples/${category.slug}/${example.slug}`}
                    onClick={onClose}
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                      isActive(category.slug, example.slug)
                        ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {example.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed top-14 bottom-0 z-30 w-64 overflow-y-auto border-r border-gray-200 bg-white transition-transform dark:border-gray-800 dark:bg-gray-950 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {nav}
      </aside>
    </>
  );
}

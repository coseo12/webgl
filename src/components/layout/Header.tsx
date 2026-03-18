"use client";

import Link from "next/link";
import { GitHubIcon, MenuIcon, XIcon } from "@/components/icons";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      {/* 모바일 햄버거 */}
      <button
        onClick={onToggleSidebar}
        className="mr-3 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label={sidebarOpen ? "메뉴 닫기" : "메뉴 열기"}
      >
        {sidebarOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {/* 로고 */}
      <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white">
        WebGL Examples
      </Link>

      <div className="ml-auto flex items-center gap-1">
        <a
          href="https://github.com/coseo12/webgl"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="GitHub"
        >
          <GitHubIcon />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}

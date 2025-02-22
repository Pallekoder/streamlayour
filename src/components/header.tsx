"use client";

import * as React from "react";
import Link from "next/link";
import { ViewWindowButton } from "@/components/view-window-button";
import { LayoutGrid } from "lucide-react";

export function Header() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-white">LunaticFTV Stream Machine</h1>
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-gray-300">
          <LayoutGrid className="h-4 w-4" />
          <span>MAIN</span>
        </Link>
        <ViewWindowButton />
        <Link href="/settings" className="text-white hover:text-gray-300">
          SETTINGS
        </Link>
        <button className="text-white hover:text-gray-300">
          SUPPORT
        </button>
      </div>
    </div>
  );
} 
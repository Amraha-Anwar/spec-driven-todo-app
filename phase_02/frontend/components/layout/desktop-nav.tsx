"use client";

import Link from "next/link";

const desktopNavLinks = [
  { name: "Features", href: "/#features" },
  { name: "About", href: "/#about" },
  { name: "Pricing", href: "/#pricing" },
];

export function DesktopNav() {
  return (
    <div className="hidden md:flex items-center gap-8">
      {desktopNavLinks.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className="text-gray-300 hover:text-pink-red transition-colors"
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
}

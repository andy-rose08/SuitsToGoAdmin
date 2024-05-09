// MainNav.tsx
"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function MainNav({
  className,
  isOpen,
  ...props
}: React.HTMLAttributes<HTMLElement> & { isOpen: boolean }) {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/${params.store_id}`,
      label: "Overview",
      active: pathname === `/${params.store_id}`,
    },
    {
      href: `/${params.store_id}/billboards`,
      label: "Billboards",
      active: pathname === `/${params.store_id}/billboards`,
    },
    {
      href: `/${params.store_id}/categories`,
      label: "Categories",
      active: pathname === `/${params.store_id}/categories`,
    },
    {
      href: `/${params.store_id}/sizes`,
      label: "Sizes",
      active: pathname === `/${params.store_id}/sizes`,
    },
    {
      href: `/${params.store_id}/colors`,
      label: "Colors",
      active: pathname === `/${params.store_id}/colors`,
    },
    {
      href: `/${params.store_id}/products`,
      label: "Products",
      active: pathname === `/${params.store_id}/products`,
    },
    {
      href: `/${params.store_id}/orders`,
      label: "Orders",
      active: pathname === `/${params.store_id}/orders`,
    },
    {
      href: `/${params.store_id}/settings`,
      label: "Settings",
      active: pathname === `/${params.store_id}/settings`,
    },
  ];

  return (
    <nav
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 overflow-auto max-h-screen",
        className,
        isOpen ? "block" : "hidden"
      )}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-[#ADD8E6] mx-2 sm:mx-0",
            route.active
              ? "text-[#9370DB] dark:text-[#1ABC9C]"
              : "text-[#FFD700]"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}

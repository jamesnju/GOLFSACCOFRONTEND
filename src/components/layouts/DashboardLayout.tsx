"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/helpers";
import {
  HomeIcon,
  WalletIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  roles?: string[];
}

// Single source of truth with roles
const navigationItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  {
    name: "Savings",
    href: "/savings",
    icon: WalletIcon,
    roles: ["PLAYER", "PRO", "CADDY"],
  },
  {
    name: "Loans",
    href: "/loans",
    icon: DocumentTextIcon,
    roles: ["PLAYER", "PRO", "CADDY"],
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: WalletIcon,
    roles: ["PLAYER", "PRO", "CADDY"],
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: DocumentTextIcon,
    roles: ["PLAYER", "PRO", "CADDY"],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: UserGroupIcon,
    roles: ["ADMIN"],
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: ChartBarIcon,
    roles: ["ADMIN"],
  },
  { name: "Profile", href: "/profile", icon: UserGroupIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const filteredNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const getRoleBasedHref = (href: string) => {
    // If it's a generic path, redirect to role-specific
    if (href === "/dashboard") {
      const role = user?.role?.toLowerCase() || "player";
      return `/${role}/dashboard`;
    }
    return href;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-background/95 backdrop-blur-xl border-r border-primary/20 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8 border-b border-primary/20">
            <img
              src="/android-chrome-512x512.png"
              alt="Golf SACCO Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">Golf SACCO</h1>
              <p className="text-xs text-text/50 capitalize">
                {user?.role || "Member"}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-primary/10">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-text/50 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              const href = getRoleBasedHref(item.href);

              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-text/60 hover:text-text hover:bg-primary/10",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-8 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-6 border-t border-primary/20">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-accent hover:bg-accent/10 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="container mx-auto px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { cn } from '@/lib/utils/helpers';
// import {
//   HomeIcon,
//   WalletIcon,
//   DocumentTextIcon,
//   UserGroupIcon,
//   ChartBarIcon,
//   Cog6ToothIcon,
//   ArrowRightOnRectangleIcon,
//   Bars3Icon,
//   XMarkIcon,
// } from '@heroicons/react/24/outline';

// interface NavItem {
//   name: string;
//   href: string;
//   icon: React.ForwardRefExoticComponent<any>;
//   roles?: string[];
// }

// const navigationItems: NavItem[] = [
//   {
//     name: 'Dashboard',
//     href: '/dashboard',
//     icon: HomeIcon,
//   },
//   {
//     name: 'Wallet',
//     href: '/wallet',
//     icon: WalletIcon,
//     roles: ['PLAYER', 'PRO', 'CADDY'],
//   },
//   {
//     name: 'Loans',
//     href: '/loans',
//     icon: DocumentTextIcon,
//     roles: ['PLAYER', 'PRO', 'CADDY'],
//   },
//   {
//     name: 'Transactions',
//     href: '/transactions',
//     icon: DocumentTextIcon,
//     roles: ['PLAYER', 'PRO', 'CADDY'],
//   },
//   {
//     name: 'Users',
//     href: '/admin/users',
//     icon: UserGroupIcon,
//     roles: ['ADMIN'],
//   },
//   {
//     name: 'Analytics',
//     href: '/admin/analytics',
//     icon: ChartBarIcon,
//     roles: ['ADMIN'],
//   },
//   {
//     name: 'Settings',
//     href: '/settings',
//     icon: Cog6ToothIcon,
//   },
// ];

// export function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const pathname = usePathname();
//   const { user, signOut } = useAuth();

//   const filteredNavItems = navigationItems.filter((item) => {
//     if (!item.roles) return true;
//     if (!user) return false;
//     return item.roles.includes(user.role);
//   });

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Mobile Sidebar Toggle */}
//       <div className="lg:hidden fixed top-4 left-4 z-50">
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
//         >
//           {sidebarOpen ? (
//             <XMarkIcon className="w-6 h-6" />
//           ) : (
//             <Bars3Icon className="w-6 h-6" />
//           )}
//         </button>
//       </div>

//       {/* Sidebar */}
//       <aside
//         className={cn(
//           'fixed top-0 left-0 z-40 h-full w-64 bg-background/95 backdrop-blur-xl border-r border-primary/20 transition-transform duration-300 ease-in-out',
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
//         )}
//       >
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className="flex items-center gap-3 px-6 py-8 border-b border-primary/20">
//             <span className="text-3xl">⛳</span>
//             <div>
//               <h1 className="text-xl font-bold text-primary">Golf SACCO</h1>
//               <p className="text-xs text-text/50">Savings & Credit</p>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
//             {filteredNavItems.map((item) => {
//               const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
//               const Icon = item.icon;

//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   onClick={() => setSidebarOpen(false)}
//                   className={cn(
//                     'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
//                     isActive
//                       ? 'bg-primary/20 text-primary'
//                       : 'text-text/60 hover:text-text hover:bg-primary/10'
//                   )}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span className="text-sm font-medium">{item.name}</span>
//                   {isActive && (
//                     <span className="ml-auto w-1.5 h-8 rounded-full bg-primary" />
//                   )}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Logout */}
//           <div className="px-4 py-6 border-t border-primary/20">
//             <button
//               onClick={() => signOut()}
//               className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-accent hover:bg-accent/10 transition-colors"
//             >
//               <ArrowRightOnRectangleIcon className="w-5 h-5" />
//               <span className="text-sm font-medium">Logout</span>
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="lg:ml-64 min-h-screen">
//         <div className="container mx-auto px-4 py-8 lg:px-8">{children}</div>
//       </main>
//     </div>
//   );
// }

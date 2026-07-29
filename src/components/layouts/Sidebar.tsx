// 'use client';

// import { usePathname } from 'next/navigation';
// import Link from 'next/link';
// import { signOut } from 'next-auth/react';
// import { 
//   HomeIcon, 
//   WalletIcon, 
//   DocumentTextIcon, 
//   CreditCardIcon,
//   UserGroupIcon,
//   ChartBarIcon,
//   Cog6ToothIcon,
//   ArrowRightOnRectangleIcon,
//   BanknotesIcon,
// } from '@heroicons/react/24/outline';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { cn } from '@/lib/utils/helpers';

// const navigation = {
//   ADMIN: [
//     { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
//     { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
//     { name: 'Loans', href: '/admin/loans', icon: CreditCardIcon },
//     { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
//     { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
//   ],
//   PLAYER: [
//     { name: 'Dashboard', href: '/player/dashboard', icon: HomeIcon },
//     { name: 'Savings', href: '/player/savings', icon: WalletIcon },
//     { name: 'Loans', href: '/player/loans', icon: BanknotesIcon },
//     { name: 'Transactions', href: '/player/transactions', icon: DocumentTextIcon },
//   ],
//   PRO: [
//     { name: 'Dashboard', href: '/pro/dashboard', icon: HomeIcon },
//     { name: 'Savings', href: '/pro/savings', icon: WalletIcon },
//     { name: 'Loans', href: '/pro/loans', icon: BanknotesIcon },
//     { name: 'Transactions', href: '/pro/transactions', icon: DocumentTextIcon },
//   ],
//   CADDY: [
//     { name: 'Dashboard', href: '/caddy/dashboard', icon: HomeIcon },
//     { name: 'Savings', href: '/caddy/savings', icon: WalletIcon },
//     { name: 'Loans', href: '/caddy/loans', icon: BanknotesIcon },
//     { name: 'Transactions', href: '/caddy/transactions', icon: DocumentTextIcon },
//   ],
// };

// export function Sidebar() {
//   const pathname = usePathname();
//   const { user } = useAuth();
//   const role = user?.role || 'PLAYER';
//   const navItems = navigation[role as keyof typeof navigation] || navigation.PLAYER;

//   const handleLogout = async () => {
//     await signOut({ redirect: true, callbackUrl: '/' });
//   };

//   return (
//     <aside className="fixed left-0 top-0 h-full w-[280px] bg-background/95 border-r border-primary/20 backdrop-blur-sm flex flex-col z-50">
//       <div className="flex items-center gap-3 px-6 py-6 border-b border-primary/10">
//         <span className="text-3xl">⛳</span>
//         <div>
//           <h1 className="text-xl font-heading font-bold text-primary">Golf SACCO</h1>
//           <p className="text-xs text-text/50">{role}</p>
//         </div>
//       </div>

//       <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
//         {navItems.map((item) => {
//           const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
//           return (
//             <Link
//               key={item.name}
//               href={item.href}
//               className={cn(
//                 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
//                 isActive
//                   ? 'bg-primary/20 text-primary'
//                   : 'text-text/60 hover:bg-primary/10 hover:text-text'
//               )}
//             >
//               <item.icon className="w-5 h-5" />
//               <span className="text-sm font-medium">{item.name}</span>
//             </Link>
//           );
//         })}
//       </nav>

//       <div className="border-t border-primary/10 p-4 space-y-3">
//         <div className="flex items-center gap-3 px-2 py-2">
//           <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
//             <span className="text-sm font-bold text-primary">
//               {user?.firstName?.[0]}{user?.lastName?.[0]}
//             </span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium truncate">
//               {user?.firstName} {user?.lastName}
//             </p>
//             <p className="text-xs text-text/50 truncate">{user?.email}</p>
//           </div>
//         </div>
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 w-full px-4 py-3 text-accent rounded-lg hover:bg-accent/10 transition-all duration-200"
//         >
//           <ArrowRightOnRectangleIcon className="w-5 h-5" />
//           <span className="text-sm font-medium">Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// }
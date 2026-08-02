// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { motion, AnimatePresence, Variants } from 'framer-motion';
// import { ChevronDown, ChevronRight, Box, FileText } from 'lucide-react';

// import { useAppSelector } from '../../lib/store/hooks';
// import { ICON_MAPPING, getRolePath } from '@/lib/navigationConfig';

// const WebSidebar: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
//   const pathname = usePathname();
//   const user = useAppSelector((state) => state.auth.user);
//   const userRole = user?.role?.roleName || (typeof user?.role === 'string' ? user.role : "");
//   const dynamicMenu = useAppSelector((state) => state.auth.menu) || [];

//   const [openMenus, setOpenMenus] = useState<string[]>([]);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => { setMounted(true); }, []);

//   const toggleMenu = (name: string) => {
//     setOpenMenus(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
//   };

//   if (!mounted) return <aside className="w-[280px] h-full bg-card-bg border-r border-border-subtle" />;

//   const getIcon = (name: string) => {
//     const lowerName = name.toLowerCase();
//     const key = Object.keys(ICON_MAPPING).find(k => lowerName.includes(k));
//     return key ? ICON_MAPPING[key] : FileText;
//   };

//   // --- CLEANED CLASSES: Specificity fix for active state ---
//   const baseNavItemClasses = 'flex items-center gap-[12px] py-3 px-[12px] rounded-md cursor-pointer text-sm font-medium whitespace-nowrap ';

//   const baseSubNavItemClasses = 'block py-2 px-[12px] mb-1 rounded-md text-[13px] cursor-pointer whitespace-nowrap ';

//   const subMenuVariants: Variants = {
//     hidden: { opacity: 0, height: 0 },
//     show: { opacity: 1, height: 'auto', transition: { duration: 0.02 } },
//     exit: { opacity: 0, height: 0, transition: { duration: 0.02 } },
//   };

//   return (
//     <aside className="w-[280px] h-full bg-gradient-to-b from-sidebar-from to-sidebar-to flex flex-col font-sans overflow-hidden pt-20 lg:pt-5">
//       <div className="flex-1 overflow-y-auto px-[15px] pb-5 no-scrollbar">

//         <div className="flex items-center gap-3 p-[10px] pb-[30px] text-base font-bold text-text-main">
//           <Box size={26} className="text-accent-blue" />
//           <span className="whitespace-nowrap uppercase tracking-tighter">Podium Professional</span>
//         </div>

//         <nav>
//           <ul className="list-none p-0 m-0">
//             {dynamicMenu.filter(item => item.is_enable).map((item) => {
//               const Icon = getIcon(item.name);
//               const enabledChildren = item.children?.filter(child => child.is_enable) || [];
//               const hasChildren = enabledChildren.length > 0;
//               const currentPath = getRolePath(userRole, item.name);

//               if (hasChildren) {
//                 const isOpen = openMenus.includes(item.name);
//                 return (
//                   <li key={item.id} className="mb-1">
//                     <button
//                       onClick={() => toggleMenu(item.name)}
//                       className={`${baseNavItemClasses} w-full justify-between focus:outline-none 
//                         ${isOpen ? 'bg-sidebar-to/50 text-text-main' : 'text-text-main hover:bg-text-main hover:text-card-bg'}`}
//                     >
//                       <div className="flex items-center gap-[12px]">
//                         <Icon size={18} />
//                         <span className="capitalize">{item.name}</span>
//                       </div>
//                       {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
//                     </button>
//                     <AnimatePresence>
//                       {isOpen && (
//                         <motion.ul className="list-none p-0 mt-1 pl-10 overflow-hidden" variants={subMenuVariants} initial="hidden" animate="show" exit="exit">
//                           {enabledChildren.map((child) => {
//                             const dynamicChildPath = getRolePath(userRole, child.name);
//                             const isActive = pathname === dynamicChildPath;
//                             return (
//                               <li key={child.id}>
//                                 <Link
//                                   href={dynamicChildPath}
//                                   onClick={onLinkClick}
//                                   className={`${baseSubNavItemClasses} 
//                                     ${isActive
//                                       ? 'bg-text-main text-card-bg dark:bg-hover-blue dark:text-white'
//                                       : 'text-text-muted hover:bg-text-main hover:text-card-bg dark:hover:bg-hover-blue'}`}
//                                 >
//                                   {child.name}
//                                 </Link>
//                               </li>
//                             );
//                           })}
//                         </motion.ul>
//                       )}
//                     </AnimatePresence>
//                   </li>
//                 );
//               }

//               const isItemActive = pathname === currentPath;
//               return (
//                 <li key={item.id} className="mb-1">
//                   <Link
//                     href={currentPath}
//                     onClick={onLinkClick}
//                     className={`${baseNavItemClasses} 
//                       ${isItemActive
//                         ? 'bg-text-main text-card-bg dark:bg-hover-blue dark:text-white'
//                         : 'text-text-main hover:bg-text-main hover:text-card-bg dark:hover:bg-hover-blue'}`}
//                   >
//                     <Icon size={18} />
//                     <span className="capitalize">{item.name}</span>
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>
//       </div>
//     </aside>
//   );
// };

// export default WebSidebar;

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, ChevronRight, Box, FileText } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../lib/store/hooks';
import { ICON_MAPPING, getRolePath } from '@/lib/navigationConfig';
// 👉 YEH IMPORT LAZMI ADD KAREIN
import { fetchEnrollmentsData } from '@/lib/store/features/financeSlice';

const WebSidebar: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch(); // 👉 DISPATCH ADD KIYA

  const user = useAppSelector((state) => state.auth.user);
  const userRole = user?.role?.roleName || (typeof user?.role === 'string' ? user.role : "");
  const dynamicMenu = useAppSelector((state) => state.auth.menu) || [];
  
  // 👉 ENROLLMENTS STATE REDUX SE NIKALI
  const { enrollments } = useAppSelector((state) => state.finance);

  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // 👉 COMPONENT MOUNT HOTE HI API CALL
  useEffect(() => { 
    setMounted(true);
    dispatch(fetchEnrollmentsData()); 
  }, [dispatch]);

  // 👉 PENDING COUNT CALCULATE KIYA
  const pendingCount = enrollments?.filter((req: any) => req.status?.toLowerCase() === 'pending').length || 0;

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  if (!mounted) return <aside className="w-[280px] h-full bg-card-bg border-r border-border-subtle" />;

  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(ICON_MAPPING).find(k => lowerName.includes(k));
    return key ? ICON_MAPPING[key] : FileText;
  };

  const baseNavItemClasses = 'flex items-center gap-[12px] py-3 px-[12px] rounded-md cursor-pointer text-sm font-medium whitespace-nowrap transition-colors ';
  const baseSubNavItemClasses = 'flex items-center justify-between py-2 px-[12px] mb-1 rounded-md text-[13px] cursor-pointer whitespace-nowrap transition-colors ';

  const subMenuVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    show: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
  };

  // Helper function to check if this item should show the badge
  const shouldShowBadge = (itemName: string) => {
    const lowerName = itemName.toLowerCase();
    return lowerName.includes('fee') || lowerName.includes('finance');
  };

  return (
    <aside className="w-[280px] h-full bg-gradient-to-b from-sidebar-from to-sidebar-to flex flex-col font-sans overflow-hidden pt-20 lg:pt-5 border-r border-border-subtle shadow-xl lg:shadow-none">
      <div className="flex-1 overflow-y-auto px-[15px] pb-5 no-scrollbar">

        <div className="flex items-center gap-3 p-[10px] pb-[30px] text-base font-bold text-text-main">
          <Box size={26} className="text-accent-blue" />
          <span className="whitespace-nowrap uppercase tracking-tighter">Podium Professional</span>
        </div>

        <nav>
          <ul className="list-none p-0 m-0">
            {dynamicMenu.filter(item => item.is_enable).map((item) => {
              const Icon = getIcon(item.name);
              const enabledChildren = item.children?.filter(child => child.is_enable) || [];
              const hasChildren = enabledChildren.length > 0;
              const currentPath = getRolePath(userRole, item.name);
              
              // Check if parent needs badge
              const isParentBadgeTarget = shouldShowBadge(item.name);

              if (hasChildren) {
                const isOpen = openMenus.includes(item.name);
                return (
                  <li key={item.id} className="mb-1">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`${baseNavItemClasses} w-full justify-between focus:outline-none 
                        ${isOpen ? 'bg-sidebar-to/50 text-text-main' : 'text-text-main hover:bg-text-main hover:text-card-bg'}`}
                    >
                      <div className="flex items-center gap-[12px]">
                        <Icon size={18} />
                        <span className="capitalize">{item.name}</span>
                        {/* PARENT BADGE IF MENU IS COLLAPSED */}
                        {isParentBadgeTarget && !isOpen && pendingCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-accent-blue text-white text-[10px] font-black rounded-full shadow-md animate-in zoom-in duration-200">
                            {pendingCount}
                          </span>
                        )}
                      </div>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.ul className="list-none p-0 mt-1 pl-10 overflow-hidden" variants={subMenuVariants} initial="hidden" animate="show" exit="exit">
                          {enabledChildren.map((child) => {
                            const dynamicChildPath = getRolePath(userRole, child.name);
                            const isActive = pathname === dynamicChildPath;
                            const isChildBadgeTarget = shouldShowBadge(child.name);

                            return (
                              <li key={child.id}>
                                <Link
                                  href={dynamicChildPath}
                                  onClick={onLinkClick}
                                  className={`${baseSubNavItemClasses} 
                                    ${isActive
                                      ? 'bg-text-main text-card-bg dark:bg-hover-blue dark:text-white'
                                      : 'text-text-muted hover:bg-text-main hover:text-card-bg dark:hover:bg-hover-blue'}`}
                                >
                                  <span>{child.name}</span>
                                  {/* CHILD BADGE */}
                                  {isChildBadgeTarget && pendingCount > 0 && (
                                    <span className="px-2 py-0.5 bg-accent-blue text-white text-[9px] font-black rounded-full shadow-sm">
                                      {pendingCount}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }

              const isItemActive = pathname === currentPath;
              return (
                <li key={item.id} className="mb-1">
                  <Link
                    href={currentPath}
                    onClick={onLinkClick}
                    className={`${baseNavItemClasses} w-full justify-between
                      ${isItemActive
                        ? 'bg-text-main text-card-bg dark:bg-hover-blue dark:text-white'
                        : 'text-text-main hover:bg-text-main hover:text-card-bg dark:hover:bg-hover-blue'}`}
                  >
                    <div className="flex items-center gap-[12px]">
                      <Icon size={18} />
                      <span className="capitalize">{item.name}</span>
                    </div>
                    {/* SINGLE LINK BADGE */}
                    {isParentBadgeTarget && pendingCount > 0 && (
                      <span className="px-2 py-0.5 bg-accent-blue text-white text-[10px] font-black rounded-full shadow-sm animate-in zoom-in duration-200">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default WebSidebar;
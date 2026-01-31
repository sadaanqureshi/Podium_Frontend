'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, ChevronRight, Box, FileText } from 'lucide-react';

import { useAppSelector } from '../../lib/store/hooks';
import { ICON_MAPPING, getRolePath } from '@/lib/navigationConfig';

const WebSidebar: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const userRole = user?.role?.roleName || (typeof user?.role === 'string' ? user.role : "");
  const dynamicMenu = useAppSelector((state) => state.auth.menu) || [];

  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  if (!mounted) return <aside className="w-[280px] h-full bg-white border-r border-gray-100" />;

  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(ICON_MAPPING).find(k => lowerName.includes(k));
    return key ? ICON_MAPPING[key] : FileText;
  };

  const baseNavItemClasses = 'flex items-center gap-[12px] py-3 px-[12px] text-[#0F172A] rounded-md transition-colors duration-200 hover:bg-[#0F172A] hover:text-white cursor-pointer text-sm font-medium whitespace-nowrap';
  const baseSubNavItemClasses = 'block py-2 px-[12px] mb-1 rounded-md text-[#0F172A] text-[13px] transition-colors duration-200 hover:bg-[#0F172A] hover:text-white cursor-pointer whitespace-nowrap';

  const subMenuVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    show: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
  };

  return (
    <aside className="w-[280px] h-full bg-gradient-to-b from-white to-blue-100 text-[#0F172A] flex flex-col font-sans overflow-hidden pt-20 lg:pt-5 border-r border-slate-100">
      <div className="flex-1 overflow-y-auto px-[15px] pb-5 no-scrollbar">

        <div className="flex items-center gap-3 p-[10px] pb-[30px] text-base font-bold text-[#0F172A]">
          <Box size={26} />
          <span className="whitespace-nowrap uppercase tracking-tighter">Podium Professional</span>
        </div>

        <nav>
          <ul className="list-none p-0 m-0">
            {dynamicMenu.filter(item => item.is_enable).map((item) => {
              const Icon = getIcon(item.name);
              const enabledChildren = item.children?.filter(child => child.is_enable) || [];
              const hasChildren = enabledChildren.length > 0;
              const currentPath = getRolePath(userRole, item.name);

              if (hasChildren) {
                const isOpen = openMenus.includes(item.name);
                return (
                  <li key={item.id} className="mb-1">
                    <button onClick={() => toggleMenu(item.name)} className={`${baseNavItemClasses} w-full justify-between focus:outline-none`}>
                      <div className="flex items-center gap-[12px]">
                        <Icon size={18} />
                        <span className="capitalize">{item.name}</span>
                      </div>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.ul className="list-none p-0 mt-1 pl-10 overflow-hidden" variants={subMenuVariants} initial="hidden" animate="show" exit="exit">
                          {enabledChildren.map((child) => {
                            const dynamicChildPath = getRolePath(userRole, child.name);
                            return (
                              <li key={child.id}>
                                <Link href={dynamicChildPath} onClick={onLinkClick} className={`${baseSubNavItemClasses} ${pathname === dynamicChildPath ? 'bg-[#0F172A] text-white' : ''} capitalize`}>
                                  {child.name}
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

              return (
                <li key={item.id} className="mb-1">
                  <Link href={currentPath} onClick={onLinkClick} className={`${baseNavItemClasses} ${pathname === currentPath ? 'bg-[#0F172A] text-white' : ''}`}>
                    <Icon size={18} />
                    <span className="capitalize">{item.name}</span>
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
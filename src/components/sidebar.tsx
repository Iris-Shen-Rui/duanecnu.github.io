'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, BookOpen, MessageSquare, Users, Settings, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: '功能总览',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: '组会报告',
    href: '/meetings',
    icon: FileText,
  },
  {
    title: '学期总结',
    href: '/summaries',
    icon: BookOpen,
  },
  {
    title: '资源汇总',
    href: '/resources',
    icon: TrendingUp,
  },
  {
    title: '反馈建议',
    href: '/feedback',
    icon: MessageSquare,
  },
  {
    title: '成员管理',
    href: '/members',
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-blue-900 to-blue-800">
        <h1 className="text-xl font-bold text-white tracking-wide">段门内部网站</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4 bg-blue-50/50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-800'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          <Settings className="h-5 w-5" />
          设置
        </Link>
      </div>
    </div>
  );
}

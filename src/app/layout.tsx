import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: {
    default: '段门内部网站',
    template: '%s | 段门内部网站',
  },
  description: '段门课题组内部管理系统 - 组会报告、学期总结、资源汇总',
  keywords: ['段门', '课题组', '组会报告', '学期总结', '资源汇总', '学术管理'],
  authors: [{ name: '段门课题组' }],
  generator: 'Coze Code',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className={`antialiased bg-gray-50`}>
        {isDev && <Inspector />}
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

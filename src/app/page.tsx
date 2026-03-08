'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Users, MessageSquare, TrendingUp, Calendar, Award, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* 欢迎横幅 */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">欢迎使用段门内部网站</h1>
        <p className="text-blue-100 text-lg">
          高效管理组会报告、学期总结，汇聚全组资源，助力学术研究
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/meetings">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-blue-600 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">组会报告</CardTitle>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardDescription className="text-base">
                管理组会文献汇报，上传PPT和PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>查看会议历史</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>提交汇报材料</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lightbulb className="h-4 w-4" />
                  <span>标签分类管理</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/summaries">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-green-600 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">学期总结</CardTitle>
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardDescription className="text-base">
                每学期总结发表、投稿、学习情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="h-4 w-4" />
                  <span>记录发表/录用情况</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>查看团队汇总信息</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lightbulb className="h-4 w-4" />
                  <span>分享学习心得</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resources">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-purple-600 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">资源汇总</CardTitle>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <CardDescription className="text-base">
                汇集全组文献、理论和成果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>文献智能检索</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lightbulb className="h-4 w-4" />
                  <span>理论构念词云</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="h-4 w-4" />
                  <span>成果数据统计</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/members">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-teal-600 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">成员管理</CardTitle>
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
              </div>
              <CardDescription className="text-base">
                管理课题组成员信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>添加新成员</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>查看成员列表</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>成员信息维护</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/feedback">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-orange-600 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">反馈建议</CardTitle>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <CardDescription className="text-base">
                提交对系统或课题组的建议
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>匿名或实名提交</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>帮助改进系统</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lightbulb className="h-4 w-4" />
                  <span>优化管理流程</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 系统提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            使用提示
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>首次使用请先前往【成员管理】添加课题组成员信息</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>组会报告支持上传PDF、PPT、PPTX格式文件，最大50MB</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>学期总结请定期更新，确保数据的及时性和完整性</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>资源汇总模块会自动整合所有文献、理论和成果数据</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

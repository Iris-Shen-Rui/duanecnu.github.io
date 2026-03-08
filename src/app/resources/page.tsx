'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Lightbulb, TrendingUp, BookOpen, ExternalLink } from 'lucide-react';
import { WordCloud } from '@/components/word-cloud';
import { StatsChart } from '@/components/stats-chart';
import { Separator } from '@/components/ui/separator';

interface Literature {
  id: string;
  title: string;
  tags: string[];
  source: string;
  memberName: string;
  date: string;
  fileUrl?: string;
  type: 'meeting' | 'impressive';
}

interface Theory {
  id: string;
  name: string;
  memberName: string;
  date: string;
  semester: string;
}

interface ResourceData {
  literature: Literature[];
  theories: Theory[];
  wordCloud: Array<{ text: string; value: number }>;
  stats: {
    publishedPapers: Array<{ semester: string; count: number; date: string }>;
    newSubmissions: Array<{ semester: string; count: number; date: string }>;
    publicArticles: Array<{ semester: string; count: number; date: string }>;
  };
}

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('literature');
  const [selectedTag, setSelectedTag] = useState('');
  const [resources, setResources] = useState<ResourceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载资源数据
  const loadResources = async (query: string = '') => {
    setIsLoading(true);
    try {
      const url = `/api/resources${query ? `?query=${encodeURIComponent(query)}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setResources(result.data);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    loadResources(value);
  };

  // 点击tag筛选
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setSearchQuery(tag);
    loadResources(tag);
  };

  // 清除筛选
  const clearFilter = () => {
    setSelectedTag('');
    setSearchQuery('');
    loadResources('');
  };

  useEffect(() => {
    loadResources();
  }, []);

  // 提取理论构念的词云数据
  const getTheoryWordCloud = () => {
    if (!resources || resources.theories.length === 0) return [];
    
    // 从理论名称中提取关键词
    const theoryWords = new Map<string, number>();
    resources.theories.forEach(theory => {
      // 简单的分词（实际可能需要更复杂的分词逻辑）
      const words = theory.name.split(/[,，、;；\s]+/).filter(w => w.length > 1);
      words.forEach(word => {
        theoryWords.set(word, (theoryWords.get(word) || 0) + 1);
      });
    });

    return Array.from(theoryWords.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30); // 只显示前30个
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">资源汇总与导航</h1>
        <p className="text-gray-600 mt-2">汇集段门全组文献、理论构念和科研成果</p>
      </div>

      {/* 搜索框 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Search className="h-5 w-5 text-gray-400 mt-2" />
            <Input
              placeholder="搜索文献、理论构念..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            {selectedTag && (
              <Button variant="outline" onClick={clearFilter}>
                清除筛选: {selectedTag}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 词云图和统计图 */}
      <div className="grid gap-6 md:grid-cols-2">
        {resources && resources.wordCloud.length > 0 && (
          <WordCloud
            data={resources.wordCloud}
            title="文献标签云"
            description="点击标签筛选相关文献"
            onItemClick={handleTagClick}
          />
        )}
        
        {resources && resources.theories.length > 0 && (
          <WordCloud
            data={getTheoryWordCloud()}
            title="理论构念云"
            description="点击关键词筛选相关理论"
            onItemClick={handleTagClick}
          />
        )}
      </div>

      <Separator />

      {/* 数据统计 */}
      {resources && (
        <div className="grid gap-6 md:grid-cols-3">
          <StatsChart
            title="发表文章统计"
            description="每学期发表的文章数量"
            data={resources.stats.publishedPapers}
            color="#10b981"
          />
          <StatsChart
            title="投稿统计"
            description="每学期投稿的文章数量"
            data={resources.stats.newSubmissions}
            color="#3b82f6"
          />
          <StatsChart
            title="公众号文章统计"
            description="每学期发布的公众号文章数量"
            data={resources.stats.publicArticles}
            color="#f59e0b"
          />
        </div>
      )}

      <Separator />

      {/* 文献和理论列表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="literature">
            <FileText className="h-4 w-4 mr-2" />
            文献汇总
          </TabsTrigger>
          <TabsTrigger value="theory">
            <Lightbulb className="h-4 w-4 mr-2" />
            理论构念
          </TabsTrigger>
        </TabsList>

        <TabsContent value="literature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文献列表</CardTitle>
              <CardDescription>
                {resources?.literature.length || 0} 篇文献
                {selectedTag && ` (筛选: ${selectedTag})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">加载中...</div>
              ) : !resources || resources.literature.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无文献记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resources.literature.map((lit) => (
                    <div
                      key={lit.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {lit.type === 'meeting' ? (
                              <Badge variant="default">组会汇报</Badge>
                            ) : (
                              <Badge variant="secondary">印象深刻的文献</Badge>
                            )}
                            <span className="text-sm text-gray-500">{lit.source}</span>
                          </div>
                          <h3 className="font-medium mb-2">{lit.title}</h3>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {lit.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lit.memberName} · {formatDate(lit.date)}
                          </div>
                        </div>
                        {lit.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={lit.fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              下载
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>理论构念汇总</CardTitle>
              <CardDescription>
                {resources?.theories.length || 0} 个理论构念
                {selectedTag && ` (筛选: ${selectedTag})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">加载中...</div>
              ) : !resources || resources.theories.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Lightbulb className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无理论构念记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resources.theories.map((theory) => (
                    <div
                      key={theory.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{theory.semester}</Badge>
                          </div>
                          <h3 className="font-medium mb-2">{theory.name}</h3>
                          <div className="text-sm text-gray-500">
                            {theory.memberName} · {formatDate(theory.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash } from 'lucide-react';

interface WordCloudProps {
  data: Array<{ text: string; value: number }>;
  title?: string;
  description?: string;
  onItemClick?: (word: string) => void;
}

export function WordCloud({ data, title = '词云图', description = '点击标签进行筛选', onItemClick }: WordCloudProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            暂无数据
          </div>
        </CardContent>
      </Card>
    );
  }

  // 计算字体大小范围
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  const getFontSize = (value: number) => {
    const normalized = (value - minValue) / valueRange;
    return 12 + normalized * 12; // 12px - 24px
  };

  const getColor = (value: number) => {
    const normalized = (value - minValue) / valueRange;
    const colors = [
      'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'bg-green-100 text-green-800 hover:bg-green-200',
      'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'bg-orange-100 text-orange-800 hover:bg-orange-200',
      'bg-pink-100 text-pink-800 hover:bg-pink-200',
      'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'bg-teal-100 text-teal-800 hover:bg-teal-200',
    ];
    const index = Math.floor(normalized * (colors.length - 1));
    return colors[index];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center py-4">
          {data.map((item, index) => (
            <Badge
              key={`${item.text}-${index}`}
              className={`cursor-pointer transition-all hover:scale-105 ${getColor(item.value)}`}
              style={{ fontSize: `${getFontSize(item.value)}px`, padding: `${8 + (item.value - minValue) / valueRange * 4}px` }}
              onClick={() => onItemClick?.(item.text)}
            >
              {item.text}
              <span className="ml-1 opacity-60 text-xs">({item.value})</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

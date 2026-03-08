'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Send } from 'lucide-react';

export default function FeedbackPage() {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('请输入反馈内容');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: 'current-member-id',
          content,
          isAnonymous,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setContent('');
        setIsAnonymous(false);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        alert('提交失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">反馈建议</h1>
        <p className="text-gray-600 mt-2">提出你对段门系统或课题组的意见和建议</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>提交反馈</CardTitle>
          <CardDescription>我们会认真阅读每一条反馈</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              提交成功！感谢您的反馈。
            </div>
          )}

          <div>
            <Label htmlFor="content">反馈内容</Label>
            <Textarea
              id="content"
              placeholder="请输入您的反馈或建议..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mt-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              匿名提交
            </Label>
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? '提交中...' : '提交反馈'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>反馈说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• 您可以匿名或实名提交反馈</p>
          <p>• 反馈内容仅管理员可见</p>
          <p>• 请文明用语，理性表达</p>
          <p>• 我们会认真对待每一条反馈</p>
        </CardContent>
      </Card>
    </div>
  );
}

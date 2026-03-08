'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, BookOpen, FileText, UserCheck, MessageSquare, TrendingUp, Lightbulb, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SemesterSummary {
  id: string;
  memberId: string;
  semester: string;
  publishedPapers: Array<{ journal: string; level: string; title: string }>;
  newSubmissions: Array<{ title: string; journal: string }>;
  literatureReports: Array<{ source: string; reportDate: string; type: string }>;
  impressiveLiterature: string | null;
  newTheories: string | null;
  researchIdeas: string | null;
  teamCitizenship: string | null;
  publicArticles: Array<{ title: string; url: string }>;
  criticisms: Array<{ reason: string; date: string }>;
  isDraft: boolean;
}

export default function SummariesPage() {
  const [currentSemester, setCurrentSemester] = useState('2024-2025-1');
  const [summaries, setSummaries] = useState<SemesterSummary[]>([]);
  const [mySummary, setMySummary] = useState<SemesterSummary | null>(null);
  const [activeTab, setActiveTab] = useState('submit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    publishedPapers: [{ journal: '', level: '', title: '' }],
    newSubmissions: [{ title: '', journal: '' }],
    literatureReports: [{ source: '', reportDate: '', type: 'oral' }],
    impressiveLiterature: '',
    newTheories: '',
    researchIdeas: '',
    teamCitizenship: '',
    publicArticles: [{ title: '', url: '' }],
    criticisms: [{ reason: '', date: '' }],
  });

  // 加载学期总结列表
  const loadSummaries = async () => {
    try {
      const response = await fetch(`/api/summaries?semester=${currentSemester}`);
      const result = await response.json();
      if (result.success) {
        setSummaries(result.data);
      }
    } catch (error) {
      console.error('Error loading summaries:', error);
    }
  };

  // 加载我的总结
  const loadMySummary = async () => {
    try {
      const response = await fetch(`/api/summaries?semester=${currentSemester}&memberId=current-member-id`);
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setMySummary(result.data[0]);
        setFormData({
          publishedPapers: result.data[0].publishedPapers || [{ journal: '', level: '', title: '' }],
          newSubmissions: result.data[0].newSubmissions || [{ title: '', journal: '' }],
          literatureReports: result.data[0].literatureReports || [{ source: '', reportDate: '', type: 'oral' }],
          impressiveLiterature: result.data[0].impressiveLiterature || '',
          newTheories: result.data[0].newTheories || '',
          researchIdeas: result.data[0].researchIdeas || '',
          teamCitizenship: result.data[0].teamCitizenship || '',
          publicArticles: result.data[0].publicArticles || [{ title: '', url: '' }],
          criticisms: result.data[0].criticisms || [{ reason: '', date: '' }],
        });
      }
    } catch (error) {
      console.error('Error loading my summary:', error);
    }
  };

  // 提交或更新总结
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        memberId: 'current-member-id',
        semester: currentSemester,
        ...formData,
        isDraft: false,
      };

      let response;
      if (mySummary) {
        response = await fetch(`/api/summaries/${mySummary.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/summaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (result.success) {
        alert('提交成功！');
        loadMySummary();
        loadSummaries();
      } else {
        alert('提交失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 添加数组字段项
  const addArrayItem = (field: keyof typeof formData) => {
    const defaultItem: any = {};
    if (field === 'publishedPapers') defaultItem.journal = defaultItem.level = defaultItem.title = '';
    if (field === 'newSubmissions') defaultItem.title = defaultItem.journal = '';
    if (field === 'literatureReports') defaultItem.source = defaultItem.reportDate = '', defaultItem.type = 'oral';
    if (field === 'publicArticles') defaultItem.title = defaultItem.url = '';
    if (field === 'criticisms') defaultItem.reason = defaultItem.date = '';

    setFormData({
      ...formData,
      [field]: [...(formData[field] as any[]), defaultItem],
    });
  };

  // 删除数组字段项
  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData({
      ...formData,
      [field]: (formData[field] as any[]).filter((_, i) => i !== index),
    });
  };

  // 更新数组字段项
  const updateArrayItem = (field: keyof typeof formData, index: number, key: string, value: string) => {
    const newArray = [...(formData[field] as any[])];
    newArray[index] = { ...newArray[index], [key]: value };
    setFormData({
      ...formData,
      [field]: newArray,
    });
  };

  useEffect(() => {
    loadSummaries();
    loadMySummary();
  }, [currentSemester]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">学期总结</h1>
          <p className="text-gray-600 mt-2">记录段门每学期的学习和研究成果</p>
        </div>
        <Select value={currentSemester} onValueChange={setCurrentSemester}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-2025-1">2024-2025 第一学期</SelectItem>
            <SelectItem value="2024-2025-2">2024-2025 第二学期</SelectItem>
            <SelectItem value="2025-2026-1">2025-2026 第一学期</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit">提交总结</TabsTrigger>
          <TabsTrigger value="view">查看汇总</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>填写总结</CardTitle>
              <CardDescription>请填写以下各项内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 发表/录用 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    发表/录用
                  </Label>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('publishedPapers')}>
                    <Plus className="h-4 w-4 mr-1" /> 添加
                  </Button>
                </div>
                {formData.publishedPapers.map((paper, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="期刊名称"
                      value={paper.journal}
                      onChange={(e) => updateArrayItem('publishedPapers', index, 'journal', e.target.value)}
                    />
                    <Input
                      placeholder="级别（如：SCI一区）"
                      value={paper.level}
                      onChange={(e) => updateArrayItem('publishedPapers', index, 'level', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="论文标题"
                        value={paper.title}
                        onChange={(e) => updateArrayItem('publishedPapers', index, 'title', e.target.value)}
                      />
                      {formData.publishedPapers.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeArrayItem('publishedPapers', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* 新投稿 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    新投稿
                  </Label>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('newSubmissions')}>
                    <Plus className="h-4 w-4 mr-1" /> 添加
                  </Button>
                </div>
                {formData.newSubmissions.map((sub, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="论文标题"
                      value={sub.title}
                      onChange={(e) => updateArrayItem('newSubmissions', index, 'title', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="目标期刊"
                        value={sub.journal}
                        onChange={(e) => updateArrayItem('newSubmissions', index, 'journal', e.target.value)}
                      />
                      {formData.newSubmissions.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeArrayItem('newSubmissions', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* 文献报告 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    文献报告
                  </Label>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('literatureReports')}>
                    <Plus className="h-4 w-4 mr-1" /> 添加
                  </Button>
                </div>
                {formData.literatureReports.map((report, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="出处"
                      value={report.source}
                      onChange={(e) => updateArrayItem('literatureReports', index, 'source', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={report.reportDate}
                      onChange={(e) => updateArrayItem('literatureReports', index, 'reportDate', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Select
                        value={report.type}
                        onValueChange={(value) => updateArrayItem('literatureReports', index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oral">口头报告</SelectItem>
                          <SelectItem value="written">书面报告</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.literatureReports.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeArrayItem('literatureReports', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* 印象最深的文献 */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  印象最深的文献
                </Label>
                <Textarea
                  placeholder="请描述印象最深的文献及其原因"
                  value={formData.impressiveLiterature}
                  onChange={(e) => setFormData({ ...formData, impressiveLiterature: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              {/* 新学习的理论或构念 */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-orange-600" />
                  新学习的理论或构念
                </Label>
                <Textarea
                  placeholder="请描述新学习的理论或构念"
                  value={formData.newTheories}
                  onChange={(e) => setFormData({ ...formData, newTheories: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              {/* 近期研究设想 */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  近期研究设想
                </Label>
                <Textarea
                  placeholder="请描述近期的研究设想"
                  value={formData.researchIdeas}
                  onChange={(e) => setFormData({ ...formData, researchIdeas: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              {/* 团队公民行为 */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <UserCheck className="h-4 w-4 text-teal-600" />
                  团队公民行为
                </Label>
                <Textarea
                  placeholder="请描述你在团队中的贡献和行为"
                  value={formData.teamCitizenship}
                  onChange={(e) => setFormData({ ...formData, teamCitizenship: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              {/* 公众号科普文章 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-pink-600" />
                    公众号科普文章
                  </Label>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('publicArticles')}>
                    <Plus className="h-4 w-4 mr-1" /> 添加
                  </Button>
                </div>
                {formData.publicArticles.map((article, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="文章标题"
                      value={article.title}
                      onChange={(e) => updateArrayItem('publicArticles', index, 'title', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="文章链接"
                        value={article.url}
                        onChange={(e) => updateArrayItem('publicArticles', index, 'url', e.target.value)}
                      />
                      {formData.publicArticles.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeArrayItem('publicArticles', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* 被点名批评 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    被点名批评
                  </Label>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('criticisms')}>
                    <Plus className="h-4 w-4 mr-1" /> 添加
                  </Button>
                </div>
                {formData.criticisms.map((criticism, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="批评事由"
                      value={criticism.reason}
                      onChange={(e) => updateArrayItem('criticisms', index, 'reason', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={criticism.date}
                        onChange={(e) => updateArrayItem('criticisms', index, 'date', e.target.value)}
                      />
                      {formData.criticisms.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeArrayItem('criticisms', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setFormData({
                  publishedPapers: [{ journal: '', level: '', title: '' }],
                  newSubmissions: [{ title: '', journal: '' }],
                  literatureReports: [{ source: '', reportDate: '', type: 'oral' }],
                  impressiveLiterature: '',
                  newTheories: '',
                  researchIdeas: '',
                  teamCitizenship: '',
                  publicArticles: [{ title: '', url: '' }],
                  criticisms: [{ reason: '', date: '' }],
                })}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? '提交中...' : '确认提交'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>全组汇总</CardTitle>
              <CardDescription>查看全组同学的学期总结情况</CardDescription>
            </CardHeader>
            <CardContent>
              {summaries.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  暂无提交记录
                </div>
              ) : (
                <div className="space-y-6">
                  {summaries.map((summary) => (
                    <div key={summary.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">成员 #{summary.memberId}</h3>
                        <Badge variant={summary.isDraft ? 'outline' : 'default'}>
                          {summary.isDraft ? '草稿' : '已提交'}
                        </Badge>
                      </div>

                      {summary.publishedPapers && summary.publishedPapers.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            发表/录用
                          </h4>
                          <div className="space-y-1">
                            {summary.publishedPapers.map((paper, idx) => (
                              <div key={idx} className="text-sm pl-6">
                                {paper.title} - {paper.journal} ({paper.level})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {summary.newSubmissions && summary.newSubmissions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            新投稿
                          </h4>
                          <div className="space-y-1">
                            {summary.newSubmissions.map((sub, idx) => (
                              <div key={idx} className="text-sm pl-6">
                                {sub.title} - {sub.journal}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {summary.impressiveLiterature && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            印象最深的文献
                          </h4>
                          <div className="text-sm pl-6">{summary.impressiveLiterature}</div>
                        </div>
                      )}

                      {summary.newTheories && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-orange-600" />
                            新学习的理论或构念
                          </h4>
                          <div className="text-sm pl-6">{summary.newTheories}</div>
                        </div>
                      )}

                      {summary.researchIdeas && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-600" />
                            近期研究设想
                          </h4>
                          <div className="text-sm pl-6">{summary.researchIdeas}</div>
                        </div>
                      )}
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

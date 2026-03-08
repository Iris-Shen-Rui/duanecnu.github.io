'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Upload, X, Calendar, MapPin, User, Tag, CheckCircle2, ChevronDown, ChevronUp, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MeetingCalendar } from '@/components/meeting-calendar';

interface Meeting {
  id: string;
  date: string;
  location: string | null;
  creator: string | null;
  creatorId: string | null;
  presenterCount: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface Submission {
  id: string;
  meetingId: string;
  memberId: string;
  presenterName: string | null;
  fileKey: string;
  fileName: string;
  fileType: string | null;
  tags: string | null;
  notes: string | null;
  isDraft: boolean;
  fileUrl: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>();
  const [meetingStats, setMeetingStats] = useState<Record<string, { submissionCount: number; presenterCount: number | null; isCompleted: boolean }>>({});
  
  // 删除和编辑相关状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // 新建会议表单
  const [newMeeting, setNewMeeting] = useState({
    date: '',
    location: '',
    creator: '',
    creatorId: '',
    presenterCount: '',
    notes: '',
  });

  // 编辑会议表单
  const [editMeetingForm, setEditMeetingForm] = useState({
    date: '',
    location: '',
    creator: '',
    creatorId: '',
    presenterCount: '',
    notes: '',
  });

  // 提交表单
  const [submissionForm, setSubmissionForm] = useState({
    presenterName: '',
    file: null as File | null,
    tags: '',
    notes: '',
  });

  // 加载会议列表（按日期排序）
  const loadMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      const result = await response.json();
      if (result.success) {
        // 按日期排序，最新的在前
        const sorted = result.data.sort((a: Meeting, b: Meeting) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMeetings(sorted);
        
        // 加载每次会议的统计信息
        sorted.forEach((meeting: Meeting) => {
          loadMeetingStats(meeting.id);
        });
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  // 加载会议统计
  const loadMeetingStats = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/stats`);
      const result = await response.json();
      if (result.success) {
        setMeetingStats(prev => ({
          ...prev,
          [meetingId]: {
            submissionCount: result.data.submissionCount,
            presenterCount: result.data.presenterCount,
            isCompleted: result.data.isCompleted,
          },
        }));
      }
    } catch (error) {
      console.error('Error loading meeting stats:', error);
    }
  };

  // 加载选中会议的提交记录
  const loadSubmissions = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/meetings/submissions?meetingId=${meetingId}`);
      const result = await response.json();
      if (result.success) {
        setSubmissions(result.data);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  // 创建新会议
  const handleCreateMeeting = async () => {
    // 表单验证
    if (!newMeeting.date) {
      alert('请选择会议日期时间');
      return;
    }
    if (!newMeeting.location) {
      alert('请输入会议地点或会议链接');
      return;
    }
    if (!newMeeting.creator) {
      alert('请输入创建人姓名');
      return;
    }
    if (!newMeeting.presenterCount) {
      alert('请输入汇报人数');
      return;
    }

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting),
      });

      const result = await response.json();
      if (result.success) {
        setIsCreateDialogOpen(false);
        setNewMeeting({ date: '', location: '', creator: '', creatorId: '', presenterCount: '', notes: '' });
        loadMeetings();
      } else {
        alert('创建会议失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('创建会议失败');
    }
  };

  // 打开编辑对话框
  const handleOpenEditDialog = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setEditMeetingForm({
      date: meeting.date.substring(0, 16), // 格式化为datetime-local需要的格式
      location: meeting.location || '',
      creator: meeting.creator || '',
      creatorId: meeting.creatorId || '',
      presenterCount: meeting.presenterCount?.toString() || '',
      notes: meeting.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingMeeting) return;

    // 表单验证
    if (!editMeetingForm.date) {
      alert('请选择会议日期时间');
      return;
    }
    if (!editMeetingForm.location) {
      alert('请输入会议地点或会议链接');
      return;
    }
    if (!editMeetingForm.creator) {
      alert('请输入创建人姓名');
      return;
    }
    if (!editMeetingForm.presenterCount) {
      alert('请输入汇报人数');
      return;
    }

    try {
      const response = await fetch(`/api/meetings/${editingMeeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMeetingForm),
      });

      const result = await response.json();
      if (result.success) {
        setIsEditDialogOpen(false);
        setEditingMeeting(null);
        loadMeetings();
      } else {
        alert('更新会议失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('更新会议失败');
    }
  };

  // 打开删除确认对话框
  const handleOpenDeleteDialog = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  // 确认删除会议
  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;

    try {
      const response = await fetch(`/api/meetings/${meetingToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        setDeleteDialogOpen(false);
        setMeetingToDelete(null);
        loadMeetings();
      } else {
        alert('删除会议失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('删除会议失败');
    }
  };

  // 上传文件
  const handleFileUpload = async () => {
    if (!submissionForm.presenterName || (!submissionForm.file && !submissionForm.notes)) {
      alert('请填写汇报人姓名，并且上传文件或填写备注');
      return;
    }

    setIsUploading(true);

    try {
      let fileKey = '';
      
      // 如果有文件，先上传
      if (submissionForm.file) {
        const formData = new FormData();
        formData.append('file', submissionForm.file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          alert('文件上传失败: ' + uploadResult.error);
          setIsUploading(false);
          return;
        }

        fileKey = uploadResult.data.fileKey;
      }

      // 创建提交记录
      const submitResponse = await fetch('/api/meetings/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: selectedMeeting?.id,
          memberId: 'current-member-id',
          presenterName: submissionForm.presenterName,
          fileKey: fileKey || '',
          fileName: submissionForm.file?.name || '备注提交',
          fileType: submissionForm.file?.type || null,
          tags: submissionForm.tags,
          notes: submissionForm.notes,
          isDraft: false,
        }),
      });

      const submitResult = await submitResponse.json();

      if (submitResult.success) {
        setSubmissionForm({ presenterName: '', file: null, tags: '', notes: '' });
        loadSubmissions(selectedMeeting!.id);
        loadMeetingStats(selectedMeeting!.id);
        alert('提交成功！');
      } else {
        alert('提交失败: ' + submitResult.error);
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('提交失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 展开或收起会议记录
  const toggleMeetingExpansion = (meetingId: string) => {
    setExpandedMeetings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(meetingId)) {
        newSet.delete(meetingId);
      } else {
        newSet.add(meetingId);
        // 展开时加载该会议的提交记录
        loadSubmissions(meetingId);
      }
      return newSet;
    });
  };

  // 处理日历日期选择
  const handleCalendarDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
    // 找到该日期的会议
    const meeting = meetings.find(m => {
      const meetingDate = new Date(m.date);
      return meetingDate.toDateString() === date.toDateString();
    });
    if (meeting) {
      toggleMeetingExpansion(meeting.id);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 获取最近3条记录
  const recentMeetings = meetings.slice(0, 3);
  const olderMeetings = meetings.slice(3);

  // 过滤出选中日期的会议
  const selectedDateMeetings = selectedCalendarDate
    ? meetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate.toDateString() === selectedCalendarDate.toDateString();
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">组会报告</h1>
          <p className="text-gray-600 mt-2">管理段门组会文献汇报和材料提交</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              创建新组会
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新组会</DialogTitle>
              <DialogDescription>填写组会信息</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">日期时间</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">地点/会议链接</Label>
                <Input
                  id="location"
                  placeholder="例如：俊秀楼313 或 腾讯会议链接"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="creator">创建人</Label>
                <Input
                  id="creator"
                  placeholder="创建人姓名"
                  value={newMeeting.creator}
                  onChange={(e) => setNewMeeting({ ...newMeeting, creator: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="presenterCount">汇报人数</Label>
                <Input
                  id="presenterCount"
                  type="number"
                  placeholder="例如：3"
                  value={newMeeting.presenterCount}
                  onChange={(e) => setNewMeeting({ ...newMeeting, presenterCount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  placeholder="例如：某某教授分享"
                  value={newMeeting.notes}
                  onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateMeeting}>确认创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 会议历史 */}
        <Card>
          <CardHeader>
            <CardTitle>会议历史</CardTitle>
            <CardDescription>点击记录查看汇报文献，点击按钮提交材料</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meetings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  暂无会议记录
                </div>
              ) : (
                <>
                  {/* 最近3条记录 */}
                  {recentMeetings.map((meeting) => {
                    const stats = meetingStats[meeting.id];
                    const isExpanded = expandedMeetings.has(meeting.id);
                    const meetingSubmissions = isExpanded ? submissions.filter(s => s.meetingId === meeting.id) : [];

                    return (
                      <div key={meeting.id} className="border rounded-lg overflow-hidden">
                        <div
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            // 避免点击按钮时触发展开
                            if (!(e.target as HTMLElement).closest('button')) {
                              toggleMeetingExpansion(meeting.id);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{formatDate(meeting.date)}</span>
                              </div>
                              {meeting.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{meeting.location}</span>
                                </div>
                              )}
                              {meeting.creator && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                  <User className="h-4 w-4" />
                                  <span>创建人：{meeting.creator}</span>
                                </div>
                              )}
                              {meeting.notes && (
                                <div className="text-sm text-gray-600 mt-2">
                                  {meeting.notes}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {stats?.presenterCount && (
                                <Badge variant="outline" className="text-xs">
                                  {stats.submissionCount}/{stats.presenterCount} 已提交
                                </Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMeeting(meeting);
                                  loadSubmissions(meeting.id);
                                }}
                              >
                                {stats?.isCompleted ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                                    已完成
                                  </>
                                ) : (
                                  '提交材料'
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditDialog(meeting);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteDialog(meeting);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMeetingExpansion(meeting.id);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* 展开的汇报文献列表 */}
                          {isExpanded && meetingSubmissions.length > 0 && (
                            <div className="mt-4 pt-4 border-t space-y-2">
                              {meetingSubmissions.map((submission) => (
                                <div key={submission.id} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-sm">{submission.presenterName || '未知汇报人'}</span>
                                    </div>
                                  </div>
                                  {submission.fileName && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                      <FileText className="h-4 w-4" />
                                      <span>{submission.fileName}</span>
                                      {submission.fileUrl && (
                                        <a
                                          href={submission.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline text-xs ml-2"
                                        >
                                          下载
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {submission.tags && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {submission.tags.split(',').map((tag, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {tag.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  {submission.notes && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      {submission.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 更早的记录提示 */}
                  {olderMeetings.length > 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-4">
                        还有 {olderMeetings.length} 条更早的记录
                      </p>
                    </div>
                  )}

                  {/* 日历查看更早的历史 */}
                  {olderMeetings.length > 0 && (
                    <MeetingCalendar
                      meetings={olderMeetings}
                      onSelectDate={handleCalendarDateSelect}
                      selectedDate={selectedCalendarDate}
                    />
                  )}

                  {/* 选中日期的会议 */}
                  {selectedDateMeetings.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">
                        {formatDateOnly(selectedCalendarDate!.toDateString())} 的会议
                      </h4>
                      {selectedDateMeetings.map((meeting) => {
                        const isExpanded = expandedMeetings.has(meeting.id);
                        const meetingSubmissions = isExpanded ? submissions.filter(s => s.meetingId === meeting.id) : [];

                        return (
                          <div key={meeting.id} className="border rounded-lg p-3 mb-2">
                            <div
                              className="flex items-start justify-between cursor-pointer hover:bg-gray-50 -mx-3 -my-3 px-3 py-3 rounded-lg transition-colors"
                              onClick={(e) => {
                                if (!(e.target as HTMLElement).closest('button')) {
                                  toggleMeetingExpansion(meeting.id);
                                }
                              }}
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">{formatDate(meeting.date)}</div>
                                {meeting.location && (
                                  <div className="text-xs text-gray-500">{meeting.location}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditDialog(meeting);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDeleteDialog(meeting);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>

                            {isExpanded && meetingSubmissions.length > 0 && (
                              <div className="mt-3 pt-3 border-t space-y-2">
                                {meetingSubmissions.map((submission) => (
                                  <div key={submission.id} className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-sm font-medium">{submission.presenterName || '未知汇报人'}</div>
                                    {submission.fileName && (
                                      <div className="text-xs text-gray-600">{submission.fileName}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 提交区 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedMeeting ? formatDate(selectedMeeting.date) : '请选择会议'}
            </CardTitle>
            <CardDescription>
              {selectedMeeting ? '填写汇报信息并上传材料' : '选择会议后可提交材料'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMeeting ? (
              <div className="space-y-6">
                {/* 已提交的文件 */}
                {submissions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">已提交材料</h3>
                    <div className="space-y-2">
                      {submissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                {submission.presenterName || '未知汇报人'}
                              </span>
                            </div>
                            {submission.fileName && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{submission.fileName}</span>
                              </div>
                            )}
                            {submission.tags && (
                              <div className="flex gap-1 mt-1">
                                {submission.tags.split(',').map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {submission.notes && (
                              <div className="text-sm text-gray-600 mt-1 italic">
                                备注：{submission.notes}
                              </div>
                            )}
                          </div>
                          {submission.fileUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                                下载
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 上传表单 */}
                <div>
                  <h3 className="text-sm font-medium mb-3">提交新材料</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>汇报人姓名 *</Label>
                      <Input
                        placeholder="请输入汇报人姓名"
                        value={submissionForm.presenterName}
                        onChange={(e) => setSubmissionForm({ ...submissionForm, presenterName: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>文件</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx"
                          onChange={(e) =>
                            setSubmissionForm({
                              ...submissionForm,
                              file: e.target.files?.[0] || null,
                            })
                          }
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-medium
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        支持 PDF、PPT、PPTX 格式，最大 50MB（可选）
                      </p>
                    </div>

                    <div>
                      <Label>标签</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="输入标签，用逗号分隔"
                          value={submissionForm.tags}
                          onChange={(e) => setSubmissionForm({ ...submissionForm, tags: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        例如：重要, 文献综述, 实验（可选）
                      </p>
                    </div>

                    <div>
                      <Label>备注和老师点评</Label>
                      <Textarea
                        placeholder="请输入备注或老师的重要点评..."
                        value={submissionForm.notes}
                        onChange={(e) => setSubmissionForm({ ...submissionForm, notes: e.target.value })}
                        rows={3}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        文件和备注只需填写其中一项即可（可选）
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSubmissionForm({ presenterName: '', file: null, tags: '', notes: '' })}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleFileUpload}
                        disabled={!submissionForm.presenterName || (!submissionForm.file && !submissionForm.notes) || isUploading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isUploading ? '上传中...' : '确认提交'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>请从左侧选择一个会议</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              确认删除会议
            </DialogTitle>
            <DialogDescription>
              您确定要删除这个会议吗？此操作无法撤销，所有相关的提交记录也将被删除。
            </DialogDescription>
          </DialogHeader>
          {meetingToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(meetingToDelete.date)}</span>
              </div>
              {meetingToDelete.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{meetingToDelete.location}</span>
                </div>
              )}
              {meetingToDelete.creator && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <User className="h-4 w-4" />
                  <span>创建人：{meetingToDelete.creator}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑会议对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑会议</DialogTitle>
            <DialogDescription>修改会议信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-date">日期时间</Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={editMeetingForm.date}
                onChange={(e) => setEditMeetingForm({ ...editMeetingForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">地点/会议链接</Label>
              <Input
                id="edit-location"
                placeholder="例如：俊秀楼313 或 腾讯会议链接"
                value={editMeetingForm.location}
                onChange={(e) => setEditMeetingForm({ ...editMeetingForm, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-creator">创建人</Label>
              <Input
                id="edit-creator"
                placeholder="创建人姓名"
                value={editMeetingForm.creator}
                onChange={(e) => setEditMeetingForm({ ...editMeetingForm, creator: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-presenterCount">汇报人数</Label>
              <Input
                id="edit-presenterCount"
                type="number"
                placeholder="例如：3"
                value={editMeetingForm.presenterCount}
                onChange={(e) => setEditMeetingForm({ ...editMeetingForm, presenterCount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">备注</Label>
              <Textarea
                id="edit-notes"
                placeholder="例如：某某教授分享"
                value={editMeetingForm.notes}
                onChange={(e) => setEditMeetingForm({ ...editMeetingForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Member {
  id: string;
  name: string;
  identity: string;
  school: string;
  createdAt: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    identity: '',
    school: '',
  });

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.identity || !newMember.school) {
      alert('请填写所有字段');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });

      const result = await response.json();

      if (result.success) {
        setIsCreateDialogOpen(false);
        setNewMember({ name: '', identity: '', school: '' });
        loadMembers();
        alert('添加成员成功！');
      } else {
        alert('添加成员失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating member:', error);
      alert('添加成员失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">成员管理</h1>
          <p className="text-gray-600 mt-2">管理段门课题组成员信息</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              添加成员
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新成员</DialogTitle>
              <DialogDescription>填写成员基本信息</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  placeholder="请输入姓名"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="identity">身份</Label>
                <Select
                  value={newMember.identity}
                  onValueChange={(value) => setNewMember({ ...newMember, identity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择身份" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="硕士">硕士</SelectItem>
                    <SelectItem value="博士">博士</SelectItem>
                    <SelectItem value="毕业生">毕业生</SelectItem>
                    <SelectItem value="教授">教授</SelectItem>
                    <SelectItem value="博士后">博士后</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="school">学校</Label>
                <Select
                  value={newMember.school}
                  onValueChange={(value) => setNewMember({ ...newMember, school: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择学校" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="华东师范大学">华东师范大学</SelectItem>
                    <SelectItem value="苏州大学">苏州大学</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateMember} disabled={isSubmitting}>
                {isSubmitting ? '添加中...' : '确认添加'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>成员列表</CardTitle>
          <CardDescription>课题组成员一览</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12">
                暂无成员
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">{member.name}</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4" />
                        <span>{member.identity}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {member.school}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{member.school}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

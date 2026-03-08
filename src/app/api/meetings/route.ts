import { NextRequest, NextResponse } from 'next/server';
import { meetingManager } from '@/storage/database';
import type { InsertMeeting } from '@/storage/database';

// 获取所有会议
export async function GET() {
  try {
    const meetings = await meetingManager.getMeetings();
    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { success: false, error: '获取会议列表失败' },
      { status: 500 }
    );
  }
}

// 创建新会议
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.date) {
      return NextResponse.json(
        { success: false, error: '请选择会议日期时间' },
        { status: 400 }
      );
    }
    if (!body.location) {
      return NextResponse.json(
        { success: false, error: '请输入会议地点或会议链接' },
        { status: 400 }
      );
    }
    if (!body.creator) {
      return NextResponse.json(
        { success: false, error: '请输入创建人姓名' },
        { status: 400 }
      );
    }
    if (!body.presenterCount) {
      return NextResponse.json(
        { success: false, error: '请输入汇报人数' },
        { status: 400 }
      );
    }

    const meetingData: InsertMeeting = {
      date: new Date(body.date),
      location: body.location || null,
      creator: body.creator || null,
      creatorId: body.creatorId || null,
      presenterCount: parseInt(body.presenterCount, 10) || null,
      notes: body.notes || null,
    };

    const meeting = await meetingManager.createMeeting(meetingData);
    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    // 提取具体的验证错误信息
    const errorMessage = error instanceof Error ? error.message : '创建会议失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

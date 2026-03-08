import { NextRequest, NextResponse } from 'next/server';
import { meetingManager } from '@/storage/database';
import type { UpdateMeeting } from '@/storage/database';

// 获取单个会议
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meeting = await meetingManager.getMeetingById(id);
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: '会议不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { success: false, error: '获取会议信息失败' },
      { status: 500 }
    );
  }
}

// 更新会议
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: UpdateMeeting = {};

    // 只更新提供的字段
    if (body.date !== undefined) {
      updateData.date = new Date(body.date);
    }
    if (body.location !== undefined) {
      updateData.location = body.location;
    }
    if (body.creator !== undefined) {
      updateData.creator = body.creator;
    }
    if (body.creatorId !== undefined) {
      updateData.creatorId = body.creatorId;
    }
    if (body.presenterCount !== undefined) {
      updateData.presenterCount = parseInt(body.presenterCount, 10) || null;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const meeting = await meetingManager.updateMeeting(id, updateData);
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: '会议不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error('Error updating meeting:', error);
    const errorMessage = error instanceof Error ? error.message : '更新会议失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// 删除会议
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await meetingManager.deleteMeeting(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: '会议不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { success: false, error: '删除会议失败' },
      { status: 500 }
    );
  }
}

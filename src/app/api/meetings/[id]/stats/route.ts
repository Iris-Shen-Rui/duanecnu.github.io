import { NextRequest, NextResponse } from 'next/server';
import { meetingSubmissionManager, meetingManager } from '@/storage';

// 获取某次会议的提交统计
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

    const submissions = await meetingSubmissionManager.getSubmissions({
      filters: { meetingId: id, isDraft: false },
    });

    const submissionCount = submissions.length;
    const isCompleted = meeting.presenterCount 
      ? submissionCount >= meeting.presenterCount 
      : false;

    return NextResponse.json({
      success: true,
      data: {
        meetingId: id,
        submissionCount,
        presenterCount: meeting.presenterCount,
        isCompleted,
        submissions: submissions,
      },
    });
  } catch (error) {
    console.error('Error getting meeting stats:', error);
    return NextResponse.json(
      { success: false, error: '获取统计失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { feedbackManager } from '@/storage/database';
import type { InsertFeedback } from '@/storage/database';

// 提交反馈
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const feedbackData: InsertFeedback = {
      memberId: body.memberId,
      content: body.content,
      isAnonymous: body.isAnonymous || false,
    };

    const feedback = await feedbackManager.createFeedback(feedbackData);
    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { success: false, error: '提交反馈失败' },
      { status: 500 }
    );
  }
}

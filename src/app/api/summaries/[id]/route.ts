import { NextRequest, NextResponse } from 'next/server';
import { semesterSummaryManager } from '@/storage/database';
import type { UpdateSemesterSummary } from '@/storage/database';

// 更新学期总结
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: UpdateSemesterSummary = {
      publishedPapers: body.publishedPapers,
      newSubmissions: body.newSubmissions,
      literatureReports: body.literatureReports,
      impressiveLiterature: body.impressiveLiterature,
      newTheories: body.newTheories,
      researchIdeas: body.researchIdeas,
      teamCitizenship: body.teamCitizenship,
      publicArticles: body.publicArticles,
      criticisms: body.criticisms,
      isDraft: body.isDraft,
    };

    const summary = await semesterSummaryManager.updateSummary(id, updateData);

    if (!summary) {
      return NextResponse.json(
        { success: false, error: '学期总结不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error updating summary:', error);
    return NextResponse.json(
      { success: false, error: '更新学期总结失败' },
      { status: 500 }
    );
  }
}

// 获取单个学期总结
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const summary = await semesterSummaryManager.getSummaryById(id);

    if (!summary) {
      return NextResponse.json(
        { success: false, error: '学期总结不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { success: false, error: '获取学期总结失败' },
      { status: 500 }
    );
  }
}

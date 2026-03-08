import { NextRequest, NextResponse } from 'next/server';
import { semesterSummaryManager } from '@/storage/database';
import type { InsertSemesterSummary, UpdateSemesterSummary } from '@/storage/database';

// 获取学期总结列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const semester = searchParams.get('semester');
    const memberId = searchParams.get('memberId');

    const filters: any = {};
    if (semester) filters.semester = semester;
    if (memberId) filters.memberId = memberId;

    const summaries = await semesterSummaryManager.getSummaries({
      filters,
    });

    return NextResponse.json({ success: true, data: summaries });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json(
      { success: false, error: '获取学期总结失败' },
      { status: 500 }
    );
  }
}

// 创建学期总结
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const summaryData: InsertSemesterSummary = {
      memberId: body.memberId,
      semester: body.semester,
      publishedPapers: body.publishedPapers || [],
      newSubmissions: body.newSubmissions || [],
      literatureReports: body.literatureReports || [],
      impressiveLiterature: body.impressiveLiterature || null,
      newTheories: body.newTheories || null,
      researchIdeas: body.researchIdeas || null,
      teamCitizenship: body.teamCitizenship || null,
      publicArticles: body.publicArticles || [],
      criticisms: body.criticisms || [],
      isDraft: body.isDraft || false,
    };

    const summary = await semesterSummaryManager.createSummary(summaryData);
    return NextResponse.json({ success: true, data: summary }, { status: 201 });
  } catch (error) {
    console.error('Error creating summary:', error);
    return NextResponse.json(
      { success: false, error: '创建学期总结失败' },
      { status: 500 }
    );
  }
}

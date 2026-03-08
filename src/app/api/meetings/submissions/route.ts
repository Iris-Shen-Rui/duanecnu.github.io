import { NextRequest, NextResponse } from 'next/server';
import { meetingSubmissionManager, S3Storage } from '@/storage';
import type { InsertMeetingSubmission } from '@/storage/database';

// 获取会议提交列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const meetingId = searchParams.get('meetingId');
    const memberId = searchParams.get('memberId');

    const filters: any = {};
    if (meetingId) filters.meetingId = meetingId;
    if (memberId) filters.memberId = memberId;

    const submissions = await meetingSubmissionManager.getSubmissions({
      filters,
    });

    // 生成文件访问URL
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    const submissionsWithUrls = await Promise.all(
      submissions.map(async (submission: any) => {
        const url = await storage.generatePresignedUrl({
          key: submission.fileKey,
          expireTime: 86400, // 1天
        });
        return {
          ...submission,
          fileUrl: url,
        };
      })
    );

    return NextResponse.json({ success: true, data: submissionsWithUrls });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: '获取提交列表失败' },
      { status: 500 }
    );
  }
}

// 创建新的提交
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const submissionData: InsertMeetingSubmission = {
      meetingId: body.meetingId,
      memberId: body.memberId,
      presenterName: body.presenterName || null,
      fileKey: body.fileKey,
      fileName: body.fileName,
      fileType: body.fileType || null,
      tags: body.tags || null,
      notes: body.notes || null,
      isDraft: body.isDraft || false,
    };

    const submission = await meetingSubmissionManager.createSubmission(submissionData);
    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, error: '创建提交失败' },
      { status: 500 }
    );
  }
}

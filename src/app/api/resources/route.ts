import { NextRequest, NextResponse } from 'next/server';
import { meetingSubmissionManager, semesterSummaryManager, memberManager } from '@/storage';
import { S3Storage } from 'coze-coding-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const type = searchParams.get('type'); // 'literature' | 'theory'

    // 获取所有会议提交
    const submissions = await meetingSubmissionManager.getSubmissions();
    
    // 获取所有学期总结
    const summaries = await semesterSummaryManager.getSummaries();

    // 获取所有成员
    const members = await memberManager.getMembers();

    // 获取S3存储实例
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    // 收集所有文献
    const literatureList: Array<{
      id: string;
      title: string;
      tags: string[];
      source: string;
      memberName: string;
      date: string;
      fileUrl?: string;
      type: 'meeting' | 'impressive';
    }> = [];

    // 从会议提交中收集文献
    for (const submission of submissions) {
      const member = members.find(m => m.id === submission.memberId);
      const tags = submission.tags ? submission.tags.split(',').map(t => t.trim()) : [];
      
      literatureList.push({
        id: `meeting-${submission.id}`,
        title: submission.fileName || '未命名文件',
        tags,
        source: '组会报告',
        memberName: member?.name || member?.identity || '未知成员',
        date: String(submission.createdAt),
        type: 'meeting',
        fileUrl: await storage.generatePresignedUrl({
          key: submission.fileKey || '',
          expireTime: 86400,
        }).catch(() => ''),
      });
    }

    // 从学期总结中收集印象深刻的文献
    for (const summary of summaries) {
      if (summary.impressiveLiterature) {
        const member = members.find(m => m.id === summary.memberId);
        literatureList.push({
          id: `summary-${summary.id}`,
          title: summary.impressiveLiterature.substring(0, 50) + '...',
          tags: ['印象深刻的文献'],
          source: '学期总结',
          memberName: member?.name || '未知成员',
          date: String(summary.createdAt),
          type: 'impressive',
        });
      }
    }

    // 收集所有理论构念
    const theories: Array<{
      id: string;
      name: string;
      memberName: string;
      date: string;
      semester: string;
    }> = [];

    for (const summary of summaries) {
      if (summary.newTheories) {
        const member = members.find(m => m.id === summary.memberId);
        theories.push({
          id: `theory-${summary.id}`,
          name: summary.newTheories,
          memberName: member?.name || '未知成员',
          date: String(summary.createdAt),
          semester: summary.semester,
        });
      }
    }

    // 提取所有tags用于词云
    const allTags = new Map<string, number>();
    literatureList.forEach(lit => {
      lit.tags.forEach(tag => {
        allTags.set(tag, (allTags.get(tag) || 0) + 1);
      });
    });

    // 统计数据
    const stats = {
      publishedPapers: [] as Array<{ semester: string; count: number; date: string }>,
      newSubmissions: [] as Array<{ semester: string; count: number; date: string }>,
      publicArticles: [] as Array<{ semester: string; count: number; date: string }>,
    };

    summaries.forEach(summary => {
      const semester = summary.semester;
      const date = String(summary.createdAt);

      // 发表文章
      if (summary.publishedPapers && Array.isArray(summary.publishedPapers) && summary.publishedPapers.length > 0) {
        const existing = stats.publishedPapers.find(s => s.semester === semester);
        if (existing) {
          existing.count += summary.publishedPapers.length;
        } else {
          stats.publishedPapers.push({ semester, count: summary.publishedPapers.length, date });
        }
      }

      // 投稿
      if (summary.newSubmissions && Array.isArray(summary.newSubmissions) && summary.newSubmissions.length > 0) {
        const existing = stats.newSubmissions.find(s => s.semester === semester);
        if (existing) {
          existing.count += summary.newSubmissions.length;
        } else {
          stats.newSubmissions.push({ semester, count: summary.newSubmissions.length, date });
        }
      }

      // 公众号文章
      if (summary.publicArticles && Array.isArray(summary.publicArticles) && summary.publicArticles.length > 0) {
        const existing = stats.publicArticles.find(s => s.semester === semester);
        if (existing) {
          existing.count += summary.publicArticles.length;
        } else {
          stats.publicArticles.push({ semester, count: summary.publicArticles.length, date });
        }
      }
    });

    // 排序统计数据
    const sortStats = (arr: any[]) => arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    stats.publishedPapers = sortStats(stats.publishedPapers);
    stats.newSubmissions = sortStats(stats.newSubmissions);
    stats.publicArticles = sortStats(stats.publicArticles);

    // 搜索过滤
    let filteredLiterature = literatureList;
    let filteredTheories = theories;

    if (query) {
      const lowerQuery = query.toLowerCase();
      if (type === 'literature' || !type) {
        filteredLiterature = literatureList.filter(
          lit => lit.title.toLowerCase().includes(lowerQuery) ||
                 lit.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      }
      if (type === 'theory' || !type) {
        filteredTheories = theories.filter(
          t => t.name.toLowerCase().includes(lowerQuery)
        );
      }
    }

    // 转换词云数据
    const wordCloudData = Array.from(allTags.entries()).map(([text, value]) => ({
      text,
      value,
    }));

    return NextResponse.json({
      success: true,
      data: {
        literature: filteredLiterature,
        theories: filteredTheories,
        wordCloud: wordCloudData,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, error: '获取资源数据失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database';
import type { InsertMember } from '@/storage/database';

// 获取所有成员
export async function GET() {
  try {
    const members = await memberManager.getMembers();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: '获取成员列表失败' },
      { status: 500 }
    );
  }
}

// 创建新成员
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const memberData: InsertMember = {
      name: body.name,
      identity: body.identity,
      school: body.school,
    };

    const member = await memberManager.createMember(memberData);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { success: false, error: '创建成员失败' },
      { status: 500 }
    );
  }
}

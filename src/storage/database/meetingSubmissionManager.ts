import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { meetingSubmissions, insertMeetingSubmissionSchema, updateMeetingSubmissionSchema } from "./shared/schema";
import type { MeetingSubmission, InsertMeetingSubmission, UpdateMeetingSubmission } from "./shared/schema";

export class MeetingSubmissionManager {
  async createSubmission(data: InsertMeetingSubmission): Promise<MeetingSubmission> {
    const db = await getDb();
    const validated = insertMeetingSubmissionSchema.parse(data);
    const [submission] = await db.insert(meetingSubmissions).values(validated).returning();
    return submission;
  }

  async getSubmissions(options: { 
    skip?: number; 
    limit?: number; 
    filters?: Partial<Pick<MeetingSubmission, 'id' | 'meetingId' | 'memberId' | 'isDraft'>> 
  } = {}): Promise<MeetingSubmission[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(meetingSubmissions.id, filters.id));
    }
    if (filters.meetingId !== undefined) {
      conditions.push(eq(meetingSubmissions.meetingId, filters.meetingId));
    }
    if (filters.memberId !== undefined) {
      conditions.push(eq(meetingSubmissions.memberId, filters.memberId));
    }
    if (filters.isDraft !== undefined) {
      conditions.push(eq(meetingSubmissions.isDraft, filters.isDraft));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(meetingSubmissions)
        .where(and(...conditions))
        .orderBy(desc(meetingSubmissions.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(meetingSubmissions)
      .orderBy(desc(meetingSubmissions.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getSubmissionById(id: string): Promise<MeetingSubmission | null> {
    const db = await getDb();
    const [submission] = await db
      .select()
      .from(meetingSubmissions)
      .where(eq(meetingSubmissions.id, id));
    return submission || null;
  }

  async updateSubmission(id: string, data: UpdateMeetingSubmission): Promise<MeetingSubmission | null> {
    const db = await getDb();
    const validated = updateMeetingSubmissionSchema.parse(data);
    const [submission] = await db
      .update(meetingSubmissions)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(meetingSubmissions.id, id))
      .returning();
    return submission || null;
  }

  async deleteSubmission(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(meetingSubmissions).where(eq(meetingSubmissions.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const meetingSubmissionManager = new MeetingSubmissionManager();

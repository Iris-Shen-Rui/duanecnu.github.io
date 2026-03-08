import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { meetings, insertMeetingSchema, updateMeetingSchema } from "./shared/schema";
import type { Meeting, InsertMeeting, UpdateMeeting } from "./shared/schema";

export class MeetingManager {
  async createMeeting(data: InsertMeeting): Promise<Meeting> {
    const db = await getDb();
    const validated = insertMeetingSchema.parse(data);
    const [meeting] = await db.insert(meetings).values(validated).returning();
    return meeting;
  }

  async getMeetings(options: { 
    skip?: number; 
    limit?: number; 
    filters?: Partial<Pick<Meeting, 'id'>> 
  } = {}): Promise<Meeting[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(meetings.id, filters.id));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(meetings)
        .where(and(...conditions))
        .orderBy(desc(meetings.date))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(meetings)
      .orderBy(desc(meetings.date))
      .limit(limit)
      .offset(skip);
  }

  async getMeetingById(id: string): Promise<Meeting | null> {
    const db = await getDb();
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting || null;
  }

  async updateMeeting(id: string, data: UpdateMeeting): Promise<Meeting | null> {
    const db = await getDb();
    const validated = updateMeetingSchema.parse(data);
    const [meeting] = await db
      .update(meetings)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();
    return meeting || null;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(meetings).where(eq(meetings.id, id)).returning();
    return result.length > 0;
  }
}

export const meetingManager = new MeetingManager();

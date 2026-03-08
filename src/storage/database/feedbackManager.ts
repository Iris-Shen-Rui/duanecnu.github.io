import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { feedbacks, insertFeedbackSchema } from "./shared/schema";
import type { Feedback, InsertFeedback } from "./shared/schema";

export class FeedbackManager {
  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const db = await getDb();
    const validated = insertFeedbackSchema.parse(data);
    const [feedback] = await db.insert(feedbacks).values(validated).returning();
    return feedback;
  }

  async getFeedbacks(options: { 
    skip?: number; 
    limit?: number; 
    filters?: Partial<Pick<Feedback, 'id' | 'memberId' | 'isAnonymous'>> 
  } = {}): Promise<Feedback[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(feedbacks.id, filters.id));
    }
    if (filters.memberId !== undefined) {
      conditions.push(eq(feedbacks.memberId, filters.memberId));
    }
    if (filters.isAnonymous !== undefined) {
      conditions.push(eq(feedbacks.isAnonymous, filters.isAnonymous));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(feedbacks)
        .where(and(...conditions))
        .orderBy(desc(feedbacks.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(feedbacks)
      .orderBy(desc(feedbacks.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    const db = await getDb();
    const [feedback] = await db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.id, id));
    return feedback || null;
  }

  async deleteFeedback(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(feedbacks).where(eq(feedbacks.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const feedbackManager = new FeedbackManager();

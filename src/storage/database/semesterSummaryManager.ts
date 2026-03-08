import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { semesterSummaries, insertSemesterSummarySchema, updateSemesterSummarySchema } from "./shared/schema";
import type { SemesterSummary, InsertSemesterSummary, UpdateSemesterSummary } from "./shared/schema";

export class SemesterSummaryManager {
  async createSummary(data: InsertSemesterSummary): Promise<SemesterSummary> {
    const db = await getDb();
    const validated = insertSemesterSummarySchema.parse(data);
    const [summary] = await db.insert(semesterSummaries).values(validated).returning();
    return summary;
  }

  async getSummaries(options: { 
    skip?: number; 
    limit?: number; 
    filters?: Partial<Pick<SemesterSummary, 'id' | 'memberId' | 'semester' | 'isDraft'>> 
  } = {}): Promise<SemesterSummary[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(semesterSummaries.id, filters.id));
    }
    if (filters.memberId !== undefined) {
      conditions.push(eq(semesterSummaries.memberId, filters.memberId));
    }
    if (filters.semester !== undefined) {
      conditions.push(eq(semesterSummaries.semester, filters.semester));
    }
    if (filters.isDraft !== undefined) {
      conditions.push(eq(semesterSummaries.isDraft, filters.isDraft));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(semesterSummaries)
        .where(and(...conditions))
        .orderBy(desc(semesterSummaries.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(semesterSummaries)
      .orderBy(desc(semesterSummaries.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getSummaryById(id: string): Promise<SemesterSummary | null> {
    const db = await getDb();
    const [summary] = await db
      .select()
      .from(semesterSummaries)
      .where(eq(semesterSummaries.id, id));
    return summary || null;
  }

  async getMemberSummaryBySemester(memberId: string, semester: string): Promise<SemesterSummary | null> {
    const db = await getDb();
    const [summary] = await db
      .select()
      .from(semesterSummaries)
      .where(
        and(
          eq(semesterSummaries.memberId, memberId),
          eq(semesterSummaries.semester, semester)
        )
      );
    return summary || null;
  }

  async updateSummary(id: string, data: UpdateSemesterSummary): Promise<SemesterSummary | null> {
    const db = await getDb();
    const validated = updateSemesterSummarySchema.parse(data);
    const [summary] = await db
      .update(semesterSummaries)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(semesterSummaries.id, id))
      .returning();
    return summary || null;
  }

  async deleteSummary(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(semesterSummaries).where(eq(semesterSummaries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSummariesBySemester(semester: string): Promise<SemesterSummary[]> {
    const db = await getDb();
    return db
      .select()
      .from(semesterSummaries)
      .where(eq(semesterSummaries.semester, semester))
      .orderBy(desc(semesterSummaries.createdAt));
  }
}

export const semesterSummaryManager = new SemesterSummaryManager();

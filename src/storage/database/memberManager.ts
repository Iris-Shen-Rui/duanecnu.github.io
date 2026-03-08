import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { members, insertMemberSchema, updateMemberSchema } from "./shared/schema";
import type { Member, InsertMember, UpdateMember } from "./shared/schema";

export class MemberManager {
  async createMember(data: InsertMember): Promise<Member> {
    const db = await getDb();
    const validated = insertMemberSchema.parse(data);
    const [member] = await db.insert(members).values(validated).returning();
    return member;
  }

  async getMembers(options: { 
    skip?: number; 
    limit?: number; 
    filters?: Partial<Pick<Member, 'id' | 'name' | 'identity' | 'school'>> 
  } = {}): Promise<Member[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(members.id, filters.id));
    }
    if (filters.name !== undefined) {
      conditions.push(eq(members.name, filters.name));
    }
    if (filters.identity !== undefined) {
      conditions.push(eq(members.identity, filters.identity));
    }
    if (filters.school !== undefined) {
      conditions.push(eq(members.school, filters.school));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(members)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(members).limit(limit).offset(skip);
  }

  async getMemberById(id: string): Promise<Member | null> {
    const db = await getDb();
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member || null;
  }

  async updateMember(id: string, data: UpdateMember): Promise<Member | null> {
    const db = await getDb();
    const validated = updateMemberSchema.parse(data);
    const [member] = await db
      .update(members)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return member || null;
  }

  async deleteMember(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(members).where(eq(members.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMemberOptions(): Promise<{ id: string; name: string; identity: string }[]> {
    const db = await getDb();
    return db
      .select({
        id: members.id,
        name: members.name,
        identity: members.identity,
      })
      .from(members)
      .orderBy(members.name);
  }
}

export const memberManager = new MemberManager();

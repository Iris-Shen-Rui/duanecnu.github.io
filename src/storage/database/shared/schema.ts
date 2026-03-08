import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// 成员表
export const members = pgTable(
  "members",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    identity: varchar("identity", { length: 50 }).notNull(), // 硕士、博士、毕业生等
    school: varchar("school", { length: 50 }).notNull(), // 苏大、华师大
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    nameIdx: index("members_name_idx").on(table.name),
  })
);

// 组会表
export const meetings = pgTable(
  "meetings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    date: timestamp("date", { withTimezone: true }).notNull(),
    location: varchar("location", { length: 255 }), // 线下地点或腾讯会议链接
    creator: varchar("creator", { length: 128 }), // 创建人姓名
    creatorId: varchar("creator_id", { length: 36 }), // 创建人ID
    presenterCount: integer("presenter_count"), // 汇报人数
    notes: text("notes"), // 备注
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    dateIdx: index("meetings_date_idx").on(table.date),
  })
);

// 组会提交表
export const meetingSubmissions = pgTable(
  "meeting_submissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    meetingId: varchar("meeting_id", { length: 36 })
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    memberId: varchar("member_id", { length: 36 })
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    presenterName: varchar("presenter_name", { length: 128 }), // 汇报人姓名
    fileKey: varchar("file_key", { length: 500 }), // S3对象存储key
    fileName: varchar("file_name", { length: 255 }), // 文件名
    fileType: varchar("file_type", { length: 50 }), // ppt、pdf等
    tags: text("tags"), // 标签，多个用逗号分隔
    notes: text("notes"), // 备注和老师点评
    isDraft: boolean("is_draft").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    meetingIdx: index("meeting_submissions_meeting_idx").on(table.meetingId),
    memberIdx: index("meeting_submissions_member_idx").on(table.memberId),
  })
);

// 学期总结表
export const semesterSummaries = pgTable(
  "semester_summaries",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id", { length: 36 })
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    semester: varchar("semester", { length: 50 }).notNull(), // 学期，如"2024-2025-第一学期"
    
    // 发表/录用
    publishedPapers: jsonb("published_papers"), // [{journal: string, level: string, title: string}]
    
    // 新投稿
    newSubmissions: jsonb("new_submissions"), // [{title: string, journal: string}]
    
    // 文献报告
    literatureReports: jsonb("literature_reports"), // [{source: string, reportDate: string, type: string}] type: oral/written
    
    // 印象最深的文献
    impressiveLiterature: text("impressive_literature"),
    
    // 新学习的理论或构念
    newTheories: text("new_theories"),
    
    // 近期研究设想
    researchIdeas: text("research_ideas"),
    
    // 团队公民行为
    teamCitizenship: text("team_citizenship"),
    
    // 公众号科普文章
    publicArticles: jsonb("public_articles"), // [{title: string, url: string}]
    
    // 被点名批评
    criticisms: jsonb("criticisms"), // [{reason: string, date: string}]
    
    isDraft: boolean("is_draft").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    memberIdx: index("semester_summaries_member_idx").on(table.memberId),
    semesterIdx: index("semester_summaries_semester_idx").on(table.semester),
  })
);

// 反馈建议表
export const feedbacks = pgTable(
  "feedbacks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id", { length: 36 })
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    memberIdx: index("feedbacks_member_idx").on(table.memberId),
  })
);

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Members schemas
export const insertMemberSchema = createCoercedInsertSchema(members).pick({
  name: true,
  identity: true,
  school: true,
});

export const updateMemberSchema = createCoercedInsertSchema(members)
  .pick({
    name: true,
    identity: true,
    school: true,
  })
  .partial();

// Meetings schemas
export const insertMeetingSchema = createCoercedInsertSchema(meetings).pick({
  date: true,
  location: true,
  creator: true,
  creatorId: true,
  presenterCount: true,
  notes: true,
});

export const updateMeetingSchema = createCoercedInsertSchema(meetings)
  .pick({
    date: true,
    location: true,
    creator: true,
    creatorId: true,
    presenterCount: true,
    notes: true,
  })
  .partial();

// Meeting Submissions schemas
export const insertMeetingSubmissionSchema = createCoercedInsertSchema(meetingSubmissions).pick({
  meetingId: true,
  memberId: true,
  presenterName: true,
  fileKey: true,
  fileName: true,
  fileType: true,
  tags: true,
  notes: true,
  isDraft: true,
});

export const updateMeetingSubmissionSchema = createCoercedInsertSchema(meetingSubmissions)
  .pick({
    presenterName: true,
    fileKey: true,
    fileName: true,
    fileType: true,
    tags: true,
    notes: true,
    isDraft: true,
  })
  .partial();

// Semester Summaries schemas
export const insertSemesterSummarySchema = createCoercedInsertSchema(semesterSummaries).pick({
  memberId: true,
  semester: true,
  publishedPapers: true,
  newSubmissions: true,
  literatureReports: true,
  impressiveLiterature: true,
  newTheories: true,
  researchIdeas: true,
  teamCitizenship: true,
  publicArticles: true,
  criticisms: true,
  isDraft: true,
});

export const updateSemesterSummarySchema = createCoercedInsertSchema(semesterSummaries)
  .pick({
    publishedPapers: true,
    newSubmissions: true,
    literatureReports: true,
    impressiveLiterature: true,
    newTheories: true,
    researchIdeas: true,
    teamCitizenship: true,
    publicArticles: true,
    criticisms: true,
    isDraft: true,
  })
  .partial();

// Feedbacks schemas
export const insertFeedbackSchema = createCoercedInsertSchema(feedbacks).pick({
  memberId: true,
  content: true,
  isAnonymous: true,
});

// TypeScript types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type UpdateMeeting = z.infer<typeof updateMeetingSchema>;

export type MeetingSubmission = typeof meetingSubmissions.$inferSelect;
export type InsertMeetingSubmission = z.infer<typeof insertMeetingSubmissionSchema>;
export type UpdateMeetingSubmission = z.infer<typeof updateMeetingSubmissionSchema>;

export type SemesterSummary = typeof semesterSummaries.$inferSelect;
export type InsertSemesterSummary = z.infer<typeof insertSemesterSummarySchema>;
export type UpdateSemesterSummary = z.infer<typeof updateSemesterSummarySchema>;

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

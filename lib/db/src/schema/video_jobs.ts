import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videoJobsTable = pgTable("video_jobs", {
  id: text("id").primaryKey(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  currentLayer: integer("current_layer").notNull().default(0),
  duration: integer("duration").notNull().default(30),
  resolution: text("resolution").notNull().default("4K"),
  videoUrl: text("video_url"),
  estimatedTime: integer("estimated_time").default(60),
  computeTime: integer("compute_time").default(0),
  errorMessage: text("error_message"),
  environment: text("environment").notNull().default("studio"),
  hairType: text("hair_type"),
  ethnicBackground: text("ethnic_background"),
  voiceText: text("voice_text"),
  voiceClone: boolean("voice_clone").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVideoJobSchema = createInsertSchema(videoJobsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertVideoJob = z.infer<typeof insertVideoJobSchema>;
export type VideoJob = typeof videoJobsTable.$inferSelect;

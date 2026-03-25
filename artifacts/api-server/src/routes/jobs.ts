import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { videoJobsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreateJobBody,
  GetJobParams,
  DeleteJobParams,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/jobs", async (req, res) => {
  try {
    const jobs = await db
      .select()
      .from(videoJobsTable)
      .orderBy(videoJobsTable.createdAt);
    res.json(jobs.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list jobs");
    res.status(500).json({ error: "internal_error", message: "Failed to list jobs" });
  }
});

router.post("/jobs", async (req, res) => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const body = parsed.data;
  const id = randomUUID();

  try {
    const [job] = await db
      .insert(videoJobsTable)
      .values({
        id,
        prompt: body.prompt,
        duration: body.duration ?? 30,
        resolution: body.resolution ?? "4K",
        environment: body.environment ?? "studio",
        hairType: body.hairType ?? null,
        ethnicBackground: body.ethnicBackground ?? null,
        voiceText: body.voiceText ?? null,
        voiceClone: body.voiceClone ?? false,
        status: "queued",
        progress: 0,
        currentLayer: 0,
        estimatedTime: 60,
        computeTime: 0,
      })
      .returning();

    simulateJobProcessing(id, req.log);

    res.status(201).json(job);
  } catch (err) {
    req.log.error({ err }, "Failed to create job");
    res.status(500).json({ error: "internal_error", message: "Failed to create job" });
  }
});

router.get("/jobs/:id", async (req, res) => {
  const parsed = GetJobParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  try {
    const [job] = await db
      .select()
      .from(videoJobsTable)
      .where(eq(videoJobsTable.id, parsed.data.id));

    if (!job) {
      res.status(404).json({ error: "not_found", message: "Job not found" });
      return;
    }

    res.json(job);
  } catch (err) {
    req.log.error({ err }, "Failed to get job");
    res.status(500).json({ error: "internal_error", message: "Failed to get job" });
  }
});

router.delete("/jobs/:id", async (req, res) => {
  const parsed = DeleteJobParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  try {
    const [deleted] = await db
      .delete(videoJobsTable)
      .where(eq(videoJobsTable.id, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "not_found", message: "Job not found" });
      return;
    }

    res.json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete job");
    res.status(500).json({ error: "internal_error", message: "Failed to delete job" });
  }
});


function simulateJobProcessing(jobId: string, log: any) {
  const TOTAL_LAYERS = 2000;
  const COMPUTE_TIME_MS = 60000;
  const UPDATE_INTERVAL_MS = 1000;
  const totalSteps = COMPUTE_TIME_MS / UPDATE_INTERVAL_MS;
  let step = 0;

  const interval = setInterval(async () => {
    step++;
    const progress = Math.min(Math.round((step / totalSteps) * 100), 100);
    const currentLayer = Math.min(Math.round((step / totalSteps) * TOTAL_LAYERS), TOTAL_LAYERS);
    const computeTime = step;
    const estimatedTime = Math.max(0, totalSteps - step);

    try {
      if (step === 1) {
        await db
          .update(videoJobsTable)
          .set({ status: "processing", progress, currentLayer, computeTime, estimatedTime, updatedAt: new Date() })
          .where(eq(videoJobsTable.id, jobId));
      } else if (step >= totalSteps) {
        clearInterval(interval);
        await db
          .update(videoJobsTable)
          .set({
            status: "completed",
            progress: 100,
            currentLayer: TOTAL_LAYERS,
            computeTime: totalSteps,
            estimatedTime: 0,
            videoUrl: `https://storage.googleapis.com/pireel-outputs/${jobId}/output.mp4`,
            updatedAt: new Date(),
          })
          .where(eq(videoJobsTable.id, jobId));
      } else {
        await db
          .update(videoJobsTable)
          .set({ progress, currentLayer, computeTime, estimatedTime, updatedAt: new Date() })
          .where(eq(videoJobsTable.id, jobId));
      }
    } catch (err) {
      log.error({ err, jobId }, "Failed to update job progress");
      clearInterval(interval);
    }
  }, UPDATE_INTERVAL_MS);
}

export default router;

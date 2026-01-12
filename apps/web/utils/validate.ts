import { z } from "zod";

export const CommentRequestSchema = z.object({
  content: z.string().min(10, "content must be at least 10 characters"),
  userStyle: z
    .union([
      z.string().max(1000),
      z.object({
        name: z.string(),
        profile: z.string(),
      }),
    ])
    .optional(),
  samples: z.array(z.string()).max(10).optional(),
});

export type CommentRequestBody = z.infer<typeof CommentRequestSchema>;

export function parseRequestBody(body: unknown): CommentRequestBody {
  try {
    return CommentRequestSchema.parse(body);
  } catch (err: any) {
    const message =
      err?.errors?.map((e: any) => e.message).join("; ") ||
      "Invalid request body";
    throw new Error(message);
  }
}

export const VoiceProfileRequestSchema = z
  .object({
    description: z.string().min(5).optional(),
    samples: z.array(z.string()).min(1).max(10).optional(),
  })
  .refine((data) => data.description || data.samples, {
    message: "Either description or samples must be provided",
  });

export type VoiceProfileRequestBody = z.infer<typeof VoiceProfileRequestSchema>;

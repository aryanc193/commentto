import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseRequestBody } from "../../../utils/validate";
import { summarizeText, generateComment } from "../../../lib/llm";
import { safeTruncate } from "@commentto/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, samples, userStyle } = parseRequestBody(body);
    const regenerate = Boolean(body.regenerate);

    const truncatedContent = safeTruncate(content);

    const summary = await summarizeText(truncatedContent);

    let voiceProfile: string | undefined;

    const resolvedVoiceProfile =
      typeof userStyle === "string"
        ? userStyle
        : userStyle && "profile" in userStyle
        ? userStyle.profile
        : undefined;

    const comment = await generateComment({
      summary,
      ...(resolvedVoiceProfile ? { voiceProfile: resolvedVoiceProfile } : {}),
      regenerate,
    });

    return NextResponse.json(
      { summary, comment, voiceProfile },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate comment" },
      { status: 400 }
    );
  }
}

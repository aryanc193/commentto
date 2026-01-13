import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseRequestBody } from "../../../utils/validate";
import { summarizeText, generateComment, enhanceDraft } from "../../../lib/llm";
import { safeTruncate } from "@commentto/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const draft = typeof body.draft === "string" ? body.draft : null;

    const { content, samples, userStyle } = parseRequestBody(body);
    const regenerate = Boolean(body.regenerate);

    const truncatedContent = safeTruncate(content);

    let voiceProfile: string | undefined;

    const resolvedVoiceProfile =
      typeof userStyle === "string"
        ? userStyle
        : userStyle && "profile" in userStyle
        ? userStyle.profile
        : undefined;

    let summary = "";
    let comment = "";

    if (draft) {
      comment = await enhanceDraft({
        draft,
        ...(resolvedVoiceProfile ? { voiceProfile: resolvedVoiceProfile } : {}),
        regenerate,
      });
    } else {
      summary = await summarizeText(truncatedContent);
      comment = await generateComment({
        summary,
        ...(resolvedVoiceProfile ? { voiceProfile: resolvedVoiceProfile } : {}),
        regenerate,
      });
    }

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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseRequestBody } from "../../../utils/validate";
import { summarizeText, generateComment } from "../../../lib/llm";
import { safeTruncate } from "@commentto/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, samples, userStyle } = parseRequestBody(body);

    const truncatedContent = safeTruncate(content);

    const summary = await summarizeText(truncatedContent);

    let voiceProfile: string | undefined;

    const comment = await generateComment({
      summary,
      voiceProfile: body.userStyle,
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

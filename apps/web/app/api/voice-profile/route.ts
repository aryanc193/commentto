import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { VoiceProfileRequestSchema } from "../../../utils/validate";
import { deriveVoiceProfile } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = VoiceProfileRequestSchema.parse(body);

    if (!data.description) {
      throw new Error("Description is required for voice profile generation");
    }

    const voiceProfile = await deriveVoiceProfile({
      description: data.description,
    });

    return NextResponse.json({ voiceProfile }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate voice profile" },
      { status: 400 }
    );
  }
}

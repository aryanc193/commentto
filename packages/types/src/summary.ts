export interface VoiceProfileRequest {
  description?: string;
  samples?: string[];
}

export interface VoiceProfileResponse {
  voiceProfile: string;
}

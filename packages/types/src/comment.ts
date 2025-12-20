export interface CommentRequest {
  content: string;
  userStyle?: string;
  samples?: string[];
}

export interface CommentResponse {
  summary: string;
  comment: string;
  voiceProfile?: string;
}

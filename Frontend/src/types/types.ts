export interface RequestItem {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  placeholderSource?: string; 
  useBearerToken?: boolean;
  responsePreview?: string;
  statusCode?: number;
  responseTimeMs?: number;
  //integrationId: string;

  // ✅ NEW: Local run history (not sent to backend yet)
  runHistory?: RunResponse[];
}


export interface Integration {
  integrationId: string;
  name: string;
  requests: RequestItem[];
}

export type RunResponse = {
  url: string;
  statusCode: number;
  durationMs: number;
  response: any;
  extracted?: Record<string, any>;
};

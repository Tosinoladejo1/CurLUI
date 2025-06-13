export interface RequestItem {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  useBearerToken: boolean;
}

export interface Integration {
  id: string;
  name: string;
  requests: RequestItem[];
}

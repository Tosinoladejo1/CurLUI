import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Integration, RequestItem } from "../types/types";

export default function RequestEditor() {
  const { id: integrationId, requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<RequestItem | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("integrations");
    if (stored) {
      const integrations: Integration[] = JSON.parse(stored);
      const integration = integrations.find((i) => i.id === integrationId);
      const req = integration?.requests.find((r) => r.id === requestId);
      if (req) {
        setRequest(req);
      }
    }
  }, [integrationId, requestId]);

  const updateField = (field: keyof RequestItem, value: any) => {
    if (!request) return;
    const updatedRequest = { ...request, [field]: value };
    setRequest(updatedRequest);

    const stored = localStorage.getItem("integrations");
    if (stored) {
      const integrations: Integration[] = JSON.parse(stored);
      const integrationIndex = integrations.findIndex((i) => i.id === integrationId);
      if (integrationIndex !== -1) {
        const reqIndex = integrations[integrationIndex].requests.findIndex((r) => r.id === requestId);
        if (reqIndex !== -1) {
          integrations[integrationIndex].requests[reqIndex] = updatedRequest;
          localStorage.setItem("integrations", JSON.stringify(integrations));
        }
      }
    }
  };

  if (!request) return <div className="p-4">Loading request...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Edit Request</h2>

      <div>
        <label className="block font-medium">Method</label>
        <select
          value={request.method}
          onChange={(e) => updateField("method", e.target.value)}
          className="p-2 border rounded"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">URL</label>
        <input
          value={request.url}
          onChange={(e) => updateField("url", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Headers (JSON)</label>
        <textarea
          value={JSON.stringify(request.headers, null, 2)}
          onChange={(e) => {
            try {
              updateField("headers", JSON.parse(e.target.value));
            } catch {
              console.error("Invalid JSON");
            }
          }}
          className="w-full p-2 border rounded font-mono"
          rows={4}
        />
      </div>

      <div>
        <label className="block font-medium">Body (JSON)</label>
        <textarea
          value={request.body}
          onChange={(e) => updateField("body", e.target.value)}
          className="w-full p-2 border rounded font-mono"
          rows={4}
        />
      </div>

      <div>
        <label className="block font-medium">
          <input
            type="checkbox"
            checked={request.useBearerToken}
            onChange={(e) => updateField("useBearerToken", e.target.checked)}
            className="mr-2"
          />
          Use Bearer Token
        </label>
      </div>

      <div className="pt-4">
        <button
          onClick={() => navigate(`/integration/${integrationId}`)}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Done
        </button>
      </div>
    </div>
  );
}

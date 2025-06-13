import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { RequestItem, Integration } from "../types/types";
import { v4 as uuidv4 } from "uuid";

export default function IntegrationEditor() {
  const { id } = useParams(); // integration ID
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("integrations");
    if (stored) {
      const integrations: Integration[] = JSON.parse(stored);
      const integration = integrations.find((i) => i.id === id);
      if (integration) {
        setRequests(integration.requests);
      }
    }
  }, [id]);

  const addRequest = () => {
    const newReq: RequestItem = {
      id: uuidv4(),
      method: "GET",
      url: "",
      headers: {},
      body: "",
      useBearerToken: false,
    };

    const stored = localStorage.getItem("integrations");
  if (!stored) return;

  const integrations: Integration[] = JSON.parse(stored);
  const integrationIndex = integrations.findIndex((i) => i.id === id);
  if (integrationIndex === -1) return;

  // Push the new request into the correct integration
  integrations[integrationIndex].requests.push(newReq);

  // Save back to localStorage
  localStorage.setItem("integrations", JSON.stringify(integrations));

  // Update local state
  setRequests([...integrations[integrationIndex].requests]);

  // Navigate to the request editor
  navigate(`/integration/${id}/request/${newReq.id}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Integration Editor</h2>
      <button
        onClick={addRequest}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Request
      </button>
      <ul className="mt-4 space-y-2">
        {requests.map((req) => (
          <li key={req.id} className="p-2 border rounded">
            <span>{req.method} {req.url || "(no URL yet)"}</span>
            <button
              onClick={() => navigate(`/integration/${id}/request/${req.id}`)}
              className="ml-4 text-blue-600"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

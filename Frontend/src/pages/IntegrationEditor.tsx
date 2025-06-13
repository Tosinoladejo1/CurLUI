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

  const saveToStorage = (newRequests: RequestItem[]) => {
    const stored = localStorage.getItem("integrations");
    if (!stored) return;

    const integrations: Integration[] = JSON.parse(stored);
    const integrationIndex = integrations.findIndex((i) => i.id === id);
    if (integrationIndex === -1) return;

    integrations[integrationIndex].requests = newRequests;
    localStorage.setItem("integrations", JSON.stringify(integrations));
    setRequests(newRequests);
  };

  const addRequest = () => {
    const newReq: RequestItem = {
      id: uuidv4(),
      method: "GET",
      url: "",
      headers: {},
      body: "",
      useBearerToken: false,
    };

    const updatedRequests = [...requests, newReq];
    saveToStorage(updatedRequests);
    navigate(`/integration/${id}/request/${newReq.id}`);
  };

  const deleteRequest = (reqId: string) => {
    const updated = requests.filter((r) => r.id !== reqId);
    saveToStorage(updated);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Integration Editor</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Done
        </button>
      </div>

      <button
        onClick={addRequest}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Request
      </button>

      <ul className="space-y-2">
        {requests.map((req) => (
          <li
            key={req.id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <span>{req.method} — {req.url || "(no URL yet)"}</span>
            <div className="space-x-2">
              <button
                onClick={() => navigate(`/integration/${id}/request/${req.id}`)}
                className="text-blue-500"
              >
                Edit
              </button>
              <button
                onClick={() => deleteRequest(req.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

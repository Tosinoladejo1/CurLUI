import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Integration } from "../types/types";
import IntegrationCard from "../components/IntegrationCard";
import { v4 as uuidv4 } from "uuid";

interface ResponseData {
  status: number;
  time: string;
  body: any;
}

export default function Home() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [responses, setResponses] = useState<Record<string, ResponseData>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("integrations");
    if (stored) {
      setIntegrations(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("integrations", JSON.stringify(integrations));
  }, [integrations]);

  const addIntegration = () => {
    const newIntegration: Integration = {
      id: uuidv4(),
      name: `Integration ${integrations.length + 1}`,
      requests: [],
    };
    setIntegrations([...integrations, newIntegration]);
    navigate(`/integration/${newIntegration.id}`);
  };

  const runIntegration = async (integration: Integration) => {
    const runtimeValues: Record<string, string> = {
      userId: "1", // You can later collect this from a modal/input
    };

    const newResponses: Record<string, ResponseData> = {};

    for (const request of integration.requests) {
      let url = request.url;
      let body = request.body;

      Object.entries(runtimeValues).forEach(([key, val]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        url = url.replace(regex, val);
        body = body.replace(regex, val);
      });

      const headers = { ...request.headers };
      if (request.useBearerToken) {
        headers["Authorization"] = "Bearer your_token_here";
      }

      const start = performance.now();
      try {
        const res = await fetch(url, {
          method: request.method,
          headers,
          body: ["POST", "PUT", "PATCH"].includes(request.method) ? body : undefined,
        });

        const time = (performance.now() - start).toFixed(0) + "ms";
        const text = await res.text();
        const bodyJson = (() => {
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        })();

        newResponses[request.id] = {
          status: res.status,
          time,
          body: bodyJson,
        };
      } catch (err) {
        newResponses[request.id] = {
          status: 0,
          time: "Error",
          body: { error: (err as Error).message },
        };
      }
    }

    setResponses(newResponses);
  };

  const deleteIntegration = (id: string) => {
    setIntegrations(integrations.filter((i) => i.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Integrations</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={addIntegration}
      >
        Add Integration
      </button>
      <div className="mt-4 space-y-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="border p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{integration.name}</h2>
                <p className="text-sm text-gray-500">{integration.requests.length} request(s)</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => navigate(`/integration/${integration.id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => runIntegration(integration)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Run
                </button>
                <button
                  onClick={() => deleteIntegration(integration.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Show response viewer */}
            {integration.requests.map((req) => {
              const res = responses[req.id];
              return res ? (
                <div key={req.id} className="mt-4 p-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>{req.method}</strong> {req.url}
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong> {res.status} | <strong>Time:</strong> {res.time}
                  </p>
                  <pre className="bg-gray-100 p-2 text-sm rounded overflow-x-auto">
                    {JSON.stringify(res.body, null, 2)}
                  </pre>
                </div>
              ) : null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

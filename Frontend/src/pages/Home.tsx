import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Integration } from "../types/types";
import IntegrationCard from "../components/IntegrationCard";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const navigate = useNavigate();

  // Load integrations from localStorage once on mount
  useEffect(() => {
    const stored = localStorage.getItem("integrations");
    if (stored) {
      setIntegrations(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage on every update
  useEffect(() => {
    localStorage.setItem("integrations", JSON.stringify(integrations));
  }, [integrations]);

  // Create a new integration
  const addIntegration = () => {
    const newIntegration: Integration = {
      id: uuidv4(),
      name: `Integration ${integrations.length + 1}`,
      requests: [],
    };

    const updated = [...integrations, newIntegration];
    localStorage.setItem("integrations", JSON.stringify(updated));
    setIntegrations(updated);

    // Navigate to integration editor
    setTimeout(() => {
      navigate(`/integration/${newIntegration.id}`);
    }, 0);
  };

  // Delete integration
  const deleteIntegration = (id: string) => {
    const updated = integrations.filter((i) => i.id !== id);
    setIntegrations(updated);
    localStorage.setItem("integrations", JSON.stringify(updated));
  };

  // Run integration sequentially
  const runIntegration = async (integration: Integration) => {
    // Collect all placeholders like {{userId}}, {{token}}, etc.
    const placeholders = Array.from(
      new Set(
        integration.requests.flatMap((req) => {
          const matches = req.url.match(/{{(.*?)}}/g) || [];
          return matches.map((m) => m.slice(2, -2));
        })
      )
    );

    const valueMap: Record<string, string> = {};
    for (const key of placeholders) {
      const val = prompt(`Enter value for "${key}"`);
      if (val !== null) {
        valueMap[key] = val;
      }
    }

    for (const req of integration.requests) {
      const url = req.url.replace(/{{(.*?)}}/g, (_, key) => valueMap[key] || "");
      const method = req.method?.toUpperCase?.() || "GET";

      // ✅ Validate HTTP method
      const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
      if (!validMethods.includes(method)) {
        console.error(`❌ Invalid HTTP method: "${method}"`);
        alert(`Invalid HTTP method: "${method}" in one of the requests`);
        continue;
      }

      const headers: Record<string, string> = {
        ...req.headers,
      };
      if (req.useBearerToken && valueMap["token"]) {
        headers["Authorization"] = `Bearer ${valueMap["token"]}`;
      }

      const start = performance.now();

      try {
        const res = await fetch(url, {
          method,
          headers,
          body: ["GET", "DELETE", "HEAD", "OPTIONS"].includes(method) ? undefined : req.body,
        });

        const time = performance.now() - start;
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }

        if (!res.ok) {
          console.error(`❌ ${method} ${url} failed with status ${res.status}`);
          console.error("Error Response:", data);
          alert(`❌ Request failed: ${method} ${url}\nStatus: ${res.status}`);
          continue;
        }

        console.log("✅", method, url);
        console.log("Status:", res.status);
        console.log("Time:", `${time.toFixed(2)} ms`);
        console.log("Response:", data);
      } catch (err) {
        console.error("❌ Network error on", method, url);
        console.error(err);
        alert(`❌ Network error: ${method} ${url}`);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Integrations</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={addIntegration}
      >
        ➕ Add Integration
      </button>

      {integrations.length === 0 ? (
        <p className="text-gray-500">No integrations yet.</p>
      ) : (
        <div className="space-y-3">
          {integrations.map((int) => (
            <IntegrationCard
              key={int.id}
              integration={int}
              onRun={() => runIntegration(int)}
              onDelete={() => deleteIntegration(int.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

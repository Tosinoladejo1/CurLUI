import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Integration, RequestItem, RunResponse } from "../types/types";
import API from "../utility/api";
import { v4 as uuidv4 } from "uuid";

export default function IntegrationEditor() {
    const { id } = useParams(); // integrationId from URL
    const navigate = useNavigate();

    const [integration, setIntegration] = useState<Integration | null>(null);
    const [loading, setLoading] = useState(true);
    const [runResult, setRunResult] = useState<RunResponse[] | null>(null);


    // Load integration on mount
    useEffect(() => {
        if (!id) return;
        API.get(`/api/Integrations/${id}`)
            .then((res) => {
                setIntegration(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("❌ Failed to load integration", err);
                alert("Error loading integration.");
                setLoading(false);
            });
    }, [id]);

    const handleRunIntegration = async () => {
        if (!integration) return;

        try {
            // Optionally call a save method first to persist any unsaved changes
            await API.put(`/api/Integrations/${integration.integrationId}`, integration);

            const runtimeValues = {
                userId: "123", // or get from a prompt/input
                bearerToken: "demo-token"
            };

            const res = await API.post(`/api/Integrations/run/${integration.integrationId}`, runtimeValues);

            console.log("✅ Full integration run result:", res.data);

            // You can store this in state and display below the integration
            setRunResult(res.data);
        } catch (err: any) {
            console.error("❌ Failed to run integration", err);
            alert("Error running integration: " + err.message);
        }
    };


    // Add a new request to the integration
    const addRequest = async () => {
        if (!integration) return;

        const newReq: RequestItem = {
            id: uuidv4(),
            method: "GET",
            url: "https://jsonplaceholder.typicode.com/posts/1",
            headers: {},
            body: "",
            useBearerToken: false,
            placeholderSource: "",
            //integrationId: integration.integrationId,
        };

        try {
            await API.post(`/api/Integrations/${integration.integrationId}/requests`, newReq);
            const updated = await API.get(`/api/Integrations/${integration.integrationId}`);
            setIntegration(updated.data);
        } catch (err: any) {
            console.error("❌ Failed to add request:", {
                status: err.response?.status,
                message: err.message,
                data: err.response?.data,
                url: err.config?.url,
            });
            alert("Could not create request");
        }
    };

    
    const deleteRequest = async (reqId: string) => {
        if (!integration) return;

        try {
            await API.delete(`/api/Integrations/${integration.integrationId}/requests/${reqId}`);
            const updated = await API.get(`/api/Integrations/${integration.integrationId}`);
            setIntegration(updated.data);
        } catch (err) {
            console.error("❌ Failed to delete request", err);
            alert("Could not delete request");
        }
    };

    if (loading || !integration) return <div className="p-6">Loading integration...</div>;

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-blue-800">{integration.name}</h2>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Done
                </button>
            </div>

            <div className="mb-4">
                <button
                    onClick={addRequest}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    ➕ Add Request
                </button>
            </div>

            {integration.requests.length === 0 ? (
                <p className="text-gray-500">No requests yet. Click "Add Request" to get started.</p>
            ) : (
                <ul className="space-y-4">
                    {integration.requests.map((req) => (
                        <li key={req.id} className="p-4 border rounded bg-white shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-mono text-sm text-gray-800">
                                    {req.method} {req.url || "(no URL)"}
                                </span>
                                <div className="space-x-2">
                                    <button
                                        onClick={() =>
                                            navigate(`/integration/${integration.integrationId}/request/${req.id}`)
                                        }
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteRequest(req.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <button
                onClick={handleRunIntegration}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Save & Run Integration
            </button>
            {runResult && runResult.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Run Results</h2>
                    {runResult.map((res, idx) => (
                        <div key={idx} className="mb-4 p-4 bg-gray-100 border rounded">
                            <h3 className="text-lg font-semibold">Run #{idx + 1}</h3>
                            <p><strong>URL:</strong> {res.url}</p>
                            <p><strong>Status Code:</strong> {res.statusCode}</p>
                            <p><strong>Time:</strong> {res.durationMs} ms</p>
                            <p><strong>Response:</strong></p>
                            <pre className="bg-white text-sm p-2 mt-2 rounded overflow-x-auto">
                                {typeof res.response === "object"
                                    ? JSON.stringify(res.response, null, 2)
                                    : String(res.response)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}


        </div>
    );
}

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Integration, RequestItem } from "../types/types";
import API from "../utility/api";

// ✅ Define expected run result type
type RunResponse = {
    url: string;
    statusCode: number;
    durationMs: number;
    response: any;
    extracted?: Record<string, any>;
};

export default function RequestEditor() {
    const { id: integrationId, requestId } = useParams();
    const navigate = useNavigate();

    const [integration, setIntegration] = useState<Integration | null>(null);
    const [request, setRequest] = useState<RequestItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [headerText, setHeaderText] = useState<string>("{}");
    const [runResult, setRunResult] = useState<RunResponse[] | null>(null);

    useEffect(() => {
        if (!integrationId) return;

        API.get(`/api/Integrations/${integrationId}`)
            .then((res) => {
                setIntegration(res.data);
                const found = res.data.requests.find((r: RequestItem) => r.id === requestId);
                if (found) {
                    setRequest(found);
                    setHeaderText(JSON.stringify(found.headers ?? {}, null, 2));
                } else {
                    setError("Request not found");
                }
            })
            .catch((err) => {
                console.error("Failed to load integration", err);
                setError("Failed to load integration.");
            });
    }, [integrationId, requestId]);

    const updateField = (field: keyof RequestItem, value: any) => {
        if (!integration || !request) return;

        const updatedRequest = { ...request, [field]: value };
        const updatedRequests = integration.requests.map((r) =>
            r.id === request.id ? updatedRequest : r
        );
        setRequest(updatedRequest);
        setIntegration({ ...integration, requests: updatedRequests });
    };

    const saveRequest = async () => {
        if (!integrationId || !request) return;

        try {
            const parsedHeaders = headerText.trim() ? JSON.parse(headerText) : {};
            const updatedRequest = { ...request, headers: parsedHeaders };

            await API.put(`/api/Integrations/${integrationId}/requests/${request.id}`, updatedRequest);
            setRequest(updatedRequest);
        } catch (err) {
            console.error("❌ Failed to save request", err);
            alert("Failed to save request.");
        }
    };

    const runRequestManually = async () => {
        if (!request) return;

        const method = request.method;
        const url = request.url;
        const headers = request.headers ?? {};
        const body = request.body;

        const finalHeaders = {
            ...(headers as Record<string, string>),
        };

        if (request.useBearerToken) {
            finalHeaders["Authorization"] = `Bearer demo-token`;
        }

        const start = performance.now();
        let res: Response;
        let responseData: any;

        try {
            res = await fetch(url, {
                method,
                headers: finalHeaders,
                body: ["POST", "PUT"].includes(method) ? body : undefined,
            });

            const text = await res.text();

            try {
                responseData = JSON.parse(text);
            } catch {
                responseData = text;
            }

            const end = performance.now();

            setRunResult([
                {
                    url,
                    statusCode: res.status,
                    durationMs: Math.round(end - start),
                    response: responseData,
                },
            ]);

            const newRun: RunResponse = {
                url,
                statusCode: res.status,
                durationMs: Math.round(end - start),
                response: responseData,
            };

            setRunResult([newRun]);

            // ✅ Add to local request's history
            const updatedRunHistory = [...(request.runHistory ?? []), newRun];
            updateField("runHistory", updatedRunHistory);



            alert("✅ Request executed successfully!");
        } catch (err: any) {
            console.error("❌ Manual request failed", err);
            alert("Request failed: " + err.message);
        }
    };


    const handleSaveAndRun = async () => {
        if (!integrationId || !request) return;

        try {
            await saveRequest();

            const runtimeValues = {
                userId: "123",
                bearerToken: "demo-token"
            };

            //   const res = await API.post(
            //     `/api/Integrations/run/${integrationId}`,
            //     runtimeValues,
            //     { headers: { "Content-Type": "application/json" } }
            //   );
            await runRequestManually();


            //setRunResult(res.data);
            //console.log("✅ Run result:", res.data);
            alert("Integration executed successfully!");
        } catch (err: any) {
            console.error("❌ Failed to save or run integration", err);
            alert("Backend error: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
        }
    };

    const handleDone = async () => {
        await saveRequest();
        navigate(`/integration/${integrationId}`);
    };

    if (error) return <div className="p-4 text-red-600">{error}</div>;
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
                    value={headerText}
                    onChange={(e) => {
                        setHeaderText(e.target.value);
                        try {
                            const parsed = JSON.parse(e.target.value);
                            updateField("headers", parsed);
                        } catch {
                            // silently ignore invalid JSON
                        }
                    }}
                    className="w-full p-2 border rounded font-mono"
                    rows={4}
                />
            </div>

            <div>
                <label className="block font-medium">Body (JSON or text)</label>
                <textarea
                    value={request.body ?? ""}
                    onChange={(e) => updateField("body", e.target.value)}
                    className="w-full p-2 border rounded font-mono"
                    rows={4}
                />
            </div>

            <div>
                <label className="block font-medium">
                    <input
                        type="checkbox"
                        checked={request.useBearerToken ?? false}
                        onChange={(e) => updateField("useBearerToken", e.target.checked)}
                        className="mr-2"
                    />
                    Use Bearer Token
                </label>
            </div>

            <div className="pt-4 flex space-x-2">
                <button
                    onClick={handleDone}
                    className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                    Done
                </button>
                <button
                    onClick={handleSaveAndRun}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Save & Run
                </button>
            </div>

            {Array.isArray(runResult) &&
                runResult.map((r, i) => (
                    <div key={i} className="mt-6 p-4 bg-gray-100 rounded border border-gray-300">
                        <h3 className="text-lg font-semibold mb-2">Response #{i + 1}</h3>
                        <p><strong>URL:</strong> {r.url}</p>
                        <p><strong>Status:</strong> {r.statusCode}</p>
                        <p><strong>Time:</strong> {r.durationMs} ms</p>
                        {r.response && typeof r.response === "object" ? (
                            <pre className="bg-white text-sm p-2 mt-2 overflow-x-auto rounded">
                                {JSON.stringify(r.response, null, 2)}
                            </pre>
                        ) : (
                            <pre className="bg-yellow-100 text-sm p-2 mt-2 overflow-x-auto rounded">
                                Raw Response: {String(r.response)}
                            </pre>
                        )}
                        {r.extracted && (
                            <div className="mt-2">
                                <h4 className="font-semibold">Extracted Values:</h4>
                                <pre className="bg-white text-sm p-2 overflow-x-auto rounded">
                                    {JSON.stringify(r.extracted, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}

            {request.responsePreview && (
                <div className="mt-4 p-4 bg-gray-100 rounded border border-gray-300">
                    <h3 className="text-lg font-semibold mb-2">Response Preview</h3>
                    <pre className="bg-white text-sm p-2 overflow-x-auto">
                        {request.responsePreview}
                    </pre>
                </div>
            )}

            {(request.runHistory ?? []).length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-2">Previous Runs</h3>
                    {(request.runHistory ?? []).map((r, i) => (
                        <div key={i} className="mb-4 p-4 bg-white rounded border">
                            <p><strong>URL:</strong> {r.url}</p>
                            <p><strong>Status:</strong> {r.statusCode}</p>
                            <p><strong>Time:</strong> {r.durationMs} ms</p>
                            <pre className="bg-gray-100 text-sm p-2 mt-2 overflow-x-auto rounded">
                                {typeof r.response === "object"
                                    ? JSON.stringify(r.response, null, 2)
                                    : String(r.response)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

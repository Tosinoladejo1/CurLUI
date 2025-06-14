import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Integration } from "../types/types";
import IntegrationCard from "../components/IntegrationCard";
import API from "../utility/api";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [showInput, setShowInput] = useState(false);
    const [integrationName, setIntegrationName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        API.get("/api/Integrations")
            .then((res) => setIntegrations(res.data))
            .catch((err) => {
                console.error("Failed to load integrations", err);
                alert("Error loading integrations from server.");
            });
    }, []);

    const submitIntegration = async () => {
        if (!integrationName.trim()) return;

        try {
            const res = await API.post("/api/Integrations", {
                name: integrationName.trim(),
                requests: [],
            });
            const savedIntegration: Integration = res.data;

            setIntegrations([...integrations, savedIntegration]);
            setIntegrationName("");
            setShowInput(false);
            navigate(`/integration/${savedIntegration.integrationId}`);
        } catch (err) {
            console.error("Failed to create integration", err);
            alert("Could not save integration to server.");
        }
    };

    const deleteIntegration = async (integrationId: string) => {
        try {
            await API.delete(`/api/Integrations/${integrationId}`);
            setIntegrations((prev) => prev.filter((i) => i.integrationId !== integrationId));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete integration");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 px-6 py-10">
            <h1 className="text-5xl font-bold text-blue-400 text-center mb-10 tracking-wide">CurLUI</h1>

            <div className="flex flex-col items-center mb-8 space-y-3">
                {showInput ? (
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={integrationName}
                            onChange={(e) => setIntegrationName(e.target.value)}
                            placeholder="Enter integration name..."
                            className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none w-72"
                        />
                        <button
                            onClick={submitIntegration}
                            disabled={!integrationName.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => {
                                setShowInput(false);
                                setIntegrationName("");
                            }}
                            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowInput(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                    >
                        ➕ Add Integration
                    </button>
                )}
            </div>

            {integrations.length === 0 ? (
                <p className="text-center text-gray-400">No integrations yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {integrations.map((int) => (
                        <div
                            key={int.integrationId}
                            className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-blue-600/30 transition"
                        >
                            <h2 className="text-xl font-semibold text-blue-300 mb-2">
                                {int.name}
                            </h2>
                            <p className="text-sm text-gray-400 font-mono mb-4">
                                {int.requests?.length ?? 0} request(s)
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/integration/${int.integrationId}`)}
                                    className="px-4 py-1.5 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                                >
                                    ✏️ Edit
                                </button>

                                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium"
                                    onClick={() => deleteIntegration(int.integrationId)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

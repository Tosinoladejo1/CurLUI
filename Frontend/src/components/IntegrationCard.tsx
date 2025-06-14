import type { FC } from "react";
import type { Integration } from "../types/types";
import { useNavigate } from "react-router-dom";

interface Props {
  integration: Integration;
  onRun: () => void;
  onDelete?: () => void;
}

const IntegrationCard: FC<Props> = ({ integration, onRun, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="border p-4 rounded shadow-sm flex justify-between items-center hover:shadow-md transition-all">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{integration.name}</h3>
        <p className="text-sm text-gray-500">{integration.requests.length} request(s)</p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => navigate(`/integration/${integration.integrationId}`)}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
        >
          Edit
        </button>
        <button
          onClick={onRun}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
        >
          Run
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;

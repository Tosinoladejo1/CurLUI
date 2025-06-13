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
        <h3 className="text-lg font-medium">{integration.name}</h3>
        <p className="text-sm text-gray-500">{integration.requests.length} request(s)</p>
      </div>
      <div className="space-x-2">
        <button
          onClick={() => navigate(`/integration/${integration.id}`)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Edit
        </button>
        <button
          onClick={onRun}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Run
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;

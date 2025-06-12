import React from "react";
import { Integration } from "../types";

interface Props {
  integrations: Integration[];
  refresh: () => void;
}

const IntegrationList: React.FC<Props> = ({ integrations, refresh }) => {
  return (
    <div>
      {integrations.map((intg) => (
        <div key={intg.id} className="border p-3 rounded mb-2 shadow">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{intg.name}</h2>
              <p>{intg.requests.length} request(s)</p>
            </div>
            <div className="space-x-2">
              <button className="text-blue-600">Edit</button>
              <button className="text-red-600">Delete</button>
              <button className="text-green-600">Run</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntegrationList;

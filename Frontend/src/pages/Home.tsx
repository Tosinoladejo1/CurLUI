import React, { useEffect, useState } from "react";
import { getIntegrations } from "../utils/api";
import { Integration } from "../types";
import IntegrationList from "../components/IntegrationList";

const Home: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const fetchIntegrations = async () => {
    try {
      const res = await getIntegrations();
      setIntegrations(res.data);
    } catch (error) {
      console.error("Failed to fetch integrations", error);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">API Integrations</h1>
      <IntegrationList
        integrations={integrations}
        refresh={fetchIntegrations}
      />
    </div>
  );
};

export default Home;

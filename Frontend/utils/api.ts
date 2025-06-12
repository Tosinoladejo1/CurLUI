import axios from "axios";
import { Integration } from "../types";

const BASE_URL = "http://localhost:5000";

export const getIntegrations = () => axios.get(`${BASE_URL}/integrations`);
export const createIntegration = (data: Integration) => axios.post(`${BASE_URL}/integrations`, data);
export const updateIntegration = (id: string, data: Integration) => axios.put(`${BASE_URL}/integrations/${id}`, data);
export const deleteIntegration = (id: string) => axios.delete(`${BASE_URL}/integrations/${id}`);
export const runIntegration = (id: string, values: Record<string, string>) => axios.post(`${BASE_URL}/integrations/${id}/run`, values);

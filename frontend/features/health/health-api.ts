import { clientApi } from "@/lib/api/client-api";

export type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

export function getHealth() {
  return clientApi.get<HealthResponse>("/api/v1/health");
}

export function getDbHealth() {
  return clientApi.get<HealthResponse>("/api/v1/health/db");
}
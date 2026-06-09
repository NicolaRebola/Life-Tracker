"use client";

import { getDbHealth, getHealth, HealthResponse } from "@/features/health/health-api";
import { useState } from "react";

export default function ServiceChecker() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGetHealth() {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const response = await getHealth();
      setData(response);
    } catch {
      setError("No se pudo conectar con NestJS");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetDbHealth() {
    try {
      setLoading(true);
      setError(null);
      setData(null);
      
      const response = await getDbHealth();
      setData(response);
    } catch {
      setError("No se pudo conectar con la DB");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="m-5 rounded-md bg-primary-600 px-4 py-2 text-primary-text" onClick={handleGetHealth} disabled={loading}>
        Get Health
      </button>
      
      <button className="m-5 rounded-md bg-primary-100 px-4 py-2 text-primary-800" onClick={handleGetDbHealth} disabled={loading}>
        Get DB Health
      </button>

      <br />
      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
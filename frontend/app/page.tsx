import ServiceChecker from "@/components/atoms/ServiceChecker";
import { HealthResponse } from "@/features/health/health-api";

const getHealth = async () => {
  const response = await fetch(`${process.env.API_URL}/api/v1/health`);
  const data = await response.json() as HealthResponse;
  if (data.status === "ok") console.info("BE are connected");
  else console.error("BE are not connected");
}

export default async function Home() {
  getHealth();
  return (
    <div>
      <h1>Hello World</h1>
      <p>Testing API</p>
      <br />
      
      <ServiceChecker />      
    </div>
  );
}
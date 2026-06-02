import { NestApiClient } from "./nest-api-client";

export const serverApi = new NestApiClient(
  process.env.API_URL!,
);
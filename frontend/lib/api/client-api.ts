import { NestApiClient } from "./nest-api-client";

export const clientApi = new NestApiClient(
  process.env.NEXT_PUBLIC_API_URL!,
);
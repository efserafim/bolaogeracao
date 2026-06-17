import { FootballDataProvider } from "./football-data-provider";
import { MockProvider } from "./mock-provider";
import type { FootballProvider } from "./types";

export * from "./types";

export function getFootballProvider(): FootballProvider {
  const provider = (process.env.FOOTBALL_PROVIDER ?? "mock").toLowerCase();

  if (provider !== "mock") {
    const token = process.env.FOOTBALL_DATA_TOKEN;
    if (!token) {
      console.warn(
        "[football] FOOTBALL_DATA_TOKEN ausente — usando provider mock."
      );
      return new MockProvider();
    }
    return new FootballDataProvider(
      token,
      process.env.FOOTBALL_COMPETITION ?? "WC"
    );
  }

  return new MockProvider();
}

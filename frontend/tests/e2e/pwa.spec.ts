import { expect, test } from "@playwright/test";

test.describe("pwa assets", () => {
  test("serves manifest and service worker", async ({ request }) => {
    const manifestResponse = await request.get("/manifest.webmanifest");
    expect(manifestResponse.ok()).toBeTruthy();

    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe("Life Tracker");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/icon-192.png" }),
        expect.objectContaining({ src: "/icon-512.png" }),
      ]),
    );

    const serviceWorkerResponse = await request.get("/sw.js");
    expect(serviceWorkerResponse.ok()).toBeTruthy();
    expect(await serviceWorkerResponse.text()).toContain("life-tracker-v1");

    const offlineResponse = await request.get("/offline.html");
    expect(offlineResponse.ok()).toBeTruthy();
    expect(await offlineResponse.text()).toContain("You are offline");
  });
});

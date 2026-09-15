import { appBaseUrl } from "./stripe";

/**
 * Base URL Printful (and other external services) can HTTP-fetch.
 * Falls back to the app base; localhost must be overridden for local webhooks.
 */
export function filePublicBaseUrl(): string {
  return (
    process.env.FILE_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_FILE_BASE_URL ||
    appBaseUrl()
  ).replace(/\/$/, "");
}

function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  );
}

/**
 * Resolve relative design URLs and rewrite loopback hosts to FILE_PUBLIC_BASE_URL
 * so Printful receives a publicly reachable absolute http(s) URL.
 */
export function normalizePublicFileUrl(input: string): string {
  const raw = (input || "").trim();
  if (!raw) {
    throw new Error("A public design URL is required");
  }

  const appBase = appBaseUrl();
  const publicBase = filePublicBaseUrl();

  let url: URL;
  try {
    // Absolute stays absolute; relative resolves against the app base.
    url = new URL(raw, `${appBase}/`);
  } catch {
    throw new Error("Design file URL is not a valid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Design file URL must be http or https");
  }

  if (isLoopbackHost(url.hostname)) {
    let pub: URL;
    try {
      pub = new URL(publicBase);
    } catch {
      throw new Error(
        "FILE_PUBLIC_BASE_URL is not a valid URL. Set it to a public host (e.g. https://shop.bluemoundlab.com).",
      );
    }

    if (isLoopbackHost(pub.hostname)) {
      throw new Error(
        "Printful cannot fetch localhost. Set FILE_PUBLIC_BASE_URL to a public URL such as https://shop.bluemoundlab.com (studio marks are already deployed there).",
      );
    }

    url.protocol = pub.protocol;
    url.hostname = pub.hostname;
    url.port = pub.port; // clear :3000 when public base has no port
  }

  return url.toString();
}

export async function getJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText} ${body}`.trim());
  }

  return response.json();
}


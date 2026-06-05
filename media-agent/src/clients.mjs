import { getJson } from "./http.mjs";

export class TautulliClient {
  constructor(config) {
    this.url = config.url;
    this.apiKey = config.apiKey;
  }

  async call(cmd, params = {}) {
    const search = new URLSearchParams({
      apikey: this.apiKey,
      cmd,
      ...params
    });
    const result = await getJson(`${this.url}/api/v2?${search.toString()}`);
    if (result.response?.result !== "success") {
      throw new Error(`Tautulli ${cmd} failed: ${JSON.stringify(result.response)}`);
    }
    return result.response.data;
  }

  async libraries() {
    return this.call("get_libraries");
  }

  async history(length = 50) {
    return this.call("get_history", { length: String(length) });
  }

  async homeStats() {
    return this.call("get_home_stats", { grouping: "1" });
  }
}

export class ArrClient {
  constructor(config, apiVersion = "v3") {
    this.url = config.url;
    this.apiKey = config.apiKey;
    this.apiVersion = apiVersion;
  }

  async get(path) {
    return getJson(`${this.url}/api/${this.apiVersion}/${path.replace(/^\/+/, "")}`, {
      headers: { "X-Api-Key": this.apiKey }
    });
  }

  async status() {
    return this.get("system/status");
  }
}


const required = [
  "TAUTULLI_URL",
  "TAUTULLI_API_KEY",
  "RADARR_URL",
  "RADARR_API_KEY",
  "SONARR_URL",
  "SONARR_API_KEY"
];

export function getConfig() {
  const config = {
    tautulli: {
      url: cleanUrl(process.env.TAUTULLI_URL),
      apiKey: process.env.TAUTULLI_API_KEY
    },
    radarr: {
      url: cleanUrl(process.env.RADARR_URL),
      apiKey: process.env.RADARR_API_KEY
    },
    sonarr: {
      url: cleanUrl(process.env.SONARR_URL),
      apiKey: process.env.SONARR_API_KEY
    },
    seerr: {
      url: cleanUrl(process.env.SEERR_URL),
      apiKey: process.env.SEERR_API_KEY
    },
    tmdb: {
      apiKey: process.env.TMDB_API_KEY
    }
  };

  return config;
}

export function missingRequiredEnv() {
  return required.filter((key) => !process.env[key]);
}

function cleanUrl(value) {
  return value ? value.replace(/\/+$/, "") : "";
}


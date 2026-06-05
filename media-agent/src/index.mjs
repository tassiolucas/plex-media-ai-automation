import { getConfig, missingRequiredEnv } from "./config.mjs";
import { ArrClient, TautulliClient } from "./clients.mjs";

const command = process.argv[2] ?? "help";
const config = getConfig();

async function main() {
  if (command === "help") {
    printHelp();
    return;
  }

  const missing = missingRequiredEnv();
  if (missing.length) {
    console.error("Variaveis obrigatorias ausentes:");
    for (const key of missing) console.error(`- ${key}`);
    process.exitCode = 1;
    return;
  }

  const tautulli = new TautulliClient(config.tautulli);
  const radarr = new ArrClient(config.radarr);
  const sonarr = new ArrClient(config.sonarr);

  if (command === "check") {
    await check({ tautulli, radarr, sonarr });
    return;
  }

  if (command === "snapshot") {
    await snapshot({ tautulli, radarr, sonarr });
    return;
  }

  if (command === "recommend") {
    await recommend({ tautulli, radarr, sonarr });
    return;
  }

  printHelp();
  process.exitCode = 1;
}

async function check({ tautulli, radarr, sonarr }) {
  const [libraries, radarrStatus, sonarrStatus] = await Promise.all([
    tautulli.libraries(),
    radarr.status(),
    sonarr.status()
  ]);

  console.log(JSON.stringify({
    ok: true,
    tautulliLibraries: libraries.map((item) => item.section_name),
    radarr: `${radarrStatus.appName} ${radarrStatus.version}`,
    sonarr: `${sonarrStatus.appName} ${sonarrStatus.version}`
  }, null, 2));
}

async function snapshot({ tautulli, radarr, sonarr }) {
  const [libraries, history, homeStats, movies, series] = await Promise.all([
    tautulli.libraries(),
    tautulli.history(50),
    tautulli.homeStats(),
    radarr.get("movie"),
    sonarr.get("series")
  ]);

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    libraries: libraries.map((item) => ({
      name: item.section_name,
      type: item.section_type,
      count: Number(item.count ?? 0)
    })),
    recentHistory: history.data?.map((item) => ({
      title: item.full_title || item.title,
      mediaType: item.media_type,
      user: item.user,
      watchedAt: item.date,
      percentComplete: item.percent_complete
    })) ?? [],
    homeStats,
    libraryCounts: {
      movies: movies.length,
      series: series.length
    }
  }, null, 2));
}

async function recommend({ tautulli, radarr, sonarr }) {
  const [history, movies, series] = await Promise.all([
    tautulli.history(100),
    radarr.get("movie"),
    sonarr.get("series")
  ]);

  const watched = history.data ?? [];
  const recentTitles = watched
    .map((item) => item.grandparent_title || item.full_title || item.title)
    .filter(Boolean)
    .slice(0, 20);

  const context = {
    currentLibrary: {
      movies: movies.map((item) => item.title).slice(0, 30),
      series: series.map((item) => item.title).slice(0, 30)
    },
    recentSignals: recentTitles,
    recommendationMode: "manual-approval"
  };

  console.log(JSON.stringify({
    message: "MVP pronto para recomendacao. Proxima etapa: plugar TMDb/OpenAI e gerar candidatos reais.",
    context
  }, null, 2));
}

function printHelp() {
  console.log(`Uso:
  node src/index.mjs check
  node src/index.mjs snapshot
  node src/index.mjs recommend`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


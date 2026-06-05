# Media Agent

MVP do agente de recomendacao para o stack Plex.

## Objetivo

Ler sinais do Plex/Tautulli, biblioteca do Radarr/Sonarr e pedidos do Seerr para montar um contexto de gosto. Nesta fase ele apenas gera um snapshot e recomendacoes preliminares; nao baixa conteudo automaticamente.

## Configuracao

Na instalação atual, os secrets são cadastrados no AICliAgents e injetados na
sessão usada pelo Codex. Não grave chaves reais no repositório. O arquivo
`.env.example` existe somente como referência dos nomes necessários.

Consulte [`../docs/AGENTE_IA.md`](../docs/AGENTE_IA.md) para a rotina semanal e
os controles de segurança.

## Comandos

```bash
npm run check
npm run snapshot
npm run recommend
```

## Proximas fases

- Persistir memoria em SQLite.
- Integrar TMDb para enriquecer generos, elencos e similares.
- Criar fila de recomendacoes aprovaveis.
- Enviar pedidos aprovados para Seerr/Radarr/Sonarr.

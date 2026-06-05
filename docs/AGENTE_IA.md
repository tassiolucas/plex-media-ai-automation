# Agente de IA e rotina semanal

O agente usa o AICliAgents/Codex existente no servidor. Ele não substitui o
Seerr, Radarr ou Sonarr: consulta contexto, atualiza uma memória persistente,
explica recomendações e cria pedidos por API somente quando as regras permitem.

## Diretório persistente

```text
/mnt/user/appdata/media-agent/
├── AGENTS.md
├── AUTOMATION_PROMPT.md
├── automation.log
└── profile.json
```

`profile.json` deve registrar preferências, rejeições, conteúdos vistos,
recomendações, solicitações e contadores semanais. Não publique o arquivo real;
ele contém hábitos pessoais.

## Evolução recomendada

1. **Recomendação somente:** o agente apenas sugere.
2. **Aprovação humana:** o agente prepara o pedido e aguarda confirmação.
3. **Automação limitada:** até três pedidos semanais de alta compatibilidade.

Começar diretamente com pedidos irrestritos aumenta o risco de downloads
indesejados, consumo excessivo de disco e recomendações repetitivas.

## Regras do agente

Exemplo sanitizado de `AGENTS.md`:

```md
# Media Agent

Você é um agente pessoal de recomendação de filmes e séries.

## Regras
- Antes de recomendar, verifique se o conteúdo já existe ou foi visto.
- Use Tautulli, biblioteca e memória persistente como contexto.
- Explique brevemente cada recomendação.
- Não solicite novamente itens rejeitados.
- Registre recomendações, solicitações e justificativas.
- Em execução interativa, solicite conteúdo apenas com aprovação explícita.
- Em automação, respeite o limite semanal e solicite apenas itens de alta compatibilidade.
```

Exemplo de `AUTOMATION_PROMPT.md`:

```md
Analise o histórico do Tautulli, a biblioteca atual e a memória persistente.
Atualize o perfil de preferências.
Recomende até 3 conteúdos ainda não vistos ou existentes.
Solicite automaticamente somente conteúdos com alta compatibilidade.
Use os perfis de qualidade configurados.
Não solicite novamente itens rejeitados.
Não exceda 3 solicitações por semana.
Registre todas as decisões e justificativas.
```

## Secrets

Cadastre no AICliAgents, sem gravar em `.env` no repositório:

```text
TAUTULLI_URL
TAUTULLI_API_KEY
RADARR_URL
RADARR_API_KEY
SONARR_URL
SONARR_API_KEY
SEERR_URL
SEERR_API_KEY
TMDB_API_KEY
```

As URLs e chaves devem estar disponíveis na sessão usada pela rotina. Restrinja
o acesso ao servidor porque secrets injetados em processos podem aparecer em
arquivos temporários ou diagnósticos.

## User Script do Unraid

Crie um script chamado `media_agent_weekly` no plugin User Scripts:

```bash
#!/bin/bash

LOG=/mnt/user/appdata/media-agent/automation.log
LOCK=/tmp/media-agent-weekly.lock
NATIVE_CODEX=/usr/local/emhttp/plugins/unraid-aicliagents/agents/codex-cli/node_modules/@openai/codex-linux-x64/vendor/x86_64-unknown-linux-musl/bin/codex

exec 9>"$LOCK"
if ! flock -n 9; then
  echo "[$(date -Iseconds)] Execução ignorada: outra rotina está ativa." >> "$LOG"
  exit 0
fi

ENV_SOURCE="$(grep -l '^export TAUTULLI_API_KEY=' /tmp/unraid-aicliagents/work/root/aicli-run-*.sh 2>/dev/null | head -n 1)"
if [ -z "$ENV_SOURCE" ]; then
  echo "[$(date -Iseconds)] Sessão AICliAgents com secrets não encontrada." >> "$LOG"
  exit 1
fi

source <(grep -E '^export (HOME|TAUTULLI_URL|TAUTULLI_API_KEY|RADARR_URL|RADARR_API_KEY|SONARR_URL|SONARR_API_KEY|SEERR_URL|SEERR_API_KEY|TMDB_API_KEY)=' "$ENV_SOURCE")

cd /mnt/user/appdata/media-agent || exit 1

echo "[$(date -Iseconds)] Início da rotina semanal." >> "$LOG"
timeout 45m "$NATIVE_CODEX" exec \
  --sandbox danger-full-access \
  --skip-git-repo-check \
  -C /mnt/user/appdata/media-agent \
  "$(cat AUTOMATION_PROMPT.md)" \
  </dev/null >> "$LOG" 2>&1
STATUS=$?
echo "[$(date -Iseconds)] Fim da rotina semanal. Status: $STATUS" >> "$LOG"
exit "$STATUS"
```

Pontos importantes:

- O binário nativo evita travamentos observados com o wrapper em execução cron.
- `</dev/null` impede que o Codex espere entrada interativa.
- `flock` impede duas execuções simultâneas.
- `timeout 45m` limita uma execução que fique presa.
- A opção `--ask-for-approval` não é aceita pela versão testada do
  `codex exec`.
- A sessão AICliAgents que contém os secrets precisa existir.

## Agendamento

Domingo às 10:00:

```cron
0 10 * * 0
```

## Teste manual

Execute o User Script pelo painel do Unraid e acompanhe:

```bash
tail -f /mnt/user/appdata/media-agent/automation.log
```

Uma execução saudável deve registrar início, decisões do agente e fim com
`Status: 0`. Antes de habilitar o cron, teste também um ciclo completo sem
pedidos automáticos.

## Controles obrigatórios

- Limite semanal confiável e persistente.
- Verificação de duplicados no Plex, Radarr, Sonarr e memória.
- Lista de itens rejeitados.
- Limite de tamanho e perfil de qualidade.
- Espaço mínimo livre em disco.
- Log de todas as decisões.
- Modo de emergência para desativar pedidos automáticos.


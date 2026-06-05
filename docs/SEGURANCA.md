# Segurança

## Regras para um repositório público

Nunca publique:

- API Keys do Radarr, Sonarr, Prowlarr, Seerr ou Tautulli.
- Token do Plex.
- Senhas do qBittorrent.
- Cookies e arquivos de sessão.
- `profile.json` real do agente.
- Logs completos sem revisão.
- Endereço IP público ou configuração do roteador.

Use variáveis e exemplos:

```text
http://${SERVER_IP}:7878
RADARR_API_KEY=<secret>
```

O `.gitignore` deve cobrir `.env`, `*.env`, logs e arquivos pessoais. Uma
`.env.example` pode listar somente os nomes das variáveis.

## Exposição de rede

- Exponha para a internet apenas o que for realmente necessário.
- Para Plex remoto, encaminhe apenas TCP `32400`.
- Acesse painéis administrativos por LAN, VPN ou proxy reverso autenticado.
- Não encaminhe diretamente portas do qBittorrent, Radarr, Sonarr, Prowlarr,
  Seerr ou Tautulli.
- Use senhas únicas e autenticação habilitada.

## Agente

O agente tem capacidade de acionar APIs e iniciar solicitações. Trate-o como
automação privilegiada:

- Comece sem pedidos automáticos.
- Aplique limite semanal.
- Registre justificativas.
- Restrinja os secrets ao processo necessário.
- Revogue e troque qualquer chave que apareça em log ou commit.
- Revise periodicamente `automation.log` e a fila do Seerr.

## Conteúdo

Configure somente fontes e conteúdos que possam ser acessados legalmente. A
documentação pública não deve incluir fontes específicas nem instruções para
contornar direitos autorais.


# Solução de problemas

## Plex não encontra mídia

1. Confirme que o arquivo final está em `/mnt/user/MediaServer/filmes` ou
   `/mnt/user/MediaServer/series`.
2. Confirme que o Plex monta `/mnt/user/MediaServer:/data`.
3. Confirme que a biblioteca usa `/data/filmes` ou `/data/series`.
4. Execute `Scan Library Files`.
5. Verifique nome, tipo de biblioteca e permissões.

`/transcode` não é uma pasta de downloads. É armazenamento temporário do Plex.

## Radarr: root folder não gravável

Erro típico:

```text
Folder '/mnt/movies/' is not writable by user 'radarr'
```

Confirme o volume Docker e ajuste propriedade/permissões no host para o UID/GID
usado pelo container. No Unraid, uma combinação comum é `nobody:users` com
permissão `775`.

## Sonarr baixa, mas a série não aparece

- Confirme Root Folder `/tv`.
- Confirme que `/tv` aponta para `/mnt/user/MediaServer/series`.
- Confirme a categoria `sonarr` no qBittorrent.
- Verifique a fila e o histórico de importação do Sonarr.
- Atualize a biblioteca de Programas de TV do Plex.

Filmes pertencem ao Radarr. Séries pertencem ao Sonarr.

## Episódios antigos não são encontrados

Abra uma busca interativa e verifique os motivos de rejeição. Se não houver
1080p, use um perfil que aceite 720p e 1080p e defina o cutoff desejado.

## qBittorrent retorna Unauthorized

- Teste as credenciais na Web UI.
- Atualize usuário e senha nas entradas do Radarr e Sonarr.
- Verifique bloqueios temporários de IP após tentativas inválidas.
- Confira configurações de validação de Host Header e sub-redes permitidas.
- Não reutilize uma senha antiga em apenas um dos aplicativos.

## Remote Path Mapping

Evite-o quando todos os containers estão no mesmo servidor. Use o mesmo caminho
interno `/downloads` no qBittorrent, Radarr e Sonarr. Remote Path Mapping é
necessário principalmente quando o cliente e o gerenciador enxergam nomes
diferentes para o mesmo armazenamento.

## Prowlarr não sincroniza

- Teste Radarr e Sonarr em `Settings > Apps`.
- Confira URL e API Key.
- Use `Full Sync`.
- Verifique se a fonte é compatível com as categorias de filmes e séries.

## Plex remoto não conecta

- Confirme TCP `32400` encaminhada para o IP fixo do servidor.
- Confirme a porta pública manual no Plex.
- Teste usando dados móveis.
- Se não funcionar, investigue firewall, duplo NAT ou CGNAT.

## User Script do agente falha

### `.env: No such file or directory`

A rotina documentada não usa `.env`; ela lê os secrets da sessão AICliAgents.
Remova referências antigas a `/mnt/user/appdata/media-agent/.env`.

### `cd: /mnt/user/media-agent: No such file or directory`

Use o diretório persistente correto:

```text
/mnt/user/appdata/media-agent
```

### `unexpected argument '--ask-for-approval'`

Remova essa opção. Ela não é aceita pelo `codex exec` da versão testada.

### A execução parece travada

- Use o binário nativo do Codex.
- Redirecione stdin com `</dev/null`.
- Mantenha `timeout 45m`.
- Confira se existe uma sessão AICliAgents com os secrets.
- Leia `/mnt/user/appdata/media-agent/automation.log`.

O aviso sobre não criar helper binaries sob `/tmp` pode ser não fatal; confirme
pelo status final e pelas ações registradas.


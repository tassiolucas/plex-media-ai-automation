# Configuração detalhada

Este guia registra as decisões que fizeram a esteira funcionar e pode ser usado
como checklist para recriá-la.

## 1. Pastas e permissões

Crie as pastas:

```bash
mkdir -p /mnt/user/MediaServer/{downloads/complete,downloads/incomplete,filmes,series,videos}
```

No Unraid, containers LinuxServer normalmente usam `PUID=99` e `PGID=100`.
Garanta que os usuários dos containers tenham escrita nas pastas:

```bash
chown -R nobody:users /mnt/user/MediaServer
chmod -R 775 /mnt/user/MediaServer
```

Não aplique permissões amplas sem necessidade. Em instalações com usuários
personalizados, ajuste UID/GID conforme o container.

## 2. Volumes Docker

O download deve ter o mesmo caminho interno no qBittorrent, Radarr e Sonarr:
`/downloads`. Isso evita movimentações lentas, cópias extras e a necessidade de
`Remote Path Mapping`.

| Serviço | Volume de mídia | Volume de configuração |
|---|---|---|
| Plex | `/mnt/user/MediaServer:/data` | `/mnt/user/appdata/media-plex-server:/config` |
| qBittorrent | `/mnt/user/MediaServer/downloads:/downloads` | `/mnt/user/appdata/media-qbittorrent-server:/config` |
| Radarr | `/mnt/user/MediaServer/filmes:/mnt/movies` e downloads | `/mnt/cache/appdata/media-radarr-server:/radarr` |
| Sonarr | `/mnt/user/MediaServer/series:/tv` e downloads | `/mnt/user/appdata/media-sonarr-server:/config` |
| Prowlarr | nenhum | `/mnt/user/appdata/media-prowlarr-server:/config` |
| Seerr | nenhum | `/mnt/user/appdata/media-seerr-server:/app/config` |
| Tautulli | nenhum | `/mnt/user/appdata/media-tautulli-server:/config` |

## 3. qBittorrent

Em `Tools > Options > Downloads`:

```text
Default Save Path: /downloads/complete
Keep incomplete torrents in: /downloads/incomplete
```

Crie credenciais próprias em `Web UI`. Radarr e Sonarr devem usar as mesmas
credenciais válidas e categorias diferentes:

```text
Radarr category: radarr
Sonarr category: sonarr
```

Cada aplicativo precisa de sua própria entrada de cliente de download, mesmo
quando ambos usam o mesmo qBittorrent.

## 4. Radarr

Em `Settings > Media Management`:

```text
Root Folder: /mnt/movies
```

![Gerenciamento de mídia do Radarr](assets/radarr-media-management.png)

Em `Settings > Download Clients`, adicione qBittorrent e teste:

```text
Host: endereço alcançável pelo Radarr
Port: 8080 dentro da rede Docker, ou 8081 pela porta publicada no host
Category: radarr
```

Evite depender de IPs internos como `172.17.x.x`, pois podem mudar quando o
container reinicia. Prefira uma rede Docker definida pelo usuário com resolução
por nome, ou a porta publicada do host.

Em `Settings > Import Lists`, a Plex Watchlist pode ser configurada com:

```text
Enable: on
Enable Automatic Add: on
Monitor: Movie Only
Search on Add: on
Minimum Availability: Released
Quality Profile: HD - 720p/1080p
Root Folder: /mnt/movies
```

## 5. Sonarr

Em `Settings > Media Management`:

```text
Root Folder: /tv
Season Folder Format: Season {season}
```

![Gerenciamento de mídia do Sonarr](assets/sonarr-media-management.png)

Em `Settings > Download Clients`, configure uma entrada qBittorrent com:

```text
Category: sonarr
```

Use um perfil que aceite 720p e 1080p quando episódios antigos não estiverem
disponíveis na qualidade preferencial. Uma busca interativa mostra por que cada
resultado foi aceito ou rejeitado.

## 6. Prowlarr

Em `Settings > Apps`, cadastre Radarr e Sonarr usando a API Key de cada serviço.
Use `Full Sync` para manter a configuração centralizada.

Não publique chaves de API, cookies ou uma lista real de fontes. Para um
repositório público, documente apenas que as fontes devem ser autorizadas.

## 7. Seerr

Conecte Plex, Radarr e Sonarr. Para cada serviço, use o caminho que ele enxerga:

```text
Radarr Root Folder: /mnt/movies
Sonarr Root Folder: /tv
```

Configuração inicial recomendada:

```text
Default Server: on
Enable Scan: on
Enable Automatic Search: on
Tags: vazio
Override Rules: vazio
```

Override Rules só são necessárias quando pedidos específicos devem alterar
Root Folder, Quality Profile ou Tags conforme usuário, gênero, idioma ou
palavra-chave.

## 8. Plex

No Plex, use os caminhos internos:

```text
Filmes: /data/filmes
Programas de TV: /data/series
Outros vídeos: /data/videos
```

Depois de uma importação, execute `Scan Library Files`. Se o arquivo estiver na
pasta correta mas não aparecer, verifique o tipo da biblioteca, o padrão do nome
e as permissões.

Para acesso remoto, encaminhe apenas TCP `32400` para o servidor Plex e confirme
no Plex que o servidor está totalmente acessível fora da rede. Não encaminhe
Radarr, Sonarr, Prowlarr, qBittorrent ou Tautulli diretamente para a internet.

## 9. Teste ponta a ponta

1. Solicite um item de teste no Seerr.
2. Confirme que ele aparece no Radarr ou Sonarr.
3. Confirme que uma fonte autorizada foi encontrada via Prowlarr.
4. Confirme que o qBittorrent usa a categoria correta.
5. Confirme o término em `/downloads/complete`.
6. Confirme a importação em `/mnt/movies` ou `/tv`.
7. Confirme o arquivo real em `filmes/` ou `series/` no host.
8. Atualize a biblioteca Plex e reproduza alguns minutos.
9. Confirme o registro no Tautulli.


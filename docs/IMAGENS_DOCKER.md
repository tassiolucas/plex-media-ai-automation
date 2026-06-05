# Imagens Docker utilizadas

Esta página registra as imagens exatas utilizadas na instalação documentada.
No Unraid Community Applications, pesquise pelo nome do aplicativo ou cole a
referência da imagem no campo `Repository`.

> Uma imagem oficial do aplicativo e uma imagem comunitária que empacota o
> aplicativo são coisas diferentes. Antes de trocar de mantenedor, faça backup
> do `appdata` e confira caminhos internos, UID/GID e instruções de migração.

## Referência rápida

| Serviço | Imagem utilizada | Manutenção | Imagem e documentação |
|---|---|---|---|
| Plex | `plexinc/pms-docker` | Oficial Plex | [Docker Hub](https://hub.docker.com/r/plexinc/pms-docker) |
| qBittorrent | `lscr.io/linuxserver/qbittorrent` | LinuxServer.io | [Documentação da imagem](https://docs.linuxserver.io/images/docker-qbittorrent/) |
| Radarr | `ghcr.io/ich777/radarr` | Comunitária, ich777 | [Imagem ich777/radarr](https://hub.docker.com/r/ich777/radarr) |
| Sonarr | `lscr.io/linuxserver/sonarr` | LinuxServer.io | [Documentação da imagem](https://docs.linuxserver.io/images/docker-sonarr/) |
| Prowlarr | `bitlessbyte/prowlarr` | Comunitária, bitlessbyte | [Docker Hub](https://hub.docker.com/r/bitlessbyte/prowlarr) |
| Seerr | `ghcr.io/seerr-team/seerr:latest` | Oficial Seerr | [Instalação Docker](https://docs.seerr.dev/getting-started/docker/) · [Código-fonte](https://github.com/seerr-team/seerr) |
| Tautulli | `tautulli/tautulli` | Oficial Tautulli | [Docker Hub](https://hub.docker.com/r/tautulli/tautulli/) · [Código-fonte](https://github.com/Tautulli/Tautulli) |

## Comandos de pull

```bash
docker pull plexinc/pms-docker
docker pull lscr.io/linuxserver/qbittorrent
docker pull ghcr.io/ich777/radarr
docker pull lscr.io/linuxserver/sonarr
docker pull bitlessbyte/prowlarr
docker pull ghcr.io/seerr-team/seerr:latest
docker pull tautulli/tautulli
```

Esses comandos usam a tag padrão ou `latest`. Isso é conveniente, mas não
garante que uma reinstalação futura receba exatamente o mesmo build.

## Conferindo a instalação real

Liste as imagens configuradas nos containers:

```bash
docker inspect \
  media-plex-server \
  media-qbittorrent-server \
  media-radarr-server \
  media-sonarr-server \
  media-prowlarr-server \
  media-seerr-server \
  media-tautulli-server \
  --format '{{.Name}} -> {{.Config.Image}}'
```

Confira o digest imutável de uma imagem já baixada:

```bash
docker image inspect plexinc/pms-docker \
  --format '{{json .RepoDigests}}'
```

Para máxima reprodutibilidade, substitua uma tag móvel por uma versão específica
ou por `imagem@sha256:digest`. Atualizações deixam de acontecer automaticamente
quando um digest é fixado, então essa decisão exige manutenção consciente.

## Observações por imagem

### Plex

A instalação usa a imagem oficial `plexinc/pms-docker` com rede `host`. Os
volumes importantes são `/config`, `/transcode` e `/data`.

### qBittorrent e Sonarr

As duas imagens são mantidas pela LinuxServer.io. Elas oferecem as variáveis
`PUID`, `PGID` e `TZ`, que precisam combinar com as permissões dos diretórios no
host.

### Radarr e Prowlarr

Esta instalação usa imagens comunitárias de `ich777` e `bitlessbyte`.
Elas estão funcionando na esteira documentada, mas podem usar caminhos internos
diferentes de imagens LinuxServer ou de outros mantenedores. Não troque apenas o
nome da imagem sem revisar os volumes.

### Seerr

A imagem oficial fica no GitHub Container Registry. O projeto também publica
orientações para verificar assinatura e procedência dos artefatos:

- [Verificação de artefatos assinados](https://docs.seerr.dev/using-seerr/advanced/verifying-signed-artifacts)

### Tautulli

`tautulli/tautulli` é a imagem oficial usada nesta instalação. O diretório
persistente de configuração é montado em `/config`.

## Atualizações

Antes de atualizar:

1. Faça backup dos diretórios de configuração em `/mnt/user/appdata`.
2. Leia as notas de versão e instruções do mantenedor.
3. Atualize um serviço por vez.
4. Teste a comunicação com os demais serviços.
5. Confirme caminhos, permissões e importação de mídia.

Evite atualizações automáticas e simultâneas de toda a esteira. Uma mudança de
imagem, versão ou caminho interno pode interromper o fluxo sem apagar os
arquivos de mídia.


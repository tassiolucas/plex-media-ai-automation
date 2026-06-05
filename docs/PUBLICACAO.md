# Checklist de publicação

Antes de tornar o repositório público:

1. Revise `git status` e publique somente arquivos relacionados à esteira.
2. Execute uma busca por chaves, tokens, senhas, IP público e cookies.
3. Confirme que `.env`, logs e `profile.json` estão ignorados.
4. Abra todas as imagens e confirme que não exibem segredos ou informações
   pessoais indesejadas.
5. Troque qualquer chave que já tenha aparecido em terminal, log ou commit.
6. Não publique a lista real de fontes configuradas no Prowlarr.
7. Confirme que exemplos usam `${SERVER_IP}`.
8. Adicione uma licença apropriada antes de aceitar contribuições externas.

Comandos úteis:

```bash
git status --short
git diff --cached
git grep -n -i -E 'api.?key|token|password|secret'
```

Arquivos recomendados para a primeira publicação:

```text
README.md
docs/
scripts/capture-media-docs.cjs
media-agent/
.gitignore
```

Arquivos de outros experimentos locais devem permanecer fora desse repositório
ou fora do primeiro commit.

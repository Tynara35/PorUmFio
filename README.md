# Fio da Bomba

Jogo local em equipes, instalável como PWA e pronto para GitHub Pages.

## Como funciona

- 3 bombas pretas com 4 fios e valor de 1 ponto.
- 3 bombas prateadas com 7 fios e valor de 2 pontos.
- 1 bomba dourada com 10 fios e valor de 3 pontos.
- Cada alternativa corresponde a um fio colorido que sai do topo da bomba.
- A equipe corta os fios das respostas erradas até restar apenas o fio correto.
- Cortar o fio da resposta correta ou deixar o tempo acabar causa a explosão.
- O cronômetro pode ser escolhido separadamente para as bombas pretas, prateadas e dourada.
- Banco local com cadastro, exclusão, importação e exportação JSON.
- Importação compatível com os formatos nativo, Boom (`p/a/c`) e Acerte ou Caia (`q/options/correct`).

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

## Produção

```bash
pnpm build
```

O workflow em `.github/workflows/deploy.yml` publica automaticamente no GitHub Pages. O endereço-base está configurado para o repositório `PorUmFio`.

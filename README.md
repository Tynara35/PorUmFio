# Fio da Bomba

Jogo local em equipes, instalável como PWA e pronto para GitHub Pages.

## Como funciona

- 3 bombas pretas com 4 fios, 3 bombas prateadas com 7 fios e 1 bomba dourada com 10 fios.
- A partida sempre percorre as sete bombas, mesmo quando uma delas explode.
- Cada alternativa corresponde a um fio colorido que sai do topo da bomba.
- Cada fio é cortado por uma equipe diferente; a vez gira depois de todo corte.
- As equipes cortam as respostas erradas até restar apenas o fio correto.
- Cortar o fio da resposta correta ou deixar o tempo acabar causa a explosão.
- O cronômetro pode ser escolhido separadamente para as bombas pretas, prateadas e dourada.
- A pontuação também pode ser definida separadamente para cada conjunto de bombas.
- As perguntas podem ser sorteadas ou escolhidas manualmente para cada uma das sete bombas.
- Música de suspense contínua e efeitos sonoros acompanham a partida.
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

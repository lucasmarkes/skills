# pretty-icons: contexto para retomar

Escrito em 2026-10-12, a partir das sessões do Claude Code (ver "Sessões") e do estado do repositório. Se algo aqui divergir do código, o código vale.

## O que é

Uma skill (`/pretty-icons`) que desenha um conjunto de ícones SVG para um app, em dois acabamentos: **duotone** (16, 20, 24...) e **filled** (48). Ela tem passos fixos, medidas (`check.mjs`), leituras cegas por um leitor novo, leitura de conjunto e leitura de acabamento, e uma folha visual (`sheet.mjs`).

## Onde vive

| Coisa | Caminho |
| --- | --- |
| Código da skill | `skills/pretty-icons/` (`SKILL.md`, `check.mjs`, `sheet.mjs`, `rules.md`, `rules-filled.md`, `read.md`, `examples/`...) |
| Branch com a versão atual | `pretty-icons-polish` (90 commits à frente de `main`; **sem merge, sem push, sem PR**) |
| Branch mais antiga | `pretty-icons` |
| Referência do polish | `docs/superpowers/baselines/2026-10-11-pretty-icons-polish-reference.md` (inclui "The trial") |
| Spec e plano do polish | `docs/superpowers/specs/2026-10-11-pretty-icons-polish-design.md` e `docs/superpowers/plans/2026-10-11-pretty-icons-polish.md` |
| Instalação | `~/.claude/skills/pretty-icons` é um **link** para `~/estudos/skills/skills/pretty-icons` |
| Pasta de testes | `~/estudos/teste-pretty-icons/` (`PROMPTS.md`, `sidebar/`, `cozinha/`) |

**Cuidado com o link:** como a instalação aponta para a pasta do repositório, a versão que `/pretty-icons` carrega depende do branch em que `~/estudos/skills` está. Em `pretty-icons-polish` carrega a versão nova. Em `penumbra` ou `main` a pasta `skills/pretty-icons/` não existe e o link fica quebrado. Antes de testar: `git switch pretty-icons-polish` em `~/estudos/skills` (ou use o worktree `.claude/worktrees/pretty-icons-polish`).

## Linha do tempo

- **05-06/out:** baselines duotone e filled (`docs/superpowers/baselines/2026-10-05-...`, `2026-10-06-...`).
- **08/out:** decisão de descartar os ícones coloridos para não ficarem iguais aos da referência. Artifact com 10 ícones de carro e 10 de padaria, no acabamento filled: https://claude.ai/artifact/P2FPiGGy9m21x8Dac2qFHr
- **08/out:** rodada "craft" (antes e depois em `baselines/2026-10-08-craft-before` e `craft-after`).
- **10/out:** artifact da garagem, republicado várias vezes até 11/out 00:03: https://claude.ai/artifact/UwErGKY2j4Quj7KMNy2Fcc (garagem, carro e padaria, antes e agora, com as leituras às cegas, de acabamento e de conjunto).
- **11/out:** o **polish** (branch `pretty-icons-polish`): regras novas (air, loose, bend, diagonal, corpos suaves, leitura de sombra, regra 08 com números, regra 09 de interfaces), conjuntos `examples/hairline` e `examples/garage` redesenhados, e duas provas com agentes novos. O branch foi mantido como está, sem merge.
- **11/out 19:53:** teste manual da sidebar (duotone 16: inbox, calendar, chat, profile, search, upload). Resultado publicado em https://claude.ai/artifact/NQpPGXCs32xNDimy8fYG3Z (é o **artifact mais recente** do pretty-icons).

## Pontos em aberto

1. **Limite de rodadas na leitura de acabamento.** Na prova "notes, duotone 16", o desenhista precisou de **10 rodadas** de `check` até o `ok` final (meta: 1 ou 2). Na sidebar de 11/out, a leitura de acabamento ainda apontou defeitos em **inbox, chat, search e upload**.
2. **Faixa de peso no 16.** As falhas de `weight` se repetem em inbox (acima da mediana, +15% a +36%) e upload (abaixo, -15% a -26%). A faixa de ±15% da mediana e ±20% da referência parece apertada demais para 16.
3. **Branch sem destino.** `pretty-icons-polish` não foi mesclado nem enviado. Decidir: abrir PR para `main`, ou seguir isolado.
4. **Instalação acoplada ao branch** (ver o cuidado acima). Se o link virar problema, copiar a skill para `~/.claude/skills/pretty-icons` em vez de linkar.
5. **Teste da cozinha (filled 48)** ainda não rodado (`~/estudos/teste-pretty-icons/cozinha/` está vazia).

## Como testar

Ver `~/estudos/teste-pretty-icons/PROMPTS.md`. Em resumo, numa pasta vazia, com `~/estudos/skills` em `pretty-icons-polish`:

```
cd ~/estudos/teste-pretty-icons/cozinha && claude
> /pretty-icons kettle, whisk, rolling-pin, pot, cup, toaster — para a grade de categorias de uma loja de cozinha, acabamento filled. Ninguém vai responder perguntas: onde a skill manda perguntar, siga a recomendação dela e diga qual foi. Antes de cada check.mjs, diga "check run N".
```

Conferir depois:

```
node ~/estudos/skills/skills/pretty-icons/check.mjs pretty-icons --print
node ~/estudos/skills/skills/pretty-icons/sheet.mjs pretty-icons --out=sheets
```

Medidas: rodadas de `check` até `ok` (meta 1-2), leitura cega N de N sem "por eliminação", "one set" na leitura de conjunto, defeitos na leitura de acabamento.

## Sessões (Claude Code)

Transcritos em `~/.claude/projects/`:

- `-Users-lucasmarques-estudos-skills/c3045919-a789-4504-8272-13f328e28d4d.jsonl`: a sessão principal do pretty-icons (08 a 11/out). Retomar com `claude --resume c3045919-a789-4504-8272-13f328e28d4d` em `~/estudos/skills`.
- `-Users-lucasmarques-estudos-teste-pretty-icons-sidebar/a5518ef0-14c1-42c9-96c7-bafc8f3bc77d.jsonl`: o teste da sidebar.
- `-Users-lucasmarques-estudos-skills/c9626167-c3f2-41db-9257-adb340adc03b.jsonl`: sessão da Penumbra (outro projeto; só cita o pretty-icons).

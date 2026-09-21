# Meu Roteiro

> Sua viagem. Seu estilo. Seu roteiro.

Produto digital que transforma **perfil + destino + orçamento + interesses + tempo disponível**
em um **roteiro turístico personalizado**, gerado por IA, entregue no navegador, por e-mail e em PDF.

**MVP:** 8 destinos da Região Sul do Brasil (SC, PR, RS).

---

## Status

🟢 **Sprints 0, 1 e 3** concluídos (fundação · catálogo e admin · motor de IA).

Pronto e funcionando:
- Next.js 15 + TypeScript + Tailwind, com os tokens de design de `docs/09`
- Home: hero, 8 cards de destino, como funciona, o que vem no roteiro
- Questionário completo de 7 etapas, com barra de progresso, rascunho em
  `localStorage`, campos condicionais e validação por etapa
- Catálogo dos 8 destinos tipado (`lib/catalogo/`), fonte única para UI e seed
- Banco PostgreSQL com migration inicial, seed idempotente dos 8 destinos
  e dos 3 produtos, e camada de dados com fallback para o catálogo estático
- Painel administrativo em `/admin`: visão geral com cobertura do catálogo,
  curadoria de atrações e edição de preços dos produtos

- Motor de IA em `lib/selecao` + `lib/ai`: seleção determinística de POIs,
  agrupamento geográfico por região, montagem de prompt, validação
  anti-alucinação com retry guiado e hidratação dos campos factuais
  a partir do banco
- 54 testes automatizados (`npm test`)

Próximo: Sprint 2 (landings de destino + prévia) e Sprint 4 (checkout, PDF, e-mail).

### Pendência conhecida do motor de IA

O pipeline foi exercitado de ponta a ponta com um modelo injetado, incluindo
o laço de retry. **A chamada real à Claude API ainda não foi executada** — não
havia `ANTHROPIC_API_KEY` no ambiente. O formato do corpo da requisição também
não é verificável sem chave: a API responde 401 antes de validar o corpo
(testado). A primeira execução com chave real precisa ser acompanhada.

## Rodando localmente

```bash
npm install
cp .env.example .env          # preencha DATABASE_URL e ADMIN_USER/ADMIN_PASSWORD

npm run db:migrate            # cria o schema
npm run db:seed               # 8 destinos + 3 produtos (idempotente)

npm run dev                   # http://localhost:3000
npm run build
npm run typecheck
```

Sem `DATABASE_URL`, a home e o questionário continuam funcionando lendo o
catálogo tipado de `lib/catalogo/destinos.ts` — só o `/admin` exige banco.

O painel fica em `/admin`, protegido por HTTP Basic
(`ADMIN_USER` / `ADMIN_PASSWORD`). É uma medida temporária: o Sprint 4 traz
Supabase Auth com magic link.

## Documentação

| # | Documento | Conteúdo |
|---|-----------|----------|
| 00 | [Visão do produto](docs/00-visao-produto.md) | Proposta de valor, público, princípios |
| 01 | [Arquitetura técnica](docs/01-arquitetura-tecnica.md) | Stack, diagramas, decisões (ADRs) |
| 02 | [Fluxo do usuário](docs/02-fluxo-usuario.md) | Home → questionário → prévia → pagamento → roteiro |
| 03 | [Banco de dados](docs/03-banco-de-dados.md) | Modelo de dados e schema |
| 04 | [Integrações](docs/04-integracoes.md) | Pagamento, e-mail, mapas, PDF, storage |
| 05 | [Custos operacionais](docs/05-custos-operacionais.md) | Custo por roteiro, infra, unit economics |
| 06 | [Estratégia de MVP](docs/06-estrategia-mvp.md) | Roadmap, sprints, go-to-market |
| 07 | [Motor de IA](docs/07-motor-de-ia.md) | Pipeline, prompts, anti-alucinação, validação |
| 08 | [Destinos do MVP](docs/08-destinos-mvp.md) | Os 8 destinos e o processo de curadoria |
| 09 | [Design system](docs/09-design-system.md) | Identidade visual, componentes, mobile-first |
| 10 | [Jurídico e compliance](docs/10-juridico-compliance.md) | LGPD, CDC, reembolso, termos |

## Próximo passo

Revisar e aprovar os documentos acima (ou pedir ajustes). Depois disso,
começa a implementação pelo **Sprint 0** descrito em
[docs/06-estrategia-mvp.md](docs/06-estrategia-mvp.md).

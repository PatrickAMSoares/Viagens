# Meu Roteiro

> Sua viagem. Seu estilo. Seu roteiro.

Produto digital que transforma **perfil + destino + orçamento + interesses + tempo disponível**
em um **roteiro turístico personalizado**, gerado por IA, entregue no navegador, por e-mail e em PDF.

**MVP:** 8 destinos da Região Sul do Brasil (SC, PR, RS).

---

## Status

🟡 **Fase 0 — Arquitetura aprovada?**
Este repositório contém, neste momento, **apenas a especificação técnica**.
Nenhum código de aplicação foi escrito ainda, conforme solicitado
("antes de desenvolver, apresente a arquitetura...").

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

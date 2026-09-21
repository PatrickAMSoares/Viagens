# 00 — Visão do produto

## O problema

A pessoa já escolheu o destino (ou quase). O que ela **não** tem é:
- tempo para pesquisar 40 abas do Google, TripAdvisor, Instagram e blogs;
- critério para saber o que combina com **ela** (não com o influencer);
- noção de logística: o que dá para fazer no mesmo dia, quanto tempo leva, quanto custa.

O resultado hoje é: uma lista de atrações salvas no Instagram e uma viagem improvisada.

## A promessa

> "Eu não sei exatamente o que fazer nessa viagem. Vou responder algumas perguntas
> e o site monta tudo para mim."

Em ~3 minutos de questionário, a pessoa recebe um roteiro que responde, para cada momento da viagem:

| 📍 Onde ir | 🕐 Quando ir | 🚗 Como chegar | 🍴 Onde comer |
|---|---|---|---|
| **💰 Quanto gastar** | **⚠️ Que cuidados tomar** | **🌧️ O que fazer se o plano mudar** | |

## O que NÃO somos

- ❌ Não somos OTA (não vendemos passagem, hotel ou ingresso — **ainda**).
- ❌ Não somos guia turístico genérico ("10 lugares para conhecer em Gramado").
- ❌ Não somos um chat. O usuário não precisa saber conversar com IA.

Somos um **produto de informação personalizada**, vendido por unidade (por viagem).

## Princípios de produto

1. **Mobile é o dispositivo principal.** O roteiro é aberto na rua, no celular, com uma mão.
2. **A IA organiza, não inventa.** Preço, horário, endereço e linha de ônibus vêm do nosso
   banco curado. Quando não houver dado confiável → avisar, nunca chutar.
   (ver [07-motor-de-ia.md](07-motor-de-ia.md))
3. **Ritmo humano.** Roteiro não é lista de 14 atrações por dia. Tem café, tem descanso,
   tem "hoje é dia de desacelerar".
4. **Voz brasileira, leve e prática** — sem ser piadista. Emoji como sinalização, não decoração.
5. **Valor antes do pagamento.** A prévia gratuita precisa provar que o roteiro é bom.
6. **Arquitetura preparada para crescer** (mais cidades, estados, países, hotéis, afiliados)
   sem reescrever o núcleo.

## Público-alvo (MVP)

| Segmento | Peso | Por que |
|---|---|---|
| Casais 25–45 em viagem curta (3–5 dias) | 🔥 Alto | Gramado/Bento/Bombinhas, ticket médio maior, decidem rápido |
| Famílias com crianças | 🔥 Alto | Maior dor de logística — é onde o produto mais salva a viagem |
| Grupos de amigos 20–35 | Médio | Floripa/BC, sensível a preço |
| Viajante solo | Baixo | Volume menor no Sul, mas ótimo NPS |

## Métrica-norte

**Roteiros pagos por semana.**
Métricas de apoio: taxa de conclusão do questionário, conversão prévia→pagamento,
% de usuários que abrem o roteiro **durante** a viagem (prova de utilidade real).

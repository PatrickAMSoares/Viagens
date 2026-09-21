# 09 — Design system

## Identidade

Quatro ideias guiam tudo: **✈️ viagem · 🗺️ descoberta · 📍 personalização · ✨ experiência**.
Resultado desejado: **moderno, sofisticado e divertido** — sem virar agência de turismo
dos anos 2000 nem startup genérica cinza.

## Cores

```
Primária    Azul-viagem      #1B4FD8   confiança, céu, movimento
Secundária  Coral-pôr-do-sol #FF6B4A   CTA, energia, calor
Apoio       Verde-mata       #0E9F6E   natureza, confirmação
Neutros     #0B1020 → #F7F8FB          texto e superfícies
Gradiente   #1B4FD8 → #6E56CF          discreto, só em hero e cards de destaque
```

Modo escuro obrigatório (o roteiro é lido à noite, no hotel e na rua).
Contraste mínimo AA em todo texto.

## Tipografia

- Títulos: **Sora** ou **Clash Display** — geométrica, moderna, com personalidade
- Texto: **Inter** — legível em tela pequena e em PDF
- Escala fluida (`clamp()`), corpo mínimo 16px no mobile

## Componentes

`DestinoCard` · `ChipSelecao` (questionário) · `BarraProgresso` · `CardPlano` ·
`BlocoRoteiro` (o mais importante) · `BadgePrioridade` (⭐ 💡 ➕) ·
`ChipDeslocamento` · `CardOrcamento` · `AcordeaoPlanoB` · `AvisoVerificacao` ·
`EstadoCarregando` (animação da geração)

## Movimento

Framer Motion, curto e contido:
- Transição entre etapas: slide horizontal 250ms
- Chip selecionado: escala 1.03 + preenchimento 150ms
- Barra de progresso: `spring`
- Tela de geração: avião traçando rota + troca de mensagem a cada 3s
- Roteiro: revelação escalonada dos blocos (60ms de intervalo)
- Respeitar `prefers-reduced-motion` sempre

## Mobile primeiro, de verdade

- Toda tela desenhada em 390×844 antes de qualquer breakpoint
- Alvos de toque ≥ 44px; ações primárias na metade inferior (alcance do polegar)
- Questionário: **uma pergunta por tela**, avanço automático em escolha única
- Roteiro: navegação por dia em tabs deslizantes, períodos colapsáveis,
  botão "Abrir no Maps" em todo bloco
- Fotos em `next/image` com AVIF/WebP e `blur` placeholder
- Meta de performance: LCP < 2,5s no 4G · CLS < 0,1 · Lighthouse ≥ 90

## Acessibilidade

Navegação por teclado no questionário inteiro · `aria-live` na barra de progresso e
na tela de geração · emoji sempre acompanhado de texto (nunca sozinho como informação) ·
foco visível · alt descritivo nas fotos dos destinos.

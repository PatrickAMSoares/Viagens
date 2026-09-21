# 10 — Jurídico e compliance

> Não é aconselhamento jurídico. É a lista do que precisa existir antes de vender,
> para revisão com contador e advogado.

## 1. Pessoa jurídica

- **MEI** atende no início (limite de faturamento anual vigente; CNAE de
  serviços de informação / conteúdo digital). Acima disso, **ME no Simples Nacional**.
- CNPJ é exigido pelo gateway para taxas melhores e para emitir nota.
- **Nota fiscal de serviço** eletrônica a cada venda — automatizável via API
  (Focus NFe, NFe.io, eNotas) na v2; manual no início.

## 2. Consumidor (CDC)

- **Art. 49 — direito de arrependimento: 7 dias** para compra fora do estabelecimento.
  Aplica-se a produto digital. Política prática e honesta:
  > Reembolso integral em até 7 dias, por qualquer motivo.
  > Depois disso, reembolso se o roteiro tiver erro factual comprovado.
- Preço total visível antes do pagamento; sem cobrança recorrente escondida.
- Canal de atendimento claro (e-mail + WhatsApp) e prazo de resposta declarado.

## 3. LGPD

| Requisito | Como atendemos |
|---|---|
| Base legal | Execução de contrato (dados da viagem) + consentimento (marketing) |
| Minimização | Só coletamos nome, e-mail e preferências de viagem. **Sem CPF, sem endereço** — o gateway cuida do pagamento |
| Transparência | Política de privacidade citando Anthropic, Mercado Pago, Supabase, Resend como operadores |
| Uso de IA | Informar de forma visível que o roteiro é gerado por IA a partir de banco curado |
| Direitos do titular | Exportar e excluir dados pela área do cliente (soft delete + purga em 30 dias) |
| Segurança | TLS, RLS no banco, segredos em variáveis de ambiente, PDF em URL assinada |
| Incidentes | Procedimento de notificação à ANPD documentado |
| Transferência internacional | Declarada na política (servidores fora do Brasil) |
| Encarregado (DPO) | Indicar contato — pode ser o próprio titular no MEI |
| Cookies | Banner só se houver analytics/pixel de terceiros |

## 4. Conteúdo e direitos

- **Imagens:** só com licença comprovada (Unsplash/Pexels com crédito, banco pago,
  fotos próprias ou cessão do estabelecimento). Guardar o comprovante de licença.
  Nunca usar imagem encontrada no Google.
- **Dados de terceiros:** informações factuais (horário, preço) não são protegidas
  por direito autoral, mas **textos de terceiros são** — descrições sempre originais.
- **Marcas:** citar nomes de atrações e restaurantes é uso nominativo legítimo;
  não sugerir patrocínio ou parceria inexistente.
- **Roteiro entregue:** licença de uso pessoal e intransferível. PDF com marca
  d'água contendo o nome do comprador.

## 5. Limitação de responsabilidade (nos Termos)

Deixar explícito, em linguagem simples:
- valores são **estimativas** e podem variar;
- horários, preços e condições podem mudar — **confirme antes de sair**;
- não somos agência de viagens e não intermediamos reserva, transporte ou hospedagem;
- dicas de segurança são orientações gerais, não garantia de segurança;
- decisões sobre trilhas, praias, mar e condições climáticas são de responsabilidade
  do viajante.

## 6. Documentos a publicar antes da primeira venda

- [ ] Termos de Uso
- [ ] Política de Privacidade (LGPD)
- [ ] Política de Reembolso
- [ ] Aviso sobre uso de Inteligência Artificial
- [ ] Página de contato com dados do CNPJ

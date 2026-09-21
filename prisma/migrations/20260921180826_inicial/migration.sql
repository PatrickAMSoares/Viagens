-- CreateEnum
CREATE TYPE "Confianca" AS ENUM ('alta', 'media', 'baixa');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('cliente', 'admin');

-- CreateEnum
CREATE TYPE "StatusViagem" AS ENUM ('rascunho', 'previa_gerada', 'pago', 'roteiro_gerado', 'falhou');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('criado', 'aguardando_pagamento', 'pago', 'falhou', 'reembolsado', 'expirado');

-- CreateEnum
CREATE TYPE "TipoRoteiro" AS ENUM ('previa', 'completo');

-- CreateEnum
CREATE TYPE "Estilo" AS ENUM ('economico', 'equilibrado', 'confortavel', 'premium');

-- CreateEnum
CREATE TYPE "Companhia" AS ENUM ('sozinho', 'casal', 'amigos', 'familia', 'criancas', 'grupo');

-- CreateEnum
CREATE TYPE "Modal" AS ENUM ('a_pe', 'onibus', 'metro', 'app', 'taxi', 'transfer', 'carro', 'barco', 'bicicleta');

-- CreateEnum
CREATE TYPE "PeriodoDia" AS ENUM ('manha', 'almoco', 'tarde', 'fim_tarde', 'noite');

-- CreateEnum
CREATE TYPE "ContextoDica" AS ENUM ('geral', 'noite', 'praia', 'trilha', 'transporte', 'clima', 'golpes', 'pertences');

-- CreateEnum
CREATE TYPE "TipoPOI" AS ENUM ('atracao', 'restaurante');

-- CreateTable
CREATE TABLE "destinos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "estado" CHAR(2) NOT NULL,
    "pais" CHAR(2) NOT NULL DEFAULT 'BR',
    "descricao_curta" TEXT NOT NULL,
    "descricao_longa" TEXT,
    "categorias" TEXT[],
    "imagens" JSONB NOT NULL DEFAULT '[]',
    "centro_lat" DECIMAL(10,7),
    "centro_lng" DECIMAL(10,7),
    "fuso" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "notas_transito" TEXT,
    "clima_notas" TEXT,
    "melhor_epoca" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atracoes" (
    "id" TEXT NOT NULL,
    "destino_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategorias" TEXT[],
    "descricao" TEXT NOT NULL,
    "endereco" TEXT,
    "bairro" TEXT,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "horarios" JSONB,
    "preco_min" DECIMAL(10,2),
    "preco_max" DECIMAL(10,2),
    "preco_obs" TEXT,
    "gratuito" BOOLEAN NOT NULL DEFAULT false,
    "duracaoMin" INTEGER,
    "duracao_recomendada_min" INTEGER,
    "perfis_indicados" TEXT[],
    "melhor_horario" "PeriodoDia"[],
    "adequado_criancas" BOOLEAN NOT NULL DEFAULT true,
    "acessivel_pcd" BOOLEAN,
    "requer_reserva" BOOLEAN NOT NULL DEFAULT false,
    "indoor" BOOLEAN NOT NULL DEFAULT false,
    "sazonalidade" TEXT,
    "info_seguranca" TEXT,
    "dicas" TEXT,
    "prioridadeBase" INTEGER NOT NULL DEFAULT 3,
    "fonte_url" TEXT,
    "verificado_em" TIMESTAMP(3),
    "confianca" "Confianca" NOT NULL DEFAULT 'media',
    "linkAfiliado" TEXT,
    "parceiro_id" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurantes" (
    "id" TEXT NOT NULL,
    "destino_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tipos" "PeriodoDia"[],
    "faixaPreco" INTEGER NOT NULL,
    "ticket_medio" DECIMAL(10,2),
    "bairro" TEXT,
    "endereco" TEXT,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "horarios" JSONB,
    "perfis_indicados" TEXT[],
    "vegetariano" BOOLEAN NOT NULL DEFAULT false,
    "adequado_criancas" BOOLEAN NOT NULL DEFAULT true,
    "requer_reserva" BOOLEAN NOT NULL DEFAULT false,
    "dicas" TEXT,
    "fonte_url" TEXT,
    "verificado_em" TIMESTAMP(3),
    "confianca" "Confianca" NOT NULL DEFAULT 'media',
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportes" (
    "id" TEXT NOT NULL,
    "destino_id" TEXT NOT NULL,
    "modal" "Modal" NOT NULL,
    "regiao" TEXT,
    "nome_linha" TEXT,
    "descricao" TEXT NOT NULL,
    "custo_aprox" DECIMAL(10,2),
    "como_pagar" TEXT,
    "horarios_operacao" TEXT,
    "observacoes" TEXT,
    "fonte_url" TEXT,
    "verificado_em" TIMESTAMP(3),
    "confianca" "Confianca" NOT NULL DEFAULT 'media',

    CONSTRAINT "transportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dicas_seguranca" (
    "id" TEXT NOT NULL,
    "destino_id" TEXT NOT NULL,
    "contexto" "ContextoDica" NOT NULL,
    "regiao" TEXT,
    "texto" TEXT NOT NULL,
    "severidade" TEXT NOT NULL DEFAULT 'info',
    "fonte_url" TEXT,
    "verificado_em" TIMESTAMP(3),

    CONSTRAINT "dicas_seguranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poi_distancias" (
    "id" TEXT NOT NULL,
    "origem_tipo" "TipoPOI" NOT NULL,
    "origem_id" TEXT NOT NULL,
    "destino_tipo" "TipoPOI" NOT NULL,
    "destino_id" TEXT NOT NULL,
    "modal" "Modal" NOT NULL,
    "minutos" INTEGER NOT NULL,
    "km" DECIMAL(8,2) NOT NULL,
    "custo_aprox" DECIMAL(10,2),
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poi_distancias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "telefone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'cliente',
    "preferencias" JSONB NOT NULL DEFAULT '{}',
    "aceite_termos_em" TIMESTAMP(3),
    "aceite_marketing" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "excluido_em" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viagens" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "destino_id" TEXT NOT NULL,
    "status" "StatusViagem" NOT NULL DEFAULT 'rascunho',
    "dias" INTEGER NOT NULL,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "companhia" "Companhia" NOT NULL,
    "adultos" INTEGER NOT NULL DEFAULT 1,
    "criancas" INTEGER NOT NULL DEFAULT 0,
    "idades_criancas" INTEGER[],
    "estilo" "Estilo" NOT NULL,
    "orcamento_pessoa" DECIMAL(10,2),
    "perfil" TEXT[],
    "interesses" TEXT[],
    "transportes" TEXT[],
    "desejos_texto" TEXT,
    "desejos_parseados" JSONB,
    "respostas_raw" JSONB NOT NULL DEFAULT '{}',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roteiros" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "pedido_id" TEXT,
    "produto_id" TEXT,
    "tipo" "TipoRoteiro" NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "conteudo" JSONB NOT NULL,
    "modelo_ia" TEXT,
    "tokens_entrada" INTEGER,
    "tokens_saida" INTEGER,
    "custo_usd" DECIMAL(10,5),
    "duracao_ms" INTEGER,
    "pdf_url" TEXT,
    "pdf_gerado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roteiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "beneficios" JSONB NOT NULL DEFAULT '[]',
    "preco_centavos" INTEGER NOT NULL,
    "preco_riscado_centavos" INTEGER,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "secoesIncluidas" TEXT[],
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "desconto_centavos" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusPedido" NOT NULL DEFAULT 'criado',
    "gateway" TEXT NOT NULL DEFAULT 'mercadopago',
    "gateway_pedido_id" TEXT,
    "gateway_pagamento_id" TEXT,
    "metodo" TEXT,
    "pago_em" TIMESTAMP(3),
    "expira_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'mercadopago',
    "evento_id" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valor_centavos" INTEGER,
    "payload" JSONB NOT NULL,
    "assinatura_valida" BOOLEAN NOT NULL DEFAULT false,
    "recebido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processado_em" TIMESTAMP(3),

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fontes_verificacao" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valor_anterior" TEXT,
    "valor_novo" TEXT,
    "fonte_url" TEXT,
    "verificado_por" TEXT,
    "verificado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fontes_verificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destinos_slug_key" ON "destinos"("slug");

-- CreateIndex
CREATE INDEX "atracoes_destino_id_categoria_ativo_idx" ON "atracoes"("destino_id", "categoria", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "atracoes_destino_id_slug_key" ON "atracoes"("destino_id", "slug");

-- CreateIndex
CREATE INDEX "restaurantes_destino_id_faixaPreco_ativo_idx" ON "restaurantes"("destino_id", "faixaPreco", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "restaurantes_destino_id_slug_key" ON "restaurantes"("destino_id", "slug");

-- CreateIndex
CREATE INDEX "transportes_destino_id_modal_idx" ON "transportes"("destino_id", "modal");

-- CreateIndex
CREATE INDEX "dicas_seguranca_destino_id_contexto_idx" ON "dicas_seguranca"("destino_id", "contexto");

-- CreateIndex
CREATE INDEX "poi_distancias_origem_id_modal_idx" ON "poi_distancias"("origem_id", "modal");

-- CreateIndex
CREATE UNIQUE INDEX "poi_distancias_origem_id_destino_id_modal_key" ON "poi_distancias"("origem_id", "destino_id", "modal");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "viagens_status_criado_em_idx" ON "viagens"("status", "criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "roteiros_viagem_id_tipo_versao_key" ON "roteiros"("viagem_id", "tipo", "versao");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_slug_key" ON "produtos"("slug");

-- CreateIndex
CREATE INDEX "pedidos_status_criado_em_idx" ON "pedidos"("status", "criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_gateway_evento_id_key" ON "pagamentos"("gateway", "evento_id");

-- CreateIndex
CREATE INDEX "fontes_verificacao_entidade_entidade_id_idx" ON "fontes_verificacao"("entidade", "entidade_id");

-- AddForeignKey
ALTER TABLE "atracoes" ADD CONSTRAINT "atracoes_destino_id_fkey" FOREIGN KEY ("destino_id") REFERENCES "destinos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurantes" ADD CONSTRAINT "restaurantes_destino_id_fkey" FOREIGN KEY ("destino_id") REFERENCES "destinos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes" ADD CONSTRAINT "transportes_destino_id_fkey" FOREIGN KEY ("destino_id") REFERENCES "destinos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dicas_seguranca" ADD CONSTRAINT "dicas_seguranca_destino_id_fkey" FOREIGN KEY ("destino_id") REFERENCES "destinos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_destino_id_fkey" FOREIGN KEY ("destino_id") REFERENCES "destinos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

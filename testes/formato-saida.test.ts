import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { diaSchema, previaSchema } from '../lib/ai/schema'

/**
 * O que dá para verificar localmente sobre a requisição.
 *
 * O formato do corpo NÃO é verificável sem chave válida: a API responde 401
 * antes de validar o corpo (testado), então uma sonda com chave falsa não
 * prova nada. O que resta, e vale:
 *  - os tipos do SDK aceitam os parâmetros usados (garantido por `tsc`);
 *  - o JSON Schema derivado do Zod é bem formado e cobre os campos.
 * A validação real do corpo só acontece com chave — está listada como
 * pendência explícita no README.
 */
describe('formato de saída enviado à API', () => {
  it('zodOutputFormat produz um JSON Schema utilizável para o dia', () => {
    const formato = zodOutputFormat(diaSchema) as unknown as {
      type: string
      schema: { type: string; properties: Record<string, unknown>; required?: string[] }
    }

    assert.equal(formato.type, 'json_schema')
    assert.equal(formato.schema.type, 'object')

    for (const campo of ['numero', 'titulo', 'abertura', 'blocos', 'planoB']) {
      assert.ok(campo in formato.schema.properties, `faltou "${campo}" no schema`)
    }
  })

  it('o schema enviado não tem campo para preço, endereço ou horário de funcionamento', () => {
    // Se não existe campo, o modelo não tem onde escrever um fato inventado.
    const json = JSON.stringify(zodOutputFormat(diaSchema))
    for (const proibido of ['"preco"', '"endereco"', '"horarioFuncionamento"', '"linha"']) {
      assert.ok(!json.includes(proibido), `o schema não pode aceitar ${proibido}`)
    }
  })

  it('o schema da prévia também é bem formado', () => {
    const formato = zodOutputFormat(previaSchema) as unknown as {
      type: string
      schema: { type: string }
    }
    assert.equal(formato.type, 'json_schema')
    assert.equal(formato.schema.type, 'object')
  })
})

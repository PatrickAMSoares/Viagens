import type { Destino } from './tipos'

/**
 * Os 8 destinos do MVP — ver docs/08-destinos-mvp.md.
 *
 * Este arquivo é a fonte única: alimenta o seed do Prisma e serve de
 * fallback para a UI enquanto o banco não está provisionado.
 * Adicionar um destino no futuro = inserir linha no banco (sem deploy).
 */
export const DESTINOS: Destino[] = [
  {
    slug: 'florianopolis',
    nome: 'Florianópolis',
    estado: 'Santa Catarina',
    uf: 'SC',
    pais: 'BR',
    descricaoCurta: 'Praia de manhã, trilha à tarde e ostra no fim do dia — 42 praias em uma ilha só.',
    descricaoLonga:
      'Florianópolis não é um destino, são vários. O Norte é agitado e badalado, o Leste tem as praias de surf e as trilhas mais bonitas, o Sul guarda as vilas de pescadores e o Centro concentra a história e a gastronomia. Por isso o roteiro aqui vive ou morre pela organização: quem tenta ver tudo todo dia passa a viagem no carro.',
    tags: [
      { icone: '🏖️', rotulo: 'Praias' },
      { icone: '🌿', rotulo: 'Natureza' },
      { icone: '🍴', rotulo: 'Gastronomia' },
      { icone: '🌙', rotulo: 'Vida noturna' },
    ],
    imagem: null, // TODO(curadoria): foto licenciada no R2 — Vista aérea da orla de Florianópolis
    centro: { lat: -27.5954, lng: -48.548 },
    notasTransito:
      'As pontes e a SC-401 concentram o movimento entre 7h30–9h e 17h30–19h30. Na alta temporada, o acesso ao Norte da Ilha pode dobrar de tempo.',
    climaNotas: 'Verão quente e úmido; vento sul muda o mar rapidamente. Inverno ameno com dias de sol.',
    melhorEpoca: 'Novembro a março para praia; abril a junho para trilhas com clima ameno e menos gente.',
    desafioRoteiro:
      'Ilha grande com deslocamentos longos. Agrupar por região (Norte / Centro-Leste / Sul), um dia por região.',
    ativo: true,
  },
  {
    slug: 'balneario-camboriu',
    nome: 'Balneário Camboriú',
    estado: 'Santa Catarina',
    uf: 'SC',
    pais: 'BR',
    descricaoCurta: 'Skyline na areia, teleférico entre praias e a noite mais movimentada do litoral.',
    descricaoLonga:
      'Cidade compacta e vertical: quase tudo se resolve a pé ou com uma corrida curta. O que diferencia um bom roteiro aqui não é a distância, é o horário — a praia central pega sombra dos prédios à tarde, e as praias agrestes exigem planejamento de acesso.',
    tags: [
      { icone: '🏖️', rotulo: 'Praia' },
      { icone: '🌙', rotulo: 'Vida noturna' },
      { icone: '🛍️', rotulo: 'Compras' },
      { icone: '🍴', rotulo: 'Gastronomia' },
    ],
    imagem: null, // TODO(curadoria): foto licenciada no R2 — Praia central de Balneário Camboriú com prédios ao fundo
    centro: { lat: -26.9926, lng: -48.635 },
    notasTransito:
      'Estacionamento na orla é o principal atrito, sobretudo entre dezembro e fevereiro. A Avenida Atlântica congestiona no fim da tarde.',
    climaNotas: 'Verão quente; a sombra dos edifícios chega à praia central por volta das 15h no inverno.',
    melhorEpoca: 'Dezembro a março para praia e agito; outubro e abril para preços melhores.',
    desafioRoteiro:
      'Tudo é perto — a diferenciação vem do horário certo de cada praia e da escolha de experiência.',
    ativo: true,
  },
  {
    slug: 'bombinhas',
    nome: 'Bombinhas',
    estado: 'Santa Catarina',
    uf: 'SC',
    pais: 'BR',
    descricaoCurta: 'Água transparente, mergulho e trilhas curtas que terminam em mirante.',
    descricaoLonga:
      'A península de Bombinhas concentra dezenas de praias pequenas, muitas delas acessíveis só por trilha ou barco. É o destino mais "pé na areia e respira" do MVP — e o que mais recompensa quem acorda cedo.',
    tags: [
      { icone: '🏖️', rotulo: 'Praias' },
      { icone: '🤿', rotulo: 'Mergulho' },
      { icone: '🏞️', rotulo: 'Trilhas' },
      { icone: '🌿', rotulo: 'Ecoturismo' },
    ],
    imagem: null, // TODO(curadoria): foto licenciada no R2 — Praia de águas transparentes em Bombinhas
    centro: { lat: -27.1389, lng: -48.4814 },
    notasTransito:
      'Na alta temporada há cobrança de taxa de preservação ambiental e controle de entrada de veículos. Estacionamento nas praias menores esgota antes das 9h.',
    climaNotas: 'Mar calmo e transparente entre dezembro e março — melhor janela para mergulho.',
    melhorEpoca: 'Dezembro a março para mergulho; abril e maio para tranquilidade.',
    desafioRoteiro:
      'Forte sazonalidade e restrição de acesso na alta temporada. Horário de chegada é parte do roteiro.',
    ativo: true,
  },
  {
    slug: 'curitiba',
    nome: 'Curitiba',
    estado: 'Paraná',
    uf: 'PR',
    pais: 'BR',
    descricaoCurta: 'Parques, museus e café — a cidade que funciona bem mesmo quando chove.',
    descricaoLonga:
      'Curitiba é o destino mais urbano e mais "à prova de chuva" do MVP: museus, mercados, cafeterias e uma rede de transporte público que realmente leva o turista aonde ele quer ir. Bom para quem gosta de andar sem pressa e sentar para conversar.',
    tags: [
      { icone: '🏛️', rotulo: 'Cultura' },
      { icone: '☕', rotulo: 'Cafés' },
      { icone: '🌳', rotulo: 'Parques' },
      { icone: '🍴', rotulo: 'Gastronomia' },
    ],
    imagem: null, // TODO(curadoria): foto licenciada no R2 — Jardim Botânico de Curitiba
    centro: { lat: -25.4284, lng: -49.2733 },
    notasTransito:
      'Os eixos de ônibus expresso são rápidos e previsíveis. O centro tem rotativo pago; aos domingos a Feira do Largo da Ordem fecha ruas no centro histórico.',
    climaNotas: 'Fria e chuvosa boa parte do ano — leve agasalho mesmo no verão. Plano B de chuva é essencial.',
    melhorEpoca: 'Setembro a novembro (primavera florida) e abril a maio.',
    desafioRoteiro:
      'Melhor rede de transporte público do MVP e muitas opções indoor — explorar ambos no roteiro.',
    ativo: true,
  },
  {
    slug: 'foz-do-iguacu',
    nome: 'Foz do Iguaçu',
    estado: 'Paraná',
    uf: 'PR',
    pais: 'BR',
    descricaoCurta: 'As Cataratas de dois lados, a usina por dentro e três países num raio de 20 km.',
    descricaoLonga:
      'É o roteiro de maior valor logístico do MVP. Cada grande atração consome meio período, os horários de entrada no Parque Nacional são controlados e a travessia para o lado argentino muda completamente o planejamento do dia. Organizar isso direito é a diferença entre ver tudo e perder a metade.',
    tags: [
      { icone: '💦', rotulo: 'Cataratas' },
      { icone: '🌿', rotulo: 'Natureza' },
      { icone: '🎢', rotulo: 'Aventura' },
      { icone: '📸', rotulo: 'Fotografia' },
    ],
    imagem: null, // TODO(curadoria): foto licenciada no R2 — Cataratas do Iguaçu vistas da passarela
    centro: { lat: -25.5163, lng: -54.5854 },
    notasTransito:
      'O acesso ao Parque Nacional concentra filas entre 9h e 11h. A travessia para Argentina e Paraguai tem picos de espera — confirme regras e documentos antes de ir.',
    climaNotas: 'Quente e úmido o ano todo. Chuva forte aumenta o volume das quedas e o espetáculo.',
    melhorEpoca: 'Março a maio e agosto a outubro — menos calor extremo e menos fila.',
    desafioRoteiro:
      'Meio período por atração, horários controlados e fronteira. Regras mudam: exigir fonte oficial e data de verificação.',
    ativo: true,
  },
  {
    slug: 'gramado',
    nome: 'Gramado',
    estado: 'Rio Grande do Sul',
    uf: 'RS',
    pais: 'BR',
    descricaoCurta: 'Chocolate, fondue e rua iluminada — o destino de casal mais querido do Sul.',
    descricaoLonga:
      'Gramado é experiência antes de ser passeio: um café que demora, um jantar longo, uma rua bonita à noite. Funciona o ano inteiro, mas muda de personalidade conforme o calendário de eventos — e é por isso que o roteiro precisa saber em que época você vai.',
    tags: [
      { icone: '💑', rotulo: 'Romance' },
      { icone: '🍫', rotulo: 'Chocolate' },
      { icone: '🍷', rotulo: 'Vinhos' },
      { icone: '🍴', rotulo: 'Gastronomia' },
    ],
    imagem: null, // TODO(curadoria): foto licenciada no R2 — Rua Coberta de Gramado decorada
    centro: { lat: -29.3788, lng: -50.8739 },
    notasTransito:
      'A Borges de Medeiros trava no fim da tarde e nos fins de semana. Estacionamento no centro é escasso em períodos de evento — considere deixar o carro no hotel.',
    climaNotas: 'Inverno frio de verdade (pode chegar perto de 0 °C); verão ameno e agradável.',
    melhorEpoca: 'Junho a agosto para o frio; outubro a dezembro para o Natal Luz.',
    desafioRoteiro:
      'Sazonalidade de eventos é parte estrutural do catálogo, não um detalhe. Combina naturalmente com Canela.',
    ativo: true,
  },
  {
    slug: 'canela',
    nome: 'Canela',
    estado: 'Rio Grande do Sul',
    uf: 'RS',
    pais: 'BR',
    descricaoCurta: 'Cachoeira, cânion e trilha na serra — a vizinha de Gramado que respira fundo.',
    descricaoLonga:
      'A 7 km de Gramado e com vocação oposta: aqui a graça é o parque, a cachoeira e o mirante. Quase todo mundo que vai para Gramado passa por Canela — e um roteiro bom trata as duas como um destino só, sem desperdiçar deslocamento.',
    tags: [
      { icone: '🏞️', rotulo: 'Trilhas' },
      { icone: '🌿', rotulo: 'Natureza' },
      { icone: '⛰️', rotulo: 'Serra' },
      { icone: '👨‍👩‍👧', rotulo: 'Família' },
    ],
    imagem: null, // TODO(curadoria): foto licenciada no R2 — Cachoeira em parque na serra gaúcha
    centro: { lat: -29.3628, lng: -50.8119 },
    notasTransito:
      'Parques abrem cedo e enchem depois das 10h. Acesso por estrada de serra — dirigir com atenção em dias de neblina.',
    climaNotas: 'Neblina frequente pela manhã na serra; inverno frio e seco.',
    melhorEpoca: 'Março a maio e setembro a novembro, para trilhas com clima estável.',
    desafioRoteiro:
      'Funciona combinada com Gramado. O catálogo permite roteiro integrado já no MVP.',
    ativo: true,
  },
  {
    slug: 'bento-goncalves',
    nome: 'Bento Gonçalves',
    estado: 'Rio Grande do Sul',
    uf: 'RS',
    pais: 'BR',
    descricaoCurta: 'Vinícolas, parreirais e almoço que dura três horas no Vale dos Vinhedos.',
    descricaoLonga:
      'Enoturismo de verdade: visita guiada, degustação, produtor pequeno e almoço colonial. O detalhe que quebra roteiros improvisados é que a maioria das vinícolas trabalha com reserva e horário fixo de visita — planejar é obrigatório, não opcional.',
    tags: [
      { icone: '🍷', rotulo: 'Vinhos' },
      { icone: '🍴', rotulo: 'Gastronomia' },
      { icone: '🌾', rotulo: 'Turismo rural' },
      { icone: '💑', rotulo: 'Romance' },
    ],
    imagem: null, // TODO(curadoria): foto licenciada no R2 — Parreirais no Vale dos Vinhedos
    centro: { lat: -29.1662, lng: -51.5165 },
    notasTransito:
      'Vale dos Vinhedos, Garibaldi e Monte Belo do Sul são circuitos distintos — misturar os três no mesmo dia rende mais estrada que vinho. Em dia de degustação, contrate transfer ou motorista.',
    climaNotas: 'Outono com parreirais coloridos; inverno frio e seco, ideal para vinho tinto e canjica.',
    melhorEpoca: 'Fevereiro a abril (vindima e outono) — a melhor época do ano aqui.',
    desafioRoteiro:
      'Reserva obrigatória e horário fixo mudam a estrutura do dia. Dica de não beber e dirigir é item obrigatório de segurança.',
    ativo: true,
  },
]

export function buscarDestino(slug: string): Destino | undefined {
  return DESTINOS.find((d) => d.slug === slug && d.ativo)
}

export const DESTINOS_ATIVOS = DESTINOS.filter((d) => d.ativo)

export type InteractionMode = 'standard' | 'bed' | 'shower' | 'window' | 'door'

export interface InteractableDefinition {
  id: string
  prompt: string
  mode?: InteractionMode
  flag?: string
  subtitle?: string
  afterNoteSubtitle?: string
  objective?: string
  note?: {
    title: string
    body: string
  }
}

export const INTERACTABLES: Record<string, InteractableDefinition> = {
  bed: {
    id: 'bed',
    prompt: '[E] Levantar',
    mode: 'bed',
    flag: 'awake',
    subtitle: 'Cinco e vinte da manhã. Último dia da semana, Bruno. Aguenta firme.',
    objective: 'Prepare-se: feche a torneira, tome café, pegue o crachá e o celular.',
  },
  faucet_bathroom: {
    id: 'faucet_bathroom',
    prompt: '[E] Fechar a torreia',
    flag: 'faucet_fixed',
    subtitle: 'Tudo nessa vida se repete em padrão. Você não precisa ser gênio. Presta atenção no padrão e você prevê qualquer coisa.',
  },
  mirror: {
    id: 'mirror',
    prompt: '[E] Olhar-se no espelho',
    flag: 'mirror_seen',
    note: {
      title: 'VOCÊ',
      body: 'Bruno Paulon, 29 anos. Rosto de quem cresceu cedo demais e dorme pouco há uma década. Dez anos limpando os outros... e ninguém desse prédio sabe seu nome. Sabem seu número. Isso quando sabem.',
    },
  },
  shower: {
    id: 'shower',
    prompt: '[E] Tomar banho',
    mode: 'shower',
    flag: 'showered',
    subtitle: 'Água gelada como sempre. Economia de quem paga conta no vermelho.',
  },
  fridge_note: {
    id: 'fridge_note',
    prompt: '[E] Ler o papel',
    flag: 'note_read',
    note: {
      title: 'ESCOLA TÉCNICA — NOTIFICAÇÃO',
      body: 'Prezado Sr. Paulon, infelizmente sua inscrição no CURSO DE VIGIA NOTURNO foi REPROVADA por frequência insuficiente. Agradecemos a preferência.',
    },
    afterNoteSubtitle: "'Frequência insuficiente'. Trabalhando duas limpezas pra pagar o curso. A vida tem senso de humor.",
  },
  coffee: {
    id: 'coffee',
    prompt: '[E] Fazer café',
    flag: 'coffee_made',
    subtitle: 'Café ruim, forte, quente. O trio perfeito.',
  },
  badge: {
    id: 'badge',
    prompt: '[E] Pegar o crachá',
    flag: 'badge_taken',
    note: {
      title: 'CRACHÁ Nº 4471',
      body: 'PAULON, B. — FUNÇÃO: ZELADORIA / TURNO NOTURNO — LOCAL: MERIDIAN TOWER — SÉRIE: MRD-1991-4471',
    },
  },
  phone: {
    id: 'phone',
    prompt: '[E] Checar o celular',
    flag: 'phone_checked',
    note: {
      title: 'CELULAR — 12%',
      body: "05:24 — Sem mensagens. Bateria: 12%. 'Desligue apps em segundo plano para economizar'... Num celular de R$180, o que roda em segundo plano é a saudade.",
    },
  },
  window: {
    id: 'window',
    prompt: '[E] Olhar pela janela',
    mode: 'window',
    flag: 'window_seen',
    subtitle: 'Lá vai ela... quarenta andares de gente que nunca soube meu nome. Hoje eu limpo o 37. Andar de executivo. Nem deve ter sujeira de verdade.',
  },
  clock: {
    id: 'clock',
    prompt: '[E] Ver as horas',
    subtitle: '05:31. O ônibus das 06:05 não espera faxineiro atrasado. Nem o Rogério.',
  },
  frame: {
    id: 'frame',
    prompt: '[E] Examinar o quadro',
    flag: 'frame_seen',
    note: {
      title: 'QUADRO',
      body: 'Você e sua mãe, num festival de bairro, dez anos atrás. A moldura quebrou na última mudança. Você nunca colou. Nunca jogou fora.',
    },
  },
  door_exit: {
    id: 'door_exit',
    prompt: '[E] Sair',
    mode: 'door',
    flag: 'left_home',
  },
}

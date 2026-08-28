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
    subtitle: '05:20. Se eu perder o ônibus das 06:05, o Rogério vai me matar. Vamos.',
    objective: 'Prepare-se: feche a torneira, tome café, pegue o crachá e o celular.',
  },
  faucet_bathroom: {
    id: 'faucet_bathroom',
    prompt: '[E] Fechar a torneira',
    flag: 'faucet_fixed',
    subtitle: 'De novo pingando... eu apertei isso ontem. Depois eu troco essa borracha.',
  },
  mirror: {
    id: 'mirror',
    prompt: '[E] Olhar-se no espelho',
    flag: 'mirror_seen',
    note: {
      title: 'VOCÊ',
      body: 'Bruno Paulon, 29 anos. Olheiras fundas, barba por fazer. Você parece mais cansado do que ontem. Talvez seja porque dormiu quatro horas.',
    },
  },
  shower: {
    id: 'shower',
    prompt: '[E] Tomar banho',
    mode: 'shower',
    flag: 'showered',
    subtitle: 'Gelada. Claro. Pelo menos acorda.',
  },
  fridge_note: {
    id: 'fridge_note',
    prompt: '[E] Ler o papel',
    flag: 'note_read',
    note: {
      title: 'ESCOLA TÉCNICA — NOTIFICAÇÃO',
      body: 'Prezado Sr. Paulon, infelizmente sua inscrição no CURSO DE VIGIA NOTURNO foi REPROVADA por frequência insuficiente. Agradecemos a preferência.',
    },
    afterNoteSubtitle: "'Frequência insuficiente'... trabalhar dois turnos e estudar à noite tinha que dar nisso.",
  },
  coffee: {
    id: 'coffee',
    prompt: '[E] Ligar a cafeteira',
    flag: 'coffee_made',
    subtitle: 'Finalmente. Forte demais... perfeito.',
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
      body: '05:24 — Sem mensagens. Bateria: 12%.',
    },
    afterNoteSubtitle: 'Doze por cento. Vai ter que durar o turno inteiro.',
  },
  window: {
    id: 'window',
    prompt: '[E] Olhar pela janela',
    mode: 'window',
    flag: 'window_seen',
    subtitle: 'Meridian Tower... quarenta andares. Hoje é o 37. Quanto antes eu entrar, antes eu saio.',
  },
  clock: {
    id: 'clock',
    prompt: '[E] Ver as horas',
    subtitle: '05:31. Tenho pouco mais de meia hora pro ônibus.',
  },
  frame: {
    id: 'frame',
    prompt: '[E] Examinar o quadro',
    flag: 'frame_seen',
    note: {
      title: 'QUADRO',
      body: 'Eu e a mãe, na festa do bairro. Dez anos atrás. A moldura quebrou na última mudança e eu nunca consertei.',
    },
  },
  door_exit: {
    id: 'door_exit',
    prompt: '[E] Sair',
    mode: 'door',
    flag: 'left_home',
  },
}

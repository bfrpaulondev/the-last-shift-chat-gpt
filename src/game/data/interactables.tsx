export interface InteractableDefinition {
  id: string
  prompt: string
  flag?: string
  subtitle?: string
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
    flag: 'awake',
    subtitle: 'Cinco e vinte da manhã. Último dia da semana, Bruno. Aguenta firme.',
    objective: 'Prepare-se: feche a torneira, tome café, pegue o crachá e o celular.',
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
}

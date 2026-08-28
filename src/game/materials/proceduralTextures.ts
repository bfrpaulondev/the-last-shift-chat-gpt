import * as THREE from 'three'

type TextureDraw = (context: CanvasRenderingContext2D, size: number) => void

function noise(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function canvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.anisotropy = 8
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

export function makeTexture(
  draw: TextureDraw,
  repeatX = 1,
  repeatY = 1,
  size = 512,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  draw(context, size)

  const texture = canvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  return texture
}

export function createWoodTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#302720'
    context.fillRect(0, 0, size, size)

    const plankHeight = 46
    for (let y = 0; y < size; y += plankHeight) {
      const tone = 43 + Math.floor(noise(y, 7) * 16)
      context.fillStyle = `rgb(${tone + 15}, ${tone + 4}, ${Math.max(0, tone - 5)})`
      context.fillRect(0, y + 2, size, plankHeight - 3)
      context.fillStyle = 'rgba(16, 10, 7, 0.62)'
      context.fillRect(0, y, size, 2)

      const offset = (Math.floor(y / plankHeight) % 2) * 88
      for (let x = offset; x < size; x += 176) {
        context.fillRect(x, y, 2, plankHeight)
      }

      for (let grain = 0; grain < 11; grain += 1) {
        const gy = y + 5 + noise(grain * 5, y) * (plankHeight - 10)
        context.strokeStyle = `rgba(27, 16, 11, ${0.06 + noise(y, grain) * 0.09})`
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(0, gy)
        for (let x = 0; x <= size; x += 24) {
          context.lineTo(x, gy + Math.sin((x + grain * 17) * 0.045) * 1.8)
        }
        context.stroke()
      }
    }

    for (let y = 0; y < size; y += 5) {
      for (let x = 0; x < size; x += 5) {
        const alpha = noise(x + 11, y + 19) * 0.045
        context.fillStyle = `rgba(238, 215, 176, ${alpha})`
        context.fillRect(x, y, 1, 1)
      }
    }
  }, 3.5, 3)
}

export function createWallTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#a7a49d'
    context.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 3) {
      for (let x = 0; x < size; x += 3) {
        const n = noise(x + 9, y + 3)
        const light = 148 + Math.floor(n * 24)
        context.fillStyle = `rgba(${light}, ${light}, ${light - 5}, 0.11)`
        context.fillRect(x, y, 3, 3)
      }
    }

    const crackX = size * 0.72
    context.strokeStyle = 'rgba(73, 69, 64, 0.19)'
    context.lineWidth = 1.4
    context.beginPath()
    context.moveTo(crackX, size * 0.05)
    context.lineTo(size * 0.68, size * 0.17)
    context.lineTo(size * 0.73, size * 0.29)
    context.lineTo(size * 0.7, size * 0.39)
    context.stroke()

    const damp = context.createRadialGradient(32, size - 36, 8, 32, size - 36, 138)
    damp.addColorStop(0, 'rgba(58, 67, 63, 0.26)')
    damp.addColorStop(0.55, 'rgba(58, 67, 63, 0.09)')
    damp.addColorStop(1, 'rgba(58, 67, 63, 0)')
    context.fillStyle = damp
    context.fillRect(0, 0, size, size)
  }, 2.5, 2)
}

export function createBathroomTileTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#c4beae'
    context.fillRect(0, 0, size, size)

    const divisions = 12
    const tile = size / divisions
    context.strokeStyle = '#6f6c65'
    context.lineWidth = 2

    for (let index = 0; index <= divisions; index += 1) {
      const position = Math.round(index * tile)
      context.beginPath()
      context.moveTo(position, 0)
      context.lineTo(position, size)
      context.stroke()
      context.beginPath()
      context.moveTo(0, position)
      context.lineTo(size, position)
      context.stroke()
    }

    for (let y = 0; y < divisions; y += 1) {
      for (let x = 0; x < divisions; x += 1) {
        const alpha = 0.018 + noise(x * 17, y * 23) * 0.035
        context.fillStyle = `rgba(255, 252, 238, ${alpha})`
        context.fillRect(x * tile + 3, y * tile + 3, tile - 6, tile - 6)
      }
    }

    context.strokeStyle = 'rgba(70, 64, 54, 0.52)'
    context.lineWidth = 1.2
    context.beginPath()
    context.moveTo(tile * 7.2, tile * 2)
    context.lineTo(tile * 7.55, tile * 2.45)
    context.lineTo(tile * 7.3, tile * 2.8)
    context.lineTo(tile * 7.7, tile * 3.25)
    context.stroke()
  }, 3, 3)
}

export function createCeilingTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#b5b2aa'
    context.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        const alpha = noise(x + 15, y + 21) * 0.045
        context.fillStyle = `rgba(63, 59, 52, ${alpha})`
        context.fillRect(x, y, 2, 2)
      }
    }

    const stain = context.createRadialGradient(size - 68, 72, 6, size - 68, 72, 122)
    stain.addColorStop(0, 'rgba(117, 85, 40, 0.38)')
    stain.addColorStop(0.42, 'rgba(128, 101, 50, 0.2)')
    stain.addColorStop(0.74, 'rgba(121, 98, 53, 0.07)')
    stain.addColorStop(1, 'rgba(121, 98, 53, 0)')
    context.fillStyle = stain
    context.fillRect(0, 0, size, size)
  }, 3.5, 3)
}

export function createLabelTexture(
  title: string,
  lines: string[],
  foreground = '#171b18',
  background = '#d2cfbb',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = foreground
  context.lineWidth = 7
  context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)
  context.fillStyle = foreground
  context.textBaseline = 'top'
  context.font = 'bold 44px monospace'
  context.fillText(title, 28, 28)
  context.font = '34px monospace'
  lines.forEach((line, index) => {
    context.fillText(line, 28, 96 + index * 48)
  })

  return canvasTexture(canvas)
}

export function createFridgeNoteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 960
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  const paper = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  paper.addColorStop(0, '#efe7cf')
  paper.addColorStop(0.55, '#ded2b3')
  paper.addColorStop(1, '#cbbd9e')
  context.fillStyle = paper
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let y = 0; y < canvas.height; y += 7) {
    const alpha = 0.018 + noise(y, 31) * 0.028
    context.fillStyle = `rgba(93, 70, 44, ${alpha})`
    context.fillRect(0, y, canvas.width, 2)
  }

  context.fillStyle = '#2b2b28'
  context.textAlign = 'center'
  context.font = '700 54px Arial, sans-serif'
  context.fillText('ESCOLA TÉCNICA', canvas.width / 2, 104)
  context.font = '700 34px Arial, sans-serif'
  context.fillText('NOTIFICAÇÃO', canvas.width / 2, 162)

  context.strokeStyle = '#514d45'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(78, 198)
  context.lineTo(canvas.width - 78, 198)
  context.stroke()

  const lines = [
    'Prezado Sr. Paulon,',
    '',
    'Sua inscrição no curso de',
    'VIGIA NOTURNO foi REPROVADA',
    'por frequência insuficiente.',
    '',
    'Agradecemos a preferência.',
  ]
  context.textAlign = 'left'
  lines.forEach((line, index) => {
    context.font = index === 3 ? '700 33px Arial, sans-serif' : '31px Arial, sans-serif'
    context.fillText(line, 78, 278 + index * 72)
  })

  context.fillStyle = '#5a5449'
  context.font = 'italic 24px Arial, sans-serif'
  context.fillText('Protocolo 05/2026 — Unidade Centro', 78, 858)

  context.strokeStyle = 'rgba(91, 70, 45, 0.25)'
  context.lineWidth = 5
  context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36)

  return canvasTexture(canvas)
}

export function createFamilyPhotoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 960
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  const sky = context.createLinearGradient(0, 0, 0, canvas.height)
  sky.addColorStop(0, '#d39a72')
  sky.addColorStop(0.42, '#9c6f67')
  sky.addColorStop(1, '#3f3b46')
  context.fillStyle = sky
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let index = 0; index < 22; index += 1) {
    const x = 40 + noise(index, 41) * 688
    const y = 90 + noise(index, 42) * 390
    const radius = 8 + noise(index, 43) * 20
    context.beginPath()
    context.fillStyle = `rgba(255, ${170 + Math.floor(noise(index, 44) * 65)}, 105, ${0.2 + noise(index, 45) * 0.35})`
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  context.fillStyle = 'rgba(28, 31, 36, 0.76)'
  context.fillRect(0, 690, canvas.width, 270)

  const drawPerson = (
    x: number,
    headY: number,
    scale: number,
    skin: string,
    shirt: string,
    hair: string,
  ) => {
    context.save()
    context.translate(x, 0)

    context.fillStyle = shirt
    context.beginPath()
    context.ellipse(0, headY + 220 * scale, 118 * scale, 168 * scale, 0, 0, Math.PI * 2)
    context.fill()

    context.fillStyle = skin
    context.beginPath()
    context.ellipse(0, headY, 69 * scale, 84 * scale, 0, 0, Math.PI * 2)
    context.fill()

    context.fillStyle = hair
    context.beginPath()
    context.ellipse(0, headY - 45 * scale, 74 * scale, 49 * scale, 0, Math.PI, Math.PI * 2)
    context.fill()

    context.fillStyle = '#30251f'
    context.beginPath()
    context.arc(-22 * scale, headY - 4 * scale, 5 * scale, 0, Math.PI * 2)
    context.arc(22 * scale, headY - 4 * scale, 5 * scale, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = 'rgba(91, 43, 35, 0.75)'
    context.lineWidth = 5 * scale
    context.beginPath()
    context.arc(0, headY + 22 * scale, 24 * scale, 0.18, Math.PI - 0.18)
    context.stroke()
    context.restore()
  }

  drawPerson(294, 470, 1.05, '#bd8469', '#82554c', '#3b2b28')
  drawPerson(474, 525, 0.82, '#a96f58', '#3f5668', '#2b2423')

  context.strokeStyle = '#bd8469'
  context.lineWidth = 34
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(345, 605)
  context.quadraticCurveTo(410, 660, 458, 625)
  context.stroke()

  const vignette = context.createRadialGradient(384, 460, 250, 384, 460, 610)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.38)')
  context.fillStyle = vignette
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = 'rgba(245, 235, 215, 0.72)'
  context.font = 'italic 24px Georgia, serif'
  context.fillText('Festival do bairro — 2016', 34, 920)

  return canvasTexture(canvas)
}

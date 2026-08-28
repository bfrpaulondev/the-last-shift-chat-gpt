import * as THREE from 'three'

type TextureDraw = (context: CanvasRenderingContext2D, size: number) => void

function noise(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function makeTexture(
  draw: TextureDraw,
  repeatX = 1,
  repeatY = 1,
  size = 128,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  draw(context, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.needsUpdate = true
  return texture
}

export function createWoodTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#352a25'
    context.fillRect(0, 0, size, size)

    const plankHeight = 16
    for (let y = 0; y < size; y += plankHeight) {
      const tone = 45 + Math.floor(noise(y, 7) * 18)
      context.fillStyle = `rgb(${tone + 14}, ${tone}, ${tone - 6})`
      context.fillRect(0, y + 1, size, plankHeight - 2)

      context.fillStyle = 'rgba(12, 8, 6, 0.55)'
      context.fillRect(0, y, size, 1)

      const offset = (Math.floor(y / plankHeight) % 2) * 32
      for (let x = offset; x < size; x += 64) {
        context.fillRect(x, y, 1, plankHeight)
      }
    }

    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const alpha = noise(x, y) * 0.12
        context.fillStyle = `rgba(245, 225, 190, ${alpha})`
        context.fillRect(x, y, 1, 1)
      }
    }
  }, 3.5, 3)
}

export function createWallTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#aaa79d'
    context.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const n = noise(x + 9, y + 3)
        const light = 150 + Math.floor(n * 24)
        context.fillStyle = `rgba(${light}, ${light}, ${light - 5}, 0.16)`
        context.fillRect(x, y, 2, 2)
      }
    }

    const gradient = context.createRadialGradient(8, size - 8, 2, 8, size - 8, 44)
    gradient.addColorStop(0, 'rgba(69, 75, 72, 0.32)')
    gradient.addColorStop(1, 'rgba(69, 75, 72, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }, 2.5, 2)
}

export function createBathroomTileTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#c7c1aa'
    context.fillRect(0, 0, size, size)

    const tile = size / 8
    context.strokeStyle = '#595a55'
    context.lineWidth = 2

    for (let index = 0; index <= 8; index += 1) {
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

    context.strokeStyle = 'rgba(66, 61, 52, 0.7)'
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(tile * 5.2, tile * 2)
    context.lineTo(tile * 5.55, tile * 2.45)
    context.lineTo(tile * 5.3, tile * 2.8)
    context.lineTo(tile * 5.65, tile * 3.2)
    context.stroke()
  }, 3, 3)
}

export function createCeilingTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#b8b5aa'
    context.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 3) {
      for (let x = 0; x < size; x += 3) {
        const alpha = noise(x + 15, y + 21) * 0.08
        context.fillStyle = `rgba(65, 61, 53, ${alpha})`
        context.fillRect(x, y, 2, 2)
      }
    }

    const stain = context.createRadialGradient(size - 18, 18, 2, size - 18, 18, 28)
    stain.addColorStop(0, 'rgba(135, 111, 55, 0.38)')
    stain.addColorStop(0.55, 'rgba(126, 103, 54, 0.18)')
    stain.addColorStop(1, 'rgba(126, 103, 54, 0)')
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
  canvas.width = 256
  canvas.height = 128

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = foreground
  context.lineWidth = 4
  context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)

  context.fillStyle = foreground
  context.textBaseline = 'top'
  context.font = 'bold 22px monospace'
  context.fillText(title, 14, 14)
  context.font = '18px monospace'
  lines.forEach((line, index) => {
    context.fillText(line, 14, 48 + index * 23)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

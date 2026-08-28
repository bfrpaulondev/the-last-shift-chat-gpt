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
  size = 256,
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
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.anisotropy = 4
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

export function createWoodTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#352a25'
    context.fillRect(0, 0, size, size)

    const plankHeight = 28
    for (let y = 0; y < size; y += plankHeight) {
      const tone = 43 + Math.floor(noise(y, 7) * 20)
      context.fillStyle = `rgb(${tone + 16}, ${tone + 1}, ${Math.max(0, tone - 8)})`
      context.fillRect(0, y + 2, size, plankHeight - 3)

      context.fillStyle = 'rgba(12, 8, 6, 0.68)'
      context.fillRect(0, y, size, 2)

      const offset = (Math.floor(y / plankHeight) % 2) * 56
      for (let x = offset; x < size; x += 112) {
        context.fillRect(x, y, 2, plankHeight)
      }

      for (let grain = 0; grain < 7; grain += 1) {
        const gy = y + 4 + noise(grain, y) * (plankHeight - 8)
        context.strokeStyle = `rgba(15, 9, 7, ${0.08 + noise(y, grain) * 0.12})`
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(0, gy)
        for (let x = 0; x <= size; x += 20) {
          context.lineTo(x, gy + Math.sin((x + grain * 13) * 0.055) * 2.2)
        }
        context.stroke()
      }
    }

    for (let y = 0; y < size; y += 3) {
      for (let x = 0; x < size; x += 3) {
        const alpha = noise(x, y) * 0.08
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
        const light = 148 + Math.floor(n * 30)
        context.fillStyle = `rgba(${light}, ${light}, ${light - 5}, 0.14)`
        context.fillRect(x, y, 2, 2)
      }
    }

    context.strokeStyle = 'rgba(74, 71, 67, 0.22)'
    context.lineWidth = 1.2
    context.beginPath()
    context.moveTo(size * 0.72, size * 0.06)
    context.lineTo(size * 0.68, size * 0.18)
    context.lineTo(size * 0.73, size * 0.29)
    context.lineTo(size * 0.69, size * 0.4)
    context.stroke()

    const gradient = context.createRadialGradient(16, size - 18, 4, 16, size - 18, 78)
    gradient.addColorStop(0, 'rgba(69, 75, 72, 0.34)')
    gradient.addColorStop(0.55, 'rgba(69, 75, 72, 0.12)')
    gradient.addColorStop(1, 'rgba(69, 75, 72, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }, 2.5, 2)
}

export function createBathroomTileTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#c7c1aa'
    context.fillRect(0, 0, size, size)

    const divisions = 10
    const tile = size / divisions
    context.strokeStyle = '#696a63'
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
        const alpha = 0.02 + noise(x * 17, y * 23) * 0.05
        context.fillStyle = `rgba(255, 255, 245, ${alpha})`
        context.fillRect(x * tile + 3, y * tile + 3, tile - 6, tile - 6)
      }
    }

    context.strokeStyle = 'rgba(66, 61, 52, 0.72)'
    context.lineWidth = 1.3
    context.beginPath()
    context.moveTo(tile * 6.2, tile * 2)
    context.lineTo(tile * 6.55, tile * 2.45)
    context.lineTo(tile * 6.3, tile * 2.8)
    context.lineTo(tile * 6.7, tile * 3.25)
    context.stroke()
  }, 3, 3)
}

export function createCeilingTexture(): THREE.CanvasTexture {
  return makeTexture((context, size) => {
    context.fillStyle = '#b8b5aa'
    context.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 3) {
      for (let x = 0; x < size; x += 3) {
        const alpha = noise(x + 15, y + 21) * 0.07
        context.fillStyle = `rgba(65, 61, 53, ${alpha})`
        context.fillRect(x, y, 2, 2)
      }
    }

    const stain = context.createRadialGradient(size - 34, 36, 3, size - 34, 36, 62)
    stain.addColorStop(0, 'rgba(124, 93, 43, 0.45)')
    stain.addColorStop(0.42, 'rgba(135, 111, 55, 0.25)')
    stain.addColorStop(0.74, 'rgba(126, 103, 54, 0.09)')
    stain.addColorStop(1, 'rgba(126, 103, 54, 0)')
    context.fillStyle = stain
    context.fillRect(0, 0, size, size)

    context.strokeStyle = 'rgba(93, 77, 43, 0.28)'
    context.lineWidth = 1.2
    context.beginPath()
    context.moveTo(size - 34, 36)
    context.lineTo(size - 71, 64)
    context.lineTo(size - 94, 92)
    context.stroke()
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

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.anisotropy = 4
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

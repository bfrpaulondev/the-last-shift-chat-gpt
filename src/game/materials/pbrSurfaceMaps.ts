import * as THREE from 'three'

type DataDraw = (context: CanvasRenderingContext2D, size: number) => void

function noise(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function makeDataTexture(
  draw: DataDraw,
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

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.NoColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.anisotropy = 8
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

function gray(value: number): string {
  const normalized = Math.max(0, Math.min(255, Math.round(value)))
  return `rgb(${normalized}, ${normalized}, ${normalized})`
}

function createWoodRoughness(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(182)
    context.fillRect(0, 0, size, size)

    const plankHeight = 46
    for (let y = 0; y < size; y += plankHeight) {
      context.fillStyle = gray(224)
      context.fillRect(0, y, size, 3)

      for (let x = 0; x < size; x += 4) {
        const value = 166 + noise(x * 0.7, y * 0.5) * 42
        context.fillStyle = gray(value)
        context.fillRect(x, y + 3, 4, plankHeight - 3)
      }
    }
  }, 3.5, 3)
}

function createWoodBump(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(128)
    context.fillRect(0, 0, size, size)

    const plankHeight = 46
    for (let y = 0; y < size; y += plankHeight) {
      context.fillStyle = gray(72)
      context.fillRect(0, y, size, 2)

      for (let grain = 0; grain < 14; grain += 1) {
        const gy = y + 5 + noise(grain * 9, y + 13) * (plankHeight - 10)
        context.strokeStyle = gray(118 + noise(grain, y) * 24)
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(0, gy)
        for (let x = 0; x <= size; x += 20) {
          context.lineTo(x, gy + Math.sin((x + grain * 19) * 0.04) * 1.8)
        }
        context.stroke()
      }
    }
  }, 3.5, 3)
}

function createWallRoughness(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        const value = 205 + noise(x + 23, y + 17) * 38
        context.fillStyle = gray(value)
        context.fillRect(x, y, 4, 4)
      }
    }

    const damp = context.createRadialGradient(42, size - 54, 10, 42, size - 54, 150)
    damp.addColorStop(0, gray(142))
    damp.addColorStop(0.45, gray(178))
    damp.addColorStop(1, 'rgba(230,230,230,0)')
    context.fillStyle = damp
    context.fillRect(0, 0, size, size)
  }, 2.5, 2)
}

function createWallBump(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(128)
    context.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 3) {
      for (let x = 0; x < size; x += 3) {
        context.fillStyle = gray(112 + noise(x * 1.7, y * 1.3) * 32)
        context.fillRect(x, y, 3, 3)
      }
    }

    context.strokeStyle = gray(82)
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(size * 0.72, size * 0.05)
    context.lineTo(size * 0.68, size * 0.17)
    context.lineTo(size * 0.73, size * 0.29)
    context.lineTo(size * 0.7, size * 0.39)
    context.stroke()
  }, 2.5, 2)
}

function createTileRoughness(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(118)
    context.fillRect(0, 0, size, size)

    const divisions = 12
    const tile = size / divisions
    context.fillStyle = gray(225)
    for (let index = 0; index <= divisions; index += 1) {
      const position = Math.round(index * tile)
      context.fillRect(position - 2, 0, 4, size)
      context.fillRect(0, position - 2, size, 4)
    }

    for (let y = 0; y < divisions; y += 1) {
      for (let x = 0; x < divisions; x += 1) {
        const variation = 105 + noise(x * 17, y * 23) * 35
        context.fillStyle = gray(variation)
        context.fillRect(x * tile + 5, y * tile + 5, tile - 10, tile - 10)
      }
    }
  }, 3, 3)
}

function createTileBump(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(146)
    context.fillRect(0, 0, size, size)

    const divisions = 12
    const tile = size / divisions
    context.fillStyle = gray(72)
    for (let index = 0; index <= divisions; index += 1) {
      const position = Math.round(index * tile)
      context.fillRect(position - 2, 0, 4, size)
      context.fillRect(0, position - 2, size, 4)
    }
  }, 3, 3)
}

function createBrushedMetalRoughness(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(104)
    context.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 2) {
      const value = 82 + noise(y, 91) * 58
      context.fillStyle = gray(value)
      context.fillRect(0, y, size, 1)
    }

    for (let index = 0; index < 18; index += 1) {
      const x = Math.floor(noise(index, 33) * size)
      context.fillStyle = gray(160 + noise(index, 44) * 38)
      context.fillRect(x, 0, 1, size)
    }
  }, 1.8, 1.8)
}

function createApplianceRoughness(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(132)
    context.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 3) {
      for (let x = 0; x < size; x += 3) {
        const value = 112 + noise(x + 61, y + 27) * 50
        context.fillStyle = gray(value)
        context.fillRect(x, y, 3, 3)
      }
    }

    for (let index = 0; index < 36; index += 1) {
      const x = noise(index, 17) * size
      const y = noise(index, 29) * size
      context.strokeStyle = gray(190)
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + 18 + noise(index, 31) * 44, y + 2)
      context.stroke()
    }
  }, 1.4, 1.4)
}

function createFabricRoughness(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(224)
    context.fillRect(0, 0, size, size)

    context.strokeStyle = gray(194)
    context.lineWidth = 1
    for (let offset = 0; offset < size; offset += 6) {
      context.beginPath()
      context.moveTo(offset, 0)
      context.lineTo(offset, size)
      context.stroke()
      context.beginPath()
      context.moveTo(0, offset)
      context.lineTo(size, offset)
      context.stroke()
    }
  }, 2, 2)
}

function createFabricBump(): THREE.CanvasTexture {
  return makeDataTexture((context, size) => {
    context.fillStyle = gray(126)
    context.fillRect(0, 0, size, size)

    context.strokeStyle = gray(144)
    context.lineWidth = 1
    for (let offset = 0; offset < size; offset += 6) {
      context.beginPath()
      context.moveTo(offset, 0)
      context.lineTo(offset, size)
      context.stroke()
      context.beginPath()
      context.moveTo(0, offset)
      context.lineTo(size, offset)
      context.stroke()
    }
  }, 2, 2)
}

export interface PbrSurfaceMaps {
  woodRoughness: THREE.CanvasTexture
  woodBump: THREE.CanvasTexture
  wallRoughness: THREE.CanvasTexture
  wallBump: THREE.CanvasTexture
  tileRoughness: THREE.CanvasTexture
  tileBump: THREE.CanvasTexture
  brushedMetalRoughness: THREE.CanvasTexture
  applianceRoughness: THREE.CanvasTexture
  fabricRoughness: THREE.CanvasTexture
  fabricBump: THREE.CanvasTexture
}

export function createPbrSurfaceMaps(): PbrSurfaceMaps {
  return {
    woodRoughness: createWoodRoughness(),
    woodBump: createWoodBump(),
    wallRoughness: createWallRoughness(),
    wallBump: createWallBump(),
    tileRoughness: createTileRoughness(),
    tileBump: createTileBump(),
    brushedMetalRoughness: createBrushedMetalRoughness(),
    applianceRoughness: createApplianceRoughness(),
    fabricRoughness: createFabricRoughness(),
    fabricBump: createFabricBump(),
  }
}

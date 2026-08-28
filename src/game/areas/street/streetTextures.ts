import * as THREE from 'three'

function canvasTexture(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }
  return [canvas, context]
}

function finalize(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.anisotropy = 8
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

export function createPortuguesePavementTexture(): THREE.CanvasTexture {
  const [canvas, context] = canvasTexture(768, 768)
  context.fillStyle = '#777a79'
  context.fillRect(0, 0, 768, 768)

  const cell = 42
  for (let y = -cell; y < 768 + cell; y += cell) {
    for (let x = -cell; x < 768 + cell; x += cell) {
      const row = Math.floor(y / cell)
      const offset = row % 2 === 0 ? 0 : cell * 0.48
      const px = x + offset
      const seed = Math.abs(Math.sin((px + 91) * 12.9898 + (y + 37) * 78.233))
      const shade = 112 + Math.floor(seed * 34)
      context.save()
      context.translate(px + cell / 2, y + cell / 2)
      context.rotate((seed - 0.5) * 0.16)
      context.fillStyle = `rgb(${shade},${shade + 2},${shade + 1})`
      context.strokeStyle = 'rgba(37,39,39,0.74)'
      context.lineWidth = 4
      context.beginPath()
      context.roundRect(-17, -15, 34, 30, 5)
      context.fill()
      context.stroke()
      context.restore()
    }
  }

  const image = context.getImageData(0, 0, 768, 768)
  for (let i = 0; i < image.data.length; i += 4) {
    const grain = Math.floor((Math.random() - 0.5) * 13)
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + grain))
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + grain))
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + grain))
  }
  context.putImageData(image, 0, 0)
  return finalize(canvas, 4, 7)
}

export function createRoute214Texture(): THREE.CanvasTexture {
  const [canvas, context] = canvasTexture(768, 1024)
  const gradient = context.createLinearGradient(0, 0, 0, 1024)
  gradient.addColorStop(0, '#e7e1d2')
  gradient.addColorStop(1, '#cfc8b8')
  context.fillStyle = gradient
  context.fillRect(0, 0, 768, 1024)

  context.fillStyle = '#142129'
  context.fillRect(0, 0, 768, 155)
  context.fillStyle = '#f4f2ea'
  context.font = '700 76px sans-serif'
  context.fillText('LINHA 214', 48, 103)

  context.fillStyle = '#27333a'
  context.font = '600 31px sans-serif'
  context.fillText('BAIRRO NORTE  →  AV. MERIDIAN', 48, 215)

  const times = ['05:20', '05:35', '05:50', '06:05', '06:20', '06:35']
  context.font = '600 52px monospace'
  times.forEach((time, index) => {
    const y = 330 + index * 100
    if (time === '06:05') {
      context.fillStyle = '#c5a83d'
      context.fillRect(34, y - 63, 700, 82)
      context.fillStyle = '#141617'
      context.fillText(`${time}   MERIDIAN`, 70, y)
    } else {
      context.fillStyle = '#33393b'
      context.fillText(`${time}   MERIDIAN`, 70, y)
    }
  })

  context.strokeStyle = 'rgba(42,47,48,0.28)'
  context.lineWidth = 2
  for (let y = 270; y < 930; y += 100) {
    context.beginPath()
    context.moveTo(38, y)
    context.lineTo(730, y)
    context.stroke()
  }

  context.fillStyle = '#5e625e'
  context.font = '24px sans-serif'
  context.fillText('Horários sujeitos ao trânsito e à chuva.', 48, 980)
  return finalize(canvas)
}

export function createCorvusFlyerTexture(): THREE.CanvasTexture {
  const [canvas, context] = canvasTexture(640, 880)
  context.fillStyle = '#d8d3c4'
  context.fillRect(0, 0, 640, 880)

  context.fillStyle = '#252b28'
  context.fillRect(0, 0, 640, 150)
  context.fillStyle = '#dce5c8'
  context.font = '800 52px sans-serif'
  context.fillText('CORVUS', 50, 82)
  context.font = '600 24px sans-serif'
  context.fillText('FACILITY GROUP', 52, 119)

  context.fillStyle = '#222523'
  context.font = '800 45px sans-serif'
  context.fillText('AUX. DE LIMPEZA', 44, 240)
  context.font = '600 28px sans-serif'
  context.fillText('Turnos flexíveis • início imediato', 44, 305)
  context.fillText('Prédios corporativos e logística', 44, 350)

  context.fillStyle = '#4e564e'
  context.font = '25px sans-serif'
  context.fillText('“Você cuida do que ninguém vê.”', 44, 450)

  context.strokeStyle = '#7d836f'
  context.lineWidth = 3
  context.strokeRect(42, 520, 556, 130)
  context.fillStyle = '#323733'
  context.font = '700 30px monospace'
  context.fillText('CANDIDATURAS', 72, 572)
  context.font = '25px monospace'
  context.fillText('corvus-facility / vagas', 72, 615)

  context.fillStyle = 'rgba(86,77,63,0.22)'
  for (let i = 0; i < 38; i += 1) {
    const x = (i * 157) % 610
    const y = 170 + ((i * 223) % 680)
    context.beginPath()
    context.arc(x, y, 3 + (i % 5), 0, Math.PI * 2)
    context.fill()
  }

  return finalize(canvas)
}

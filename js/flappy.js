function novoElemento(tagName, className) {
  const elem = document.createElement(tagName)
  elem.className = className
  return elem
}

function Barreira(reversa = false, tema) {
  const temaInicial = tema
  this.elemento = novoElemento('div', 'barreira')

  const borda = novoElemento('div', `borda inferno`)
  const corpo = novoElemento('div', `corpo inferno`)
  this.elemento.appendChild(reversa ? corpo : borda)
  this.elemento.appendChild(reversa ? borda : corpo)

  this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBareiras(altura, abertura, x) {
  this.elemento = novoElemento('div', 'par-de-barreiras')

  this.superior = new Barreira(true)
  this.inferior = new Barreira(false)

  this.elemento.appendChild(this.superior.elemento)
  this.elemento.appendChild(this.inferior.elemento)

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura)
    const alturaInferior = altura - abertura - alturaSuperior
    this.superior.setAltura(alturaSuperior)
    this.inferior.setAltura(alturaInferior)
  }

  this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
  this.setX = x => this.elemento.style.left = `${x}px`
  this.getLargura = () => this.elemento.clientWidth

  this.sortearAbertura()
  this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  this.pares = [
    new ParDeBareiras(altura, abertura, largura),
    new ParDeBareiras(altura, abertura, largura + espaco),
    new ParDeBareiras(altura, abertura, largura + espaco * 2),
    new ParDeBareiras(altura, abertura, largura + espaco * 3),
  ]

  let deslocamento = 5
  this.animar = () => {
    this.pares.forEach(par => {
      par.setX(par.getX() - deslocamento)

      // quando o elemento sair da tela do jogo
      if (par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * this.pares.length)
        par.sortearAbertura()
      }

      const meio = largura / 2
      const cruzouOMeio = par.getX() + deslocamento >= meio
        && par.getX() < meio        
      if(cruzouOMeio) notificarPonto()
    })
  }
  setInterval(() => {
    if(deslocamento <= 7) deslocamento += 0.15
  }, 10000)
}

function Passaro(alturaJogo) {
  let voando = false
  
  this.elemento = novoElemento('img', 'passaro')
  this.elemento.src = 'img/passaro.png'

  this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
  this.setY = y => this.elemento.style.bottom = `${y}px`

  window.onkeydown = e => voando = true
  window.ontouchstart = e => voando = true
  window.onmousedown = e => voando = true
  window.onkeyup = e => voando = false
  window.ontouchend = e => voando = false
  window.onmouseup = e => voando = false

  this.animar = () => {
    const up = window.innerWidth < 800 ? 5 : 6
    const down = -5
    const novoY = this.getY() + (voando ? up : down)
    const alturaMaxima = alturaJogo - this.elemento.clientHeight

    if(novoY <= 0) {
      this.setY(0)
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima)
    } else {
      this.setY(novoY)
    }
  }

  this.setY(alturaJogo / 2)
}

function Progresso() {
  this.elemento = novoElemento('span', 'progresso')
  this.atualizarPontos = pontos => {
    this.elemento.innerHTML = pontos
  }
  this.atualizarPontos(0)  
}

function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect()
  const b = elementoB.getBoundingClientRect()

  const horizontal = a.left + a.width >= b.left
    && b.left + b.width >=a.left
  
  const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top

  return horizontal && vertical
}

function colidiu(passaro, barreiras) {
  let colidiu = false
  barreiras.pares.forEach(parDeBareiras => {
    if(!colidiu) {
      const superior = parDeBareiras.superior.elemento
      const inferior = parDeBareiras.inferior.elemento
      colidiu = estaoSobrepostos(passaro.elemento, superior) 
      || estaoSobrepostos(passaro.elemento, inferior)
    }
  })
  return colidiu
}

function FlappyBird() {
  let pontos = 0

  const areaDoJogo = document.querySelector('.flappy')
  const altura = areaDoJogo.clientHeight
  const largura = areaDoJogo.clientWidth
  const espacamento = window.innerWidth < 800 ? 180 : 210

  const progresso = new Progresso
  const barreiras = new Barreiras(altura, largura, espacamento, 320,
    () => progresso.atualizarPontos(++pontos))
  
  const passaro = new Passaro(altura)

  areaDoJogo.appendChild(progresso.elemento)
  areaDoJogo.appendChild(passaro.elemento)
  barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

  this.start = () => {
    // loop do jogo
    const temporizador = setInterval(() => {
      barreiras.animar()
      passaro.animar()

      if(colidiu(passaro, barreiras)) {
        clearInterval(temporizador)
      }
    }, 20)
  }
}

setTimeout(() => {
  new FlappyBird().start()
}, 1500)

// const barreiras = new Barreiras(480, 800, 200, 320)
// const passaro = new Passaro(480)
// const areaDoJogo = document.querySelector('.flappy')
// areaDoJogo.appendChild(passaro.elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//   barreiras.animar()
//   passaro.animar()
// }, 20)
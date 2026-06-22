const botaoIniciar = document.querySelector("#botaoIniciar");
const dificuldadeAlvo = document.querySelector("#dificuldadeAlvo");
const tabuleiro = document.querySelector("#tabuleiro");
const alvo = document.querySelector("#alvo");
const mira = document.querySelector("#mira");
const arqueiro = document.querySelector("#arqueiro");
const flecha = document.querySelector("#flecha");
const pontosElemento = document.querySelector("#pontos");
const tempoElemento = document.querySelector("#tempo");
const recordeElemento = document.querySelector("#recorde");
const mensagemJogo = document.querySelector("#mensagemJogo");

let pontos = 0;
let tempo = 20;
let recorde = Number(localStorage.getItem("playzone-recorde")) || 0;
let intervalo = null;
let jogando = false;
let alvoConfig = null;
let alvoAnimacao = null;
let alvoX = 0;
let alvoY = 0;
let alvoVelocidadeX = 2;
let alvoVelocidadeY = 1.4;
let mouseX = 0;
let mouseY = 0;
let flechaVoando = false;

const dificuldadesAlvo = {
  facil: { tempo: 25, tamanho: 86, velocidade: 1.4, nome: "facil" },
  medio: { tempo: 20, tamanho: 72, velocidade: 2.2, nome: "medio" },
  dificil: { tempo: 15, tamanho: 54, velocidade: 3.2, nome: "dificil" }
};

recordeElemento.textContent = recorde;

function posicionarAlvo() {
  alvo.style.left = `${alvoX}px`;
  alvo.style.top = `${alvoY}px`;
}

function prepararAlvo() {
  const area = tabuleiro.getBoundingClientRect();
  const tamanhoAlvo = alvoConfig ? alvoConfig.tamanho : alvo.offsetWidth || 72;
  alvoX = Math.max(area.width * 0.7, tamanhoAlvo);
  alvoY = Math.max(area.height * 0.35, tamanhoAlvo);
  alvoVelocidadeX = alvoConfig.velocidade;
  alvoVelocidadeY = alvoConfig.velocidade * 0.72;
  posicionarAlvo();
}

function animarAlvo() {
  if (!jogando) {
    return;
  }

  const area = tabuleiro.getBoundingClientRect();
  const raio = alvoConfig.tamanho / 2;
  alvoX += alvoVelocidadeX;
  alvoY += alvoVelocidadeY;

  if (alvoX < raio || alvoX > area.width - raio) {
    alvoVelocidadeX *= -1;
    alvoX = Math.min(Math.max(alvoX, raio), area.width - raio);
  }

  if (alvoY < raio || alvoY > area.height - raio) {
    alvoVelocidadeY *= -1;
    alvoY = Math.min(Math.max(alvoY, raio), area.height - raio);
  }

  posicionarAlvo();
  alvoAnimacao = requestAnimationFrame(animarAlvo);
}

function atualizarMira(x, y) {
  mouseX = x;
  mouseY = y;
  mira.style.left = `${mouseX}px`;
  mira.style.top = `${mouseY}px`;

  const origem = obterOrigemFlecha();
  const angulo = Math.atan2(mouseY - origem.y, mouseX - origem.x);
  arqueiro.style.setProperty("--angulo", `${angulo}rad`);
}

function obterOrigemFlecha() {
  return {
    x: 48,
    y: tabuleiro.clientHeight - 50
  };
}

function dispararFlecha(destinoX, destinoY) {
  if (!jogando || flechaVoando) {
    return;
  }

  flechaVoando = true;
  const origem = obterOrigemFlecha();
  const distanciaX = destinoX - origem.x;
  const distanciaY = destinoY - origem.y;
  const distancia = Math.hypot(distanciaX, distanciaY);
  const angulo = Math.atan2(distanciaY, distanciaX);
  const acertou = Math.hypot(destinoX - alvoX, destinoY - alvoY) <= alvoConfig.tamanho / 2;

  flecha.style.left = `${origem.x}px`;
  flecha.style.top = `${origem.y}px`;
  flecha.style.width = `${Math.max(distancia, 80)}px`;
  flecha.style.transform = `rotate(${angulo}rad) scaleX(0.05)`;
  flecha.classList.add("voando");
  mensagemJogo.textContent = acertou ? "Flecha disparada no alvo." : "A flecha passou longe.";

  requestAnimationFrame(() => {
    flecha.style.transform = `rotate(${angulo}rad) scaleX(1)`;
  });

  setTimeout(() => {
    flecha.classList.remove("voando");
    flecha.style.transform = `rotate(${angulo}rad) scaleX(0.05)`;
    flechaVoando = false;

    if (!jogando) {
      return;
    }

    if (acertou) {
      pontos += 1;
      pontosElemento.textContent = pontos;
      alvo.classList.add("acertado");
      mensagemJogo.textContent = `Acertou: ${pontos} pontos.`;

      setTimeout(() => {
        alvo.classList.remove("acertado");
      }, 180);

      return;
    }

    mensagemJogo.textContent = "Continue mirando no alvo em movimento.";
  }, 260);
}

function finalizarPartida() {
  jogando = false;
  clearInterval(intervalo);
  cancelAnimationFrame(alvoAnimacao);
  intervalo = null;
  alvoAnimacao = null;
  flechaVoando = false;
  tabuleiro.classList.remove("ativo");
  flecha.classList.remove("voando");
  botaoIniciar.disabled = false;
  dificuldadeAlvo.disabled = false;
  botaoIniciar.textContent = "Jogar novamente";

  if (pontos > recorde) {
    recorde = pontos;
    localStorage.setItem("playzone-recorde", String(recorde));
    recordeElemento.textContent = recorde;
    mensagemJogo.textContent = `Novo recorde: ${pontos} pontos.`;
    return;
  }

  mensagemJogo.textContent = `Fim de jogo: ${pontos} pontos.`;
}

function iniciarPartida() {
  alvoConfig = dificuldadesAlvo[dificuldadeAlvo.value];
  pontos = 0;
  tempo = alvoConfig.tempo;
  jogando = true;
  flechaVoando = false;
  pontosElemento.textContent = pontos;
  tempoElemento.textContent = tempo;
  mensagemJogo.textContent = `Modo ${alvoConfig.nome}: mova o mouse para mirar e clique no alvo.`;
  botaoIniciar.disabled = true;
  dificuldadeAlvo.disabled = true;
  botaoIniciar.textContent = "Partida em andamento";
  alvo.style.width = `${alvoConfig.tamanho}px`;
  alvo.style.height = `${alvoConfig.tamanho}px`;
  tabuleiro.classList.add("ativo");
  atualizarMira(105, tabuleiro.clientHeight - 82);
  prepararAlvo();
  cancelAnimationFrame(alvoAnimacao);
  alvoAnimacao = requestAnimationFrame(animarAlvo);

  intervalo = setInterval(() => {
    tempo -= 1;
    tempoElemento.textContent = tempo;

    if (tempo <= 0) {
      finalizarPartida();
    }
  }, 1000);
}

botaoIniciar.addEventListener("click", iniciarPartida);

tabuleiro.addEventListener("mousemove", (evento) => {
  if (!jogando) {
    return;
  }

  const area = tabuleiro.getBoundingClientRect();
  atualizarMira(evento.clientX - area.left, evento.clientY - area.top);
});

tabuleiro.addEventListener("click", (evento) => {
  if (!jogando) {
    return;
  }

  const area = tabuleiro.getBoundingClientRect();
  dispararFlecha(evento.clientX - area.left, evento.clientY - area.top);
});

window.addEventListener("resize", () => {
  if (jogando) {
    prepararAlvo();
  }
});

const botaoTurbo = document.querySelector("#botaoTurbo");
const dificuldadeTurbo = document.querySelector("#dificuldadeTurbo");
const pista = document.querySelector("#pista");
const carro = document.querySelector("#carro");
const obstaculo = document.querySelector("#obstaculo");
const turboPontosElemento = document.querySelector("#turboPontos");
const turboTempoElemento = document.querySelector("#turboTempo");
const turboRecordeElemento = document.querySelector("#turboRecorde");
const mensagemTurbo = document.querySelector("#mensagemTurbo");
const controlesCorrida = document.querySelectorAll("[data-direcao]");

const pistas = [25, 50, 75];
let turboAtivo = false;
let turboPontos = 0;
let turboTempo = 30;
let turboRecorde = Number(localStorage.getItem("playzone-turbo-recorde")) || 0;
let turboIntervalo = null;
let turboRelogio = null;
let carroPista = 1;
let obstaculoPista = 1;
let obstaculoY = -120;
let turboConfig = null;

const dificuldadesTurbo = {
  facil: { tempo: 35, velocidade: 6, intervalo: 70, pontos: 1, nome: "facil" },
  medio: { tempo: 30, velocidade: 8, intervalo: 60, pontos: 1, nome: "medio" },
  dificil: { tempo: 25, velocidade: 11, intervalo: 45, pontos: 2, nome: "dificil" }
};

turboRecordeElemento.textContent = turboRecorde;

function posicionarCarro() {
  carro.style.left = `${pistas[carroPista]}%`;
}

function novoObstaculo() {
  obstaculoPista = Math.floor(Math.random() * pistas.length);
  obstaculoY = -120;
  obstaculo.style.left = `${pistas[obstaculoPista]}%`;
  obstaculo.style.top = `${obstaculoY}px`;
}

function moverCarro(direcao) {
  if (!turboAtivo) {
    return;
  }

  if (direcao === "esquerda") {
    carroPista = Math.max(carroPista - 1, 0);
  }

  if (direcao === "direita") {
    carroPista = Math.min(carroPista + 1, pistas.length - 1);
  }

  posicionarCarro();
}

function finalizarTurbo(texto) {
  turboAtivo = false;
  clearInterval(turboIntervalo);
  clearInterval(turboRelogio);
  turboIntervalo = null;
  turboRelogio = null;
  pista.classList.remove("ativo");
  botaoTurbo.disabled = false;
  dificuldadeTurbo.disabled = false;
  botaoTurbo.textContent = "Jogar novamente";

  if (turboPontos > turboRecorde) {
    turboRecorde = turboPontos;
    localStorage.setItem("playzone-turbo-recorde", String(turboRecorde));
    turboRecordeElemento.textContent = turboRecorde;
    mensagemTurbo.textContent = `Novo recorde: ${turboPontos} pontos.`;
    return;
  }

  mensagemTurbo.textContent = texto;
}

function atualizarTurbo() {
  const alturaPista = pista.clientHeight;
  obstaculoY += turboConfig.velocidade;
  obstaculo.style.top = `${obstaculoY}px`;

  if (obstaculoY > alturaPista - 135 && obstaculoY < alturaPista - 35 && obstaculoPista === carroPista) {
    finalizarTurbo(`Voce bateu com ${turboPontos} pontos.`);
    return;
  }

  if (obstaculoY > alturaPista + 20) {
    turboPontos += turboConfig.pontos;
    turboPontosElemento.textContent = turboPontos;
    novoObstaculo();
  }
}

function iniciarTurbo() {
  turboConfig = dificuldadesTurbo[dificuldadeTurbo.value];
  turboAtivo = true;
  turboPontos = 0;
  turboTempo = turboConfig.tempo;
  carroPista = 1;
  turboPontosElemento.textContent = turboPontos;
  turboTempoElemento.textContent = turboTempo;
  mensagemTurbo.textContent = `Modo ${turboConfig.nome}: desvie dos obstaculos.`;
  botaoTurbo.disabled = true;
  dificuldadeTurbo.disabled = true;
  botaoTurbo.textContent = "Corrida em andamento";
  pista.classList.add("ativo");
  posicionarCarro();
  novoObstaculo();

  turboIntervalo = setInterval(atualizarTurbo, turboConfig.intervalo);
  turboRelogio = setInterval(() => {
    turboTempo -= 1;
    turboTempoElemento.textContent = turboTempo;

    if (turboTempo <= 0) {
      finalizarTurbo(`Corrida finalizada: ${turboPontos} pontos.`);
    }
  }, 1000);
}

botaoTurbo.addEventListener("click", iniciarTurbo);

controlesCorrida.forEach((botao) => {
  botao.addEventListener("click", () => moverCarro(botao.dataset.direcao));
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "ArrowLeft") {
    moverCarro("esquerda");
  }

  if (evento.key === "ArrowRight") {
    moverCarro("direita");
  }
});

const botaoMemoria = document.querySelector("#botaoMemoria");
const dificuldadeMemoria = document.querySelector("#dificuldadeMemoria");
const gradeMemoria = document.querySelector("#gradeMemoria");
const memoriaMovimentosElemento = document.querySelector("#memoriaMovimentos");
const memoriaParesElemento = document.querySelector("#memoriaPares");
const memoriaRecordeElemento = document.querySelector("#memoriaRecorde");
const mensagemMemoria = document.querySelector("#mensagemMemoria");

const cartasPorDificuldade = {
  facil: { cartas: ["A", "B", "C", "D"], tempo: 1000, colunas: 4, nome: "facil" },
  medio: { cartas: ["A", "B", "C", "D", "E", "F"], tempo: 800, colunas: 4, nome: "medio" },
  dificil: { cartas: ["A", "B", "C", "D", "E", "F", "G", "H"], tempo: 600, colunas: 4, nome: "dificil" }
};
let cartasMemoria = [];
let cartasAbertas = [];
let paresEncontrados = 0;
let movimentos = 0;
let memoriaBloqueada = false;
let memoriaRecorde = Number(localStorage.getItem("playzone-memoria-recorde")) || 0;
let memoriaConfig = cartasPorDificuldade.medio;

memoriaRecordeElemento.textContent = memoriaRecorde || "-";

function embaralhar(lista) {
  return [...lista].sort(() => Math.random() - 0.5);
}

function atualizarMemoria() {
  memoriaMovimentosElemento.textContent = movimentos;
  memoriaParesElemento.textContent = `${paresEncontrados}/${memoriaConfig.cartas.length}`;
}

function desenharMemoria() {
  gradeMemoria.innerHTML = "";

  cartasMemoria.forEach((carta, indice) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "carta-memoria";
    botao.dataset.indice = String(indice);
    botao.textContent = carta.revelada || carta.encontrada ? carta.valor : "?";
    botao.disabled = carta.encontrada;

    if (carta.revelada) {
      botao.classList.add("revelada");
    }

    if (carta.encontrada) {
      botao.classList.add("encontrada");
    }

    botao.addEventListener("click", () => revelarCarta(indice));
    gradeMemoria.appendChild(botao);
  });
}

function finalizarMemoria() {
  mensagemMemoria.textContent = `Voce venceu com ${movimentos} movimentos.`;

  if (memoriaRecorde === 0 || movimentos < memoriaRecorde) {
    memoriaRecorde = movimentos;
    localStorage.setItem("playzone-memoria-recorde", String(memoriaRecorde));
    memoriaRecordeElemento.textContent = memoriaRecorde;
    mensagemMemoria.textContent = `Novo melhor jogo: ${movimentos} movimentos.`;
  }
}

function revelarCarta(indice) {
  if (memoriaBloqueada || cartasMemoria[indice].revelada || cartasMemoria[indice].encontrada) {
    return;
  }

  cartasMemoria[indice].revelada = true;
  cartasAbertas.push(indice);
  desenharMemoria();

  if (cartasAbertas.length < 2) {
    return;
  }

  movimentos += 1;
  atualizarMemoria();

  const [primeira, segunda] = cartasAbertas;
  const acertou = cartasMemoria[primeira].valor === cartasMemoria[segunda].valor;

  if (acertou) {
    cartasMemoria[primeira].encontrada = true;
    cartasMemoria[segunda].encontrada = true;
    cartasAbertas = [];
    paresEncontrados += 1;
    mensagemMemoria.textContent = "Par encontrado.";
    atualizarMemoria();
    desenharMemoria();

    if (paresEncontrados === memoriaConfig.cartas.length) {
      finalizarMemoria();
    }

    return;
  }

  memoriaBloqueada = true;
  mensagemMemoria.textContent = "Tente outro par.";

  setTimeout(() => {
    cartasMemoria[primeira].revelada = false;
    cartasMemoria[segunda].revelada = false;
    cartasAbertas = [];
    memoriaBloqueada = false;
    desenharMemoria();
  }, memoriaConfig.tempo);
}

function iniciarMemoria() {
  memoriaConfig = cartasPorDificuldade[dificuldadeMemoria.value];
  gradeMemoria.style.gridTemplateColumns = `repeat(${memoriaConfig.colunas}, minmax(4rem, 1fr))`;
  cartasMemoria = embaralhar([...memoriaConfig.cartas, ...memoriaConfig.cartas]).map((valor) => ({
    valor,
    revelada: false,
    encontrada: false
  }));
  cartasAbertas = [];
  paresEncontrados = 0;
  movimentos = 0;
  memoriaBloqueada = false;
  mensagemMemoria.textContent = `Modo ${memoriaConfig.nome}: encontre todos os pares.`;
  atualizarMemoria();
  desenharMemoria();
}

botaoMemoria.addEventListener("click", iniciarMemoria);
iniciarMemoria();

const selecaoFutebol = document.querySelector("#selecaoFutebol");
const botaoCopa = document.querySelector("#botaoCopa");
const faseCopaElemento = document.querySelector("#faseCopa");
const placarCopaElemento = document.querySelector("#placarCopa");
const turnoCopaElemento = document.querySelector("#turnoCopa");
const listaFases = document.querySelector("#listaFases");
const grupoCopa = document.querySelector("#grupoCopa");
const campoPenalti = document.querySelector(".campo-penalti");
const zonasGol = document.querySelectorAll(".zona-gol");
const goleiro = document.querySelector("#goleiro");
const bola = document.querySelector("#bola");
const mensagemCopa = document.querySelector("#mensagemCopa");

const selecoesCopa = [
  "Brasil",
  "Argentina",
  "Franca",
  "Alemanha",
  "Espanha",
  "Portugal",
  "Inglaterra",
  "Italia",
  "Uruguai",
  "Japao",
  "Mexico",
  "Holanda",
  "Croacia",
  "Marrocos",
  "Estados Unidos",
  "Coreia"
];

const fasesCopa = ["Grupo", "Oitavas", "Quartas", "Semifinal", "Final"];
const posicoesGol = {
  esquerda: "18%",
  centro: "50%",
  direita: "82%"
};

let copaAtiva = false;
let selecaoJogador = selecoesCopa[0];
let adversariosCopa = [];
let faseIndice = 0;
let rodadaGrupo = 0;
let pontosGrupo = 0;
let penaltisJogador = 0;
let penaltisRival = 0;
let cobrancaAtual = 1;
let vezCopa = "chute";
let selecaoRival = "";
let interacaoCopaBloqueada = false;

function preencherSelecoes() {
  selecaoFutebol.innerHTML = "";

  selecoesCopa.forEach((selecao) => {
    const option = document.createElement("option");
    option.value = selecao;
    option.textContent = selecao;
    selecaoFutebol.appendChild(option);
  });
}

function escolherAdversarios() {
  return selecoesCopa
    .filter((selecao) => selecao !== selecaoJogador)
    .sort(() => Math.random() - 0.5);
}

function atualizarFasesCopa() {
  listaFases.innerHTML = "";

  fasesCopa.forEach((fase, indice) => {
    const item = document.createElement("li");
    item.className = indice === faseIndice ? "atual" : "";
    item.innerHTML = `<span>${fase}</span><strong>${indice < faseIndice ? "OK" : indice === faseIndice ? "Agora" : "-"}</strong>`;
    listaFases.appendChild(item);
  });
}

function atualizarGrupoCopa() {
  const grupo = [selecaoJogador, ...adversariosCopa.slice(0, 3)];
  grupoCopa.innerHTML = "";

  grupo.forEach((selecao, indice) => {
    const linha = document.createElement("div");
    linha.className = selecao === selecaoJogador ? "voce" : "";
    linha.innerHTML = `<span>${indice + 1}. ${selecao}</span><strong>${selecao === selecaoJogador ? `${pontosGrupo} pts` : "CPU"}</strong>`;
    grupoCopa.appendChild(linha);
  });
}

function atualizarPlacarCopa() {
  faseCopaElemento.textContent = fasesCopa[faseIndice];
  placarCopaElemento.textContent = `${penaltisJogador} x ${penaltisRival}`;
  turnoCopaElemento.textContent = vezCopa === "chute" ? "Chute" : "Defesa";
}

function resetarCampoCopa() {
  bola.style.left = "50%";
  bola.style.bottom = "5.6rem";
  goleiro.classList.remove("esquerda", "direita");
}

function iniciarDisputaCopa() {
  penaltisJogador = 0;
  penaltisRival = 0;
  cobrancaAtual = 1;
  vezCopa = "chute";
  interacaoCopaBloqueada = false;
  resetarCampoCopa();
  atualizarPlacarCopa();
  mensagemCopa.textContent = `${selecaoJogador} x ${selecaoRival}. Clique em uma area do gol para chutar.`;
}

function proximoAdversarioCopa() {
  if (faseIndice === 0) {
    selecaoRival = adversariosCopa[rodadaGrupo];
    return;
  }

  selecaoRival = adversariosCopa[3 + faseIndice];
}

function iniciarCopa() {
  copaAtiva = true;
  selecaoJogador = selecaoFutebol.value;
  adversariosCopa = escolherAdversarios();
  faseIndice = 0;
  rodadaGrupo = 0;
  pontosGrupo = 0;
  selecaoFutebol.disabled = true;
  botaoCopa.textContent = "Reiniciar copa";
  proximoAdversarioCopa();
  atualizarFasesCopa();
  atualizarGrupoCopa();
  iniciarDisputaCopa();
}

function chanceGol(zonaChute, zonaGoleiro) {
  if (zonaChute === zonaGoleiro) {
    return Math.random() < 0.22;
  }

  return Math.random() < 0.78;
}

function moverBola(zona) {
  bola.style.left = posicoesGol[zona];
  bola.style.bottom = "20rem";
}

function moverGoleiro(zona) {
  goleiro.classList.remove("esquerda", "direita");

  if (zona !== "centro") {
    goleiro.classList.add(zona);
  }
}

function encerrarCopa(vitoria) {
  copaAtiva = false;
  selecaoFutebol.disabled = false;
  botaoCopa.textContent = "Iniciar copa";
  mensagemCopa.textContent = vitoria ? `${selecaoJogador} campeao nos penaltis!` : `${selecaoJogador} foi eliminado por ${selecaoRival}.`;
}

function avancarFaseCopa() {
  if (faseIndice === 0) {
    pontosGrupo += 3;
    atualizarGrupoCopa();
    rodadaGrupo += 1;

    if (rodadaGrupo < 3) {
      proximoAdversarioCopa();
      mensagemCopa.textContent = `Vitoria no grupo. Proximo jogo contra ${selecaoRival}.`;
      setTimeout(iniciarDisputaCopa, 900);
      return;
    }

    if (pontosGrupo >= 6) {
      faseIndice = 1;
      proximoAdversarioCopa();
      atualizarFasesCopa();
      mensagemCopa.textContent = "Classificado para as oitavas.";
      setTimeout(iniciarDisputaCopa, 900);
      return;
    }

    encerrarCopa(false);
    return;
  }

  if (faseIndice >= fasesCopa.length - 1) {
    encerrarCopa(true);
    return;
  }

  faseIndice += 1;
  proximoAdversarioCopa();
  atualizarFasesCopa();
  mensagemCopa.textContent = `Classificado para ${fasesCopa[faseIndice]}.`;
  setTimeout(iniciarDisputaCopa, 900);
}

function registrarDerrotaCopa() {
  if (faseIndice !== 0) {
    encerrarCopa(false);
    return;
  }

  rodadaGrupo += 1;
  atualizarGrupoCopa();

  if (rodadaGrupo < 3) {
    proximoAdversarioCopa();
    mensagemCopa.textContent = `Derrota no grupo. Proximo jogo contra ${selecaoRival}.`;
    setTimeout(iniciarDisputaCopa, 900);
    return;
  }

  if (pontosGrupo >= 6) {
    faseIndice = 1;
    proximoAdversarioCopa();
    atualizarFasesCopa();
    mensagemCopa.textContent = "Classificado para as oitavas.";
    setTimeout(iniciarDisputaCopa, 900);
    return;
  }

  encerrarCopa(false);
}

function avaliarDisputaCopa() {
  if (cobrancaAtual <= 5) {
    return null;
  }

  if (penaltisJogador > penaltisRival) {
    return "jogador";
  }

  if (penaltisRival > penaltisJogador) {
    return "rival";
  }

  return null;
}

function turnoPenalti(zona) {
  if (!copaAtiva || interacaoCopaBloqueada) {
    return;
  }

  interacaoCopaBloqueada = true;
  resetarCampoCopa();

  if (vezCopa === "chute") {
    const defesa = ["esquerda", "centro", "direita"][Math.floor(Math.random() * 3)];
    const gol = chanceGol(zona, defesa);
    moverBola(zona);
    moverGoleiro(defesa);

    if (gol) {
      penaltisJogador += 1;
    }

    mensagemCopa.textContent = gol ? "Gol da sua selecao!" : "O goleiro defendeu.";
    vezCopa = "defesa";
  } else {
    const chuteRival = ["esquerda", "centro", "direita"][Math.floor(Math.random() * 3)];
    const golRival = chanceGol(chuteRival, zona);
    moverBola(chuteRival);
    moverGoleiro(zona);

    if (golRival) {
      penaltisRival += 1;
    }

    mensagemCopa.textContent = golRival ? `${selecaoRival} marcou.` : "Voce defendeu o penalti.";
    vezCopa = "chute";
    cobrancaAtual += 1;
  }

  atualizarPlacarCopa();

  setTimeout(() => {
    resetarCampoCopa();
    const vencedor = avaliarDisputaCopa();

    if (vencedor === "jogador") {
      avancarFaseCopa();
      interacaoCopaBloqueada = false;
      return;
    }

    if (vencedor === "rival") {
      registrarDerrotaCopa();
      interacaoCopaBloqueada = false;
      return;
    }

    mensagemCopa.textContent = vezCopa === "chute" ? "Clique em uma area do gol para chutar." : "Escolha onde o goleiro vai defender.";
    interacaoCopaBloqueada = false;
    atualizarPlacarCopa();
  }, 700);
}

zonasGol.forEach((zona) => {
  zona.addEventListener("click", () => turnoPenalti(zona.dataset.zona));
});

botaoCopa.addEventListener("click", iniciarCopa);
preencherSelecoes();
atualizarFasesCopa();
atualizarGrupoCopa();

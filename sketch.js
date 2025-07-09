let gameState = "INTRO";
let truck;
let obstacles = [];
let deliveries = [];
let boosts = [];
let score = 0;
let lives = 3;
let timer = 60;
let level = 1;
let bgMusic;
let gameOverSound;
let isPaused = false;
let bgImage;
let hitSound;
let hornSound;
let doublePointsActive = false;
let doublePointsTimer = 0;
let targetX = null;
let isSoundOn = true;
let introStartTime = 0;

// ✅ preload()
// Carrega os arquivos de imagem e som antes do jogo começar.
function preload() {
  bgImage = loadImage("fundorural.jpg");
  menuBg = loadImage("bg.jpg");
  bgMusic = loadSound("somdefundo.mp3");
  gameOverSound = loadSound("gameover.mp3");
  hitSound = loadSound("hit.mp3");
  hornSound = loadSound("buzina.mp3");
}

// ✅ setup()
// Função chamada no início. Cria o canvas, define o frame rate, configura som de fundo e chama menus iniciais.
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  setupGame(); // Apenas prepara o jogo, sem mostrar o menu agora

  if (bgMusic) {
    bgMusic.setVolume(0.3);
    bgMusic.loop();
  }
}

// ✅ setupGame()
// Prepara configurações iniciais do jogo (ainda está vazia, mas pronta para expansão).
function setupGame() {
  // Preparações adicionais para o jogo, se necessário
}

// ✅ setupMenu()
// Cria o menu principal do jogo com botões e título.
function setupMenu() {
  // Container do título e subtítulo
  let titleBox = createDiv().addClass("menu-title");
  createElement("h1", "Fluxo de Caminhões 🚚").parent(titleBox);

  // Subtítulo com explicação breve
  createP(
    "Você é o responsável por fazer entregas no campo, desviando de obstáculos e coletando caixas para somar pontos."
  ).parent(titleBox);

  // Container do restante do menu
  let container = createDiv().addClass("menu-container");
  createP("Use os botões |⬅| e |⮕| para se mover").parent(container);

  let btnStart = createButton("Iniciar Jogo");
  btnStart.parent(container);
  btnStart.style("background-color", "#28a745"); // Verde
  btnStart.style("color", "white");
  btnStart.mousePressed(() => {
    titleBox.remove(); // remove o título e subtítulo ao iniciar
    startGame(container);
  });

  let btnReferences = createButton("Referências do Projeto");
  btnReferences.parent(container);
  btnReferences.style("background-color", "#007bff"); // Azul
  btnReferences.style("color", "white");
  btnReferences.mousePressed(() => {
    titleBox.remove(); // remove ao abrir referências
    showReferences(container);
  });

  let btnObjectives = createButton("🎯 Objetivos");
  btnObjectives.parent(container);
  btnObjectives.style("background-color", "#ffc107"); // Amarelo
  btnObjectives.style("color", "black");
  btnObjectives.mousePressed(() => {
    titleBox.remove();
    container.remove();
    showObjectives();
  });

  let btnToggleSound = createButton("🔊 Desligar Som");
  btnToggleSound.parent(container);
  btnToggleSound.style("background-color", "#dc3545");
  btnToggleSound.style("color", "white");
  btnToggleSound.mousePressed(() => {
    isSoundOn = !isSoundOn; // alterna a variável

    if (isSoundOn) {
      bgMusic.loop();
      btnToggleSound.html("🔊 Desligar Som");
    } else {
      bgMusic.pause();
      btnToggleSound.html("🔇 Ligar Som");
    }
  });
}

// ✅ draw()
// Função que desenha tudo na tela, chamada a cada frame. Muda o que mostrar com base no gameState.
function draw() {
  if (gameState === "INTRO") {
    background(0); // Fundo preto para a introdução

    // Inicializa introAlpha se ainda não estiver definida
    if (typeof introAlpha === "undefined") {
      introAlpha = 0;
      introStartTime = millis(); // Guarda o tempo de início da introdução
    }
    introAlpha = lerp(introAlpha, 255, 0.03); // Suaviza o aparecimento do texto

    fill(255, introAlpha); // Texto branco com transparência gradual
    textAlign(CENTER, CENTER);
    textSize(24);
    text(
      "Fluxo de Caminhões\n\nConectando o campo e a cidade\n\nCriado por Matheus Carneiro",
      width / 2,
      height / 2
    );

    // --- LÓGICA DA BARRA DE PROGRESSO ---
    let introDuration = 4000; // Duração total da introdução em milissegundos (4 segundos)
    let elapsed = millis() - introStartTime; // Tempo decorrido desde o início
    let progressWidth = map(elapsed, 0, introDuration, 0, width); // Mapeia o tempo para a largura da tela

    fill(0, 200, 0, 150); // Cor verde semitransparente para a barra
    noStroke(); // Sem borda
    rect(0, height - 20, progressWidth, 10); // Desenha a barra na parte inferior da tela
    // --- FIM DA LÓGICA DA BARRA DE PROGRESSO ---

    // Cria o botão "Pular Introdução" após 2 segundos e auto-avança após 4 segundos
    if (elapsed > 2000 && !select("#skipBtn")) {
      // O botão aparece após 2 segundos
      let skipBtn = createButton("Pular Introdução");
      skipBtn.id("skipBtn");
      skipBtn.style("background-color", "#6c757d");
      skipBtn.style("color", "white");
      skipBtn.position(width / 2 - 70, height - 80);
      skipBtn.mousePressed(() => {
        skipBtn.remove();
        gameState = "MENU";
        setupMenu();
      });
    }

    // Auto-avança para o menu se a duração total da introdução for atingida
    if (elapsed >= introDuration) {
      // Remove o botão de pular se ele existir
      let skipBtn = select("#skipBtn");
      if (skipBtn) skipBtn.remove();
      gameState = "MENU";
      setupMenu();
    }

    return; // Sai da função draw para não executar o resto do jogo
  }

  if (gameState === "MENU") {
    if (menuBg) {
      image(menuBg, 0, 0, width, height);
    } else {
      background("#a3d9a5");
    }
    return;
  }

  if (gameState === "PLAY") {
    if (bgImage) {
      image(bgImage, 0, 0, width, height);
    } else {
      background("#a3d9a5");
    }

    playGame();

    if (lives <= 0 || timer <= 0) {
      gameState = "GAME_OVER";
      bgMusic.stop();
      if (gameOverSound && !gameOverSound.isPlaying()) {
        gameOverSound.play();
      }
      showGameOver();
    }
    for (let i = boosts.length - 1; i >= 0; i--) {
      boosts[i].update();
      boosts[i].show();

      if (boosts[i].y > height) {
        boosts.splice(i, 1); // Remove boosts que saem da tela
      }
    }
  }
}

// ✅ startGame()
// Reseta o jogo, inicia os valores padrões e muda para o estado de PLAY.
function startGame(menu = null) {
  if (menu) menu.remove();
  truck = { x: width / 2, y: height / 2 + 135, w: 60, h: 60, speed: 12 };
  score = 0;
  lives = 2; // <-- Reduzido
  timer = 45; // <-- Reduzido
  level = 1;
  obstacles = [];
  deliveries = [];
  gameState = "PLAY";
  loop();
  if (isSoundOn && !bgMusic.isPlaying()) {
    bgMusic.loop();
  }
}

function keyPressed() {
  // TOCAR BUZINA (H)
  if ((key === "h" || key === "H") && hornSound && !hornSound.isPlaying()) {
    hornSound.play();
  }

  // PAUSAR COM ESC
  if (keyCode === ESCAPE && gameState === "PLAY") {
    isPaused = !isPaused;
    if (isPaused) {
      noLoop();
      showPauseMenu();
    } else {
      loop();
      removePauseMenu();
    }
  }
}

function playGame() {
  updateBackground();
  handleTruck();
  spawnEntities();
  moveEntities(); // aqui já desenha os obstáculos e caixas
  drawBoosts(); // esse ainda é necessário
  checkCollisions();
  updateHUD();
  updateTimer();
}

function updateBackground() {
  if (bgImage) {
    image(bgImage, 0, 0, width, height);
  } else {
    background("#a3d9a5");
  }
}

function drawObstacles() {
  obstacles.forEach((o) => {
    textSize(32);
    text("⛰️", o.x, o.y);
  });
}

function drawDeliveries() {
  deliveries.forEach((d) => {
    textSize(32);
    text("📦", d.x, d.y);
  });
}

function drawBoosts() {
  boosts.forEach((b) => {
    b.show();
  });
}

function handleTruck() {
  textSize(32);
  text("🚚", truck.x, truck.y);

  let moveSpeed = 10; // aumenta a velocidade
  let lerpFactor = 0.5; // suavização rápida

  let desiredX = truck.x;

  if (keyIsDown(LEFT_ARROW) && truck.x > 0) {
    desiredX = truck.x - moveSpeed;
  }

  if (keyIsDown(RIGHT_ARROW) && truck.x < width - truck.w) {
    desiredX = truck.x + moveSpeed;
  }

  // Suaviza a transição entre a posição atual e o destino
  truck.x = lerp(truck.x, desiredX, lerpFactor);
}

// ✅ spawnEntities()
// Gera obstáculos, caixas e boosts no decorrer do jogo.
function spawnEntities() {
  let obstacleInterval = max(20, 70 - level * 6);
  if (frameCount % obstacleInterval === 0) {
    obstacles.push({
      x: random(width),
      y: -40,
      size: 40,
      speed: 5 + level * 1.2,
    });
  }

  if (frameCount % 240 === 0) {
    deliveries.push({
      x: random(width),
      y: -30,
      size: 40,
      speed: 2.5 + level * 0.6,
    });
  }

  if (frameCount % 600 === 0) {
    spawnBoost();
  }
}

// ✅ moveEntities()
// Atualiza a posição de obstáculos e entregas, removendo os que saem da tela.
function moveEntities() {
  textSize(32);
  fill(0);

  // Atualiza e desenha os obstáculos
  obstacles.forEach((o) => {
    o.y += o.speed;
    text("⛰️", o.x, o.y);
  });

  // Atualiza e desenha as entregas
  deliveries.forEach((d) => {
    d.y += d.speed;
    text("📦", d.x, d.y);
  });

  // 🔧 REMOVE os que saem da tela (importante!)
  obstacles = obstacles.filter((o) => o.y < height);
  deliveries = deliveries.filter((d) => d.y < height);
  boosts = boosts.filter((b) => b.y < height);
}

// ✅ Boost (classe)
// Representa os boosts (⏰ tempo ou ⭐ pontos) com animação pulsante.
class Boost {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.type = type; // "clock" ou "doublePoints"
  }

  update() {
    this.y += 3; // Velocidade de descida
  }

  show() {
    // Efeito pulsante usando sin() baseado no tempo
    let pulse = sin(frameCount * 0.2) * 5 + 30; // tamanho varia entre 25 e 35

    noStroke();
    if (this.type === "clock") {
      fill(255, 215, 0);
      ellipse(this.x, this.y, pulse); // boost pulsa!
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(14);
      text("⏰", this.x, this.y);
    } else if (this.type === "doublePoints") {
      fill(0, 255, 0);
      ellipse(this.x, this.y, pulse); // boost pulsa!
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(14);
      text("⭐", this.x, this.y);
    }
  }
}

// ✅ spawnBoost()
// Cria um novo boost aleatório e o adiciona na lista.
function spawnBoost() {
  let types = ["clock", "doublePoints"];
  let randomType = random(types);
  let x = random(50, width - 50);
  let y = -30;
  boosts.push(new Boost(x, y, randomType));
}

// ✅ checkCollisions()
// Verifica colisões com obstáculos, caixas e boosts, aplicando seus efeitos.
function checkCollisions() {
  // Verificar colisões com obstáculos
  obstacles = obstacles.filter((o) => {
    if (dist(o.x, o.y, truck.x, truck.y) < 20) {
      lives--;
      if (hitSound) hitSound.play();
      return false;
    }
    return o.y < height;
  });

  // Verificar colisões com BOOSTS (Agora fora do loop de obstáculos!)
  for (let i = boosts.length - 1; i >= 0; i--) {
    let d = dist(truck.x, truck.y, boosts[i].x, boosts[i].y);
    if (d < truck.w / 2 + boosts[i].size / 2) {
      applyBoost(boosts[i].type);
      boosts.splice(i, 1);
    }
  }

  // Verificar colisões com entregas
  deliveries = deliveries.filter((d) => {
    if (dist(d.x, d.y, truck.x, truck.y) < 20) {
      let points = doublePointsActive ? 20 : 10;
      score += points;
      timer += 1.5;

      let newLevel = floor(score / 100) + 1;
      if (newLevel > level) level = newLevel;
      return false;
    }
    return d.y < height;
  });
}

let boostMessage = "";
let boostMessageTimer = 0;

// ✅ showBoostMessage(text)
// Exibe uma mensagem curta (ex: "+10s de tempo!") temporariamente na tela.
function showBoostMessage(text) {
  boostMessage = text;
  boostMessageTimer = 90; // aparece por 1.5 segundos (90 frames)
}

// ✅ applyBoost(type)
// Aplica o efeito de boost (tempo ou pontos em dobro) com efeitos visuais.
function applyBoost(type) {
  if (type === "clock") {
    timer += 10; // Adiciona 10 segundos no timer
    showBoostMessage("+10s de tempo!");
  } else if (type === "doublePoints") {
    doublePointsActive = true;
    doublePointsTimer = 420; // Dura 300 frames (5 segundos, se seu jogo roda a 60fps)
  }
}

// ✅ updateHUD()
// Mostra as informações do HUD: vidas, tempo, pontos, nível e boost ativo.
function updateHUD() {
  fill(255);
  textAlign(LEFT);
  textFont("Arial");
  textSize(26);
  text(`❤️ Vidas: ${lives}`, 20, 35);
  text(`⏱️ Tempo: ${floor(timer)}`, 20, 70);
  text(`⭐ Pontos: ${score}`, width - 200, 35);
  text(`⬆️ Nível: ${level}`, width - 200, 70);

  if (doublePointsActive) {
    doublePointsTimer--;
    fill(255, 255, 0);
    textSize(20);
    text("⭐ DOUBLE POINTS ATIVO!", width / 2 - 110, 35);
    if (doublePointsTimer <= 0) {
      doublePointsActive = false;
    }
  }

  if (boostMessageTimer > 0) {
    fill(0, 255, 255);
    textAlign(CENTER);
    textSize(20);
    text(boostMessage, width / 2, height - 40);
    boostMessageTimer--;
  }
}

function updateTimer() {
  timer -= deltaTime / 1000;
}

function showObjectives() {
  gameState = "OBJECTIVES";

  let container = createDiv().addClass("references-container");
  createElement("h1", "Objetivos & Perguntas Frequentes")
    .id("faqTitulo")
    .parent(container);

  // Função auxiliar para adicionar perguntas/respostas
  function addFAQ(parent, numero, pergunta, resposta) {
    const wrapper = createDiv().addClass("faq-wrapper").parent(parent);
    createDiv(`${numero}. ${pergunta}`)
      .addClass("faq-question")
      .parent(wrapper);
    createDiv(resposta).addClass("faq-answer").parent(wrapper);
  }

  // Seções principais
  createDiv("🎮 Jogabilidade").addClass("faq-section").parent(container);
  addFAQ(
    container,
    1,
    "Como controlo o caminhão?",
    "Use as setas do teclado ⬅️ ➡️ para se mover."
  );
  addFAQ(
    container,
    2,
    "O que acontece quando eu pego uma caixa?",
    "Você ganha pontos e tempo extra!"
  );

  createDiv("🧠 Estratégia").addClass("faq-section").parent(container);
  addFAQ(
    container,
    3,
    "Como funciona o sistema de níveis?",
    "A cada 100 pontos você sobe um nível e o jogo acelera."
  );
  addFAQ(
    container,
    4,
    "Tem alguma dica pra fazer mais pontos?",
    "Colete boosts sempre que puder e evite colisões!"
  );

  createDiv("🔊 Sons & HUD").addClass("faq-section").parent(container);
  addFAQ(
    container,
    5,
    "Posso desligar a música?",
    "Sim! Use o botão 'Desligar Som' no menu."
  );
  addFAQ(
    container,
    6,
    "O que significa 'DOUBLE POINTS ATIVO!'?",
    "Durante alguns segundos, cada caixa vale o dobro de pontos!"
  );

  // Botão para mais perguntas
  let btnMore = createButton("📖 Mais Perguntas");
  btnMore.parent(container);
  btnMore.style("background-color", "#17a2b8");
  btnMore.style("color", "white");
  btnMore.style("margin-top", "20px");

  // Container extra de perguntas
  let extraDiv = createDiv()
    .id("extra-questions")
    .style("display", "none")
    .parent(container);

  createDiv("📦 Entregas e Pontuação").addClass("faq-section").parent(extraDiv);
  addFAQ(
    extraDiv,
    7,
    "Qual o objetivo do jogo?",
    "Conectar campo e cidade com entregas rápidas e seguras!"
  );
  addFAQ(
    extraDiv,
    8,
    "O que acontece quando eu bato em um obstáculo?",
    "Você perde 1 vida. Cuidado para não zerar!"
  );
  addFAQ(
    extraDiv,
    9,
    "Boost de tempo ou pontos em dobro: qual é melhor?",
    "Depende! Pegue o que aparecer primeiro, os dois ajudam."
  );

  createDiv("⚙️ Curiosidades Técnicas")
    .addClass("faq-section")
    .parent(extraDiv);
  addFAQ(
    extraDiv,
    10,
    "Esse jogo foi feito com IA?",
    "Sim, com a ajuda do ChatGPT como copiloto."
  );
  addFAQ(
    extraDiv,
    11,
    "Deu trabalho fazer esse jogo?",
    "Sim! Mas também foi divertido e um ótimo aprendizado."
  );
  addFAQ(extraDiv, 12, "O caminhão tem nome?", "Ainda não... sugestões? 😄");

  createDiv("🎉 Extras").addClass("faq-section").parent(extraDiv);
  addFAQ(extraDiv, 13, "Tem modo secreto?", "Quem sabe... talvez um dia...");
  addFAQ(extraDiv, 14, "Posso buzinar sem parar?", "Pode sim! É só apertar H.");

  // Alternância do botão
  let mostrandoExtra = false;
  btnMore.mousePressed(() => {
    mostrandoExtra = !mostrandoExtra;
    extraDiv.style("display", mostrandoExtra ? "block" : "none");
    btnMore.html(mostrandoExtra ? "🔽 Ocultar Perguntas" : "📖 Mais Perguntas");
  });

  // Botão flutuante de "Voltar ao Topo"
  let btnTopo = createButton("🔝 Voltar ao Topo");
  btnTopo.style("background-color", "#505C66");
  btnTopo.id("btnTopo");
  btnTopo.parent(container);
  btnTopo.style("display", "none");
  btnTopo.style("position", "fixed");
  btnTopo.style("bottom", "30px");
  btnTopo.style("right", "30px");
  btnTopo.style("padding", "10px 15px");
  btnTopo.style("font-size", "16px");
  btnTopo.style("z-index", "1000");
  btnTopo.mousePressed(() => {
    document
      .querySelector(".references-container")
      .scrollTo({ top: 0, behavior: "smooth" });
  });

  // Mostrar botão "Voltar ao Topo" só quando o título sumir
  let observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        btnTopo.style("display", entry.isIntersecting ? "none" : "block");
      });
    },
    { root: document.querySelector(".references-container"), threshold: 0.1 }
  );
  observer.observe(document.getElementById("faqTitulo"));

  // Botão de voltar
  let btnBack = createButton("Voltar ao Menu");
  btnBack.parent(container);
  btnBack.style("background-color", "#505C66");
  btnBack.style("color", "white");
  btnBack.mousePressed(() => {
    container.remove();
    setupMenu();
    gameState = "MENU";
  });
}

function showReferences(menu) {
  if (menu) menu.remove();
  gameState = "REFERENCES";

  let container = createDiv().addClass("references-container");
  createElement("h1", "Referências do Projeto").parent(container);
  createElement(
    "h3",
    "Aqui estão todos os links, créditos e informações relevantes sobre o projeto."
  ).parent(container);

  // Links clicáveis com createA
  createP("Imagem de fundo da gameplay:").parent(container);
  createA(
    "https://pt.vecteezy.com/vetor-gratis/estrada",
    "Vecteezy - Estrada",
    "_blank"
  ).parent(container);

  createP("Efeitos de som:").parent(container);
  createA(
    "https://pixabay.com/users/pexels-2286921/",
    "Pixabay - Pexels",
    "_blank"
  ).parent(container);

  createP("Imagem de fundo do menu:").parent(container);
  createA(
    "https://www.istockphoto.com/br/vetor/caminh%C3%A3o-que-move-se-na-estrada-asfaltada-ao-longo-dos-campos-verdes-na-paisagem-gm1163596764-319563236",
    "iStock - Caminhão na estrada",
    "_blank"
  ).parent(container);

  createElement("h2", "Feito com ajuda de I.A 👇").parent(container);
  createP("Todo o código foi feito com a ajuda do ChatGPT").parent(container);

  let btnPrompts = createButton("Prompts");
  btnPrompts.parent(container);
  btnPrompts.style("background-color", "#6f42c1"); // Roxo
  btnPrompts.style("color", "white");
  btnPrompts.mousePressed(() => {
    container.remove();
    showPrompts();
  });

  function showPrompts() {
    gameState = "PROMPTS";

    let container = createDiv().addClass("references-container");
    createElement("h2", "Prompts Utilizados").parent(container);
    createP(
      "Aqui estão todos os comandos, ideias ou instruções usados no desenvolvimento."
    ).parent(container);

    createP("- Criar fundo apenas na gameplay.").parent(container);
    createP("- Botão de pausa com ESC e menu de reinício.").parent(container);
    createP("- Código para colisão e som de hit.").parent(container);
    createP("- Criar seção de referências.").parent(container);
    createP("- Criar botão para mostrar prompts.").parent(container);

    let btnBack = createButton("Voltar para Referências");
    btnBack.parent(container);
    btnBack.style("background-color", "#6c757d"); // Cinza escuro
    btnBack.style("color", "white");
    btnBack.mousePressed(() => {
      container.remove();
      showReferences(null);
    });
  }

  let btnBack = createButton("Voltar ao Menu");
  btnBack.parent(container);
  btnBack.style("background-color", "#6c757d"); // Cinza escuro
  btnBack.style("color", "white");
  btnBack.mousePressed(() => {
    container.remove();
    setupMenu();
    gameState = "MENU";
  });
}

function showPrompts() {
  gameState = "PROMPTS";

  let container = createDiv().addClass("references-container");
  createElement("h2", "Prompts Utilizados").parent(container);
  createP(
    "Aqui estão todos os comandos, ideias ou instruções usados no desenvolvimento."
  ).parent(container);

  createP("- Criar fundo visível apenas durante a gameplay.").parent(container);
  createP("- Adicionar menu com título e subtítulo explicando o jogo.").parent(
    container
  );
  createP(
    "- Criar botão para iniciar o jogo e outro para ver as referências."
  ).parent(container);
  createP("- Adicionar HUD com pontuação, vidas, tempo e nível.").parent(
    container
  );
  createP(
    "- Criar sistema de colisão entre o caminhão, os obstáculos e as entregas."
  ).parent(container);
  createP(
    "- Exibir Game Over ao perder todas as vidas ou acabar o tempo."
  ).parent(container);
  createP(
    "- Criar botão de pausa com tecla ESC e menu de pausa com opções."
  ).parent(container);
  createP(
    "- Criar sistema de progressão por nível baseado na pontuação."
  ).parent(container);
  createP(
    "- Adicionar sons para fundo musical, colisão, game over e buzina."
  ).parent(container);
  createP(
    "- Criar sistema de menu estilizado com CSS para posicionamento centralizado."
  ).parent(container);
  createP("- Separar container exclusivo para o título do jogo.").parent(
    container
  );
  createP("- Inserir links de imagens e sons na seção de referências.").parent(
    container
  );
  createP(
    "- Corrigir erros de sintaxe e remover código antigo de efeitos de chuva."
  ).parent(container);

  let btnBack = createButton("Voltar para Referências");
  btnBack.parent(container);
  btnBack.mousePressed(() => {
    container.remove();
    showReferences(null);
  });
}

// ✅ showGameOver()
// Mostra a tela de fim de jogo com pontuação e opções de reinício ou voltar.
function showGameOver() {
  noLoop();
  let container = createDiv().addClass("gameover-container");
  createElement("h2", "Fim de Jogo!").parent(container);
  createP(`Pontos finais: ${score}`).parent(container);
  let btnMenu = createButton("Voltar para o Menu");
  btnMenu.parent(container);
  btnMenu.style("background-color", "#6c757d"); // Cinza escuro
  btnMenu.style("color", "white");
  btnMenu.mousePressed(() => {
    container.remove();
    setupMenu();
    gameState = "MENU";
    redraw();
  });
  let btnRestart = createButton("Reiniciar");
  btnRestart.parent(container);
  btnRestart.style("background-color", "#fd7e14"); // Laranja
  btnRestart.style("color", "white");
  btnRestart.mousePressed(() => {
    container.remove();
    startGame();
  });
}

// ✅ showPauseMenu()
// Cria o menu de pausa quando ESC é pressionado.
function showPauseMenu() {
  let container = createDiv().addClass("pause-container").id("pauseMenu");
  createElement("h2", "Jogo Pausado").parent(container);
  createP('Aperte "Esc" novamente para continuar').parent(container);
  let btnMenu = createButton("Voltar para o Menu");
  btnMenu.parent(container);
  btnMenu.style("background-color", "#6c757d"); // Cinza escuro
  btnMenu.style("color", "white");
  btnMenu.mousePressed(() => {
    container.remove();
    setupMenu();
    gameState = "MENU";
    redraw();
  });
  let btnRestart = createButton("Reiniciar");
  btnRestart.parent(container);
  btnRestart.style("background-color", "#fd7e14"); // Laranja
  btnRestart.style("color", "white");
  btnRestart.mousePressed(() => {
    container.remove();
    startGame();
  });
}

// ✅ removePauseMenu()
// Remove o menu de pausa da tela.
function removePauseMenu() {
  let pauseMenu = select("#pauseMenu");
  if (pauseMenu) pauseMenu.remove();
}

// ✅ windowResized()
// Garante que o jogo se ajuste ao redimensionamento da janela do navegador.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

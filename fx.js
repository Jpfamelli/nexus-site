/**
 * NEXUS — camada de efeitos globais.
 *
 * Tudo aqui é decoração pura, desenhada num canvas fixo por cima da página
 * com pointer-events:none. Nada depende disto para aparecer: se o script
 * falhar, o site continua idêntico, só sem os efeitos.
 *
 *  1. Clique  → anel de choque + faíscas bronze saindo do ponto
 *  2. Cursor  → rastro de partículas finas que segue o ponteiro
 *  3. Hover   → pulso curto ao entrar em botões e cartões
 */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pontFino = window.matchMedia("(pointer: fine)").matches;
  if (reduzido) return;

  var BRONZE = "176, 118, 31";
  var CREME = "245, 233, 214";

  var cv = document.createElement("canvas");
  cv.className = "nx-fx";
  cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  var ctx = cv.getContext("2d");
  if (!ctx) return;

  var w = 0;
  var h = 0;
  var dpr = 1;

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth || docEl.clientWidth || 0;
    h = window.innerHeight || docEl.clientHeight || 0;
    if (!w || !h) return false;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  /* Se a janela ainda não tem tamanho (aba oculta, painel fechado),
     tenta de novo até conseguir — senão o canvas ficaria inutilizável. */
  if (!medir()) {
    var tentativas = 0;
    var repetir = window.setInterval(function () {
      tentativas++;
      if (medir() || tentativas > 40) window.clearInterval(repetir);
    }, 250);
  }

  var reTimer = 0;
  window.addEventListener(
    "resize",
    function () {
      window.clearTimeout(reTimer);
      reTimer = window.setTimeout(medir, 160);
    },
    { passive: true }
  );

  /* ---------------- estruturas ---------------- */
  var aneis = [];
  var faiscas = [];
  var rastro = [];
  var raf = 0;
  var mx = -999;
  var my = -999;
  var ultimoRastro = 0;

  function ligar() {
    if (!w || !h) medir();
    if (!raf && !document.hidden && w && h) raf = window.requestAnimationFrame(quadro);
  }

  /* ---------------- clique ---------------- */
  function aoClicar(e) {
    var x = e.clientX;
    var y = e.clientY;
    if (x == null) return;

    aneis.push({ x: x, y: y, r: 4, vr: 3.4, t0: Date.now() });
    aneis.push({ x: x, y: y, r: 0, vr: 1.7, t0: Date.now(), fino: true });

    var n = 14;
    for (var i = 0; i < n; i++) {
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      var vel = 2.2 + Math.random() * 3.6;
      faiscas.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel,
        t0: Date.now(),
        tam: 1 + Math.random() * 1.8,
        claro: Math.random() < 0.35
      });
    }
    if (aneis.length > 24) aneis.splice(0, aneis.length - 24);
    if (faiscas.length > 220) faiscas.splice(0, faiscas.length - 220);
    ligar();
  }

  document.addEventListener("pointerdown", aoClicar, { passive: true });

  /* ---------------- rastro do ponteiro ---------------- */
  if (pontFino) {
    document.addEventListener(
      "pointermove",
      function (e) {
        mx = e.clientX;
        my = e.clientY;
        var agora = performance.now();
        if (agora - ultimoRastro < 26) return;
        ultimoRastro = agora;
        rastro.push({
          x: mx + (Math.random() - 0.5) * 8,
          y: my + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.25 - Math.random() * 0.5,
          t0: Date.now(),
          tam: 0.9 + Math.random() * 1.5
        });
        if (rastro.length > 90) rastro.shift();
        ligar();
      },
      { passive: true }
    );
  }

  /* ---------------- desenho ---------------- */
  var ultimoQuadro = Date.now();

  /* A vida das partículas é medida em TEMPO, não em quadros: assim o
     efeito dura o mesmo tanto a 30 ou 120fps, e nunca fica preso na tela
     quando o navegador atrasa os quadros. */
  var DUR_ANEL = 900;
  var DUR_FAISCA = 750;
  var DUR_RASTRO = 620;

  function quadro() {
    var agora = Date.now();
    var dt = Math.min(64, agora - ultimoQuadro) / 16.67;
    ultimoQuadro = agora;
    ctx.clearRect(0, 0, w, h);
    var i;
    var vivo = false;

    for (i = aneis.length - 1; i >= 0; i--) {
      var a = aneis[i];
      var va = 1 - (agora - a.t0) / DUR_ANEL;
      if (va <= 0) {
        aneis.splice(i, 1);
        continue;
      }
      a.r += a.vr * dt;
      a.vr *= Math.pow(0.965, dt);
      vivo = true;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.lineWidth = a.fino ? 0.8 : 1.6 * va;
      ctx.strokeStyle = "rgba(" + (a.fino ? CREME : BRONZE) + ", " + (va * (a.fino ? 0.32 : 0.55)).toFixed(3) + ")";
      ctx.stroke();
    }

    for (i = faiscas.length - 1; i >= 0; i--) {
      var f = faiscas[i];
      var vf = 1 - (agora - f.t0) / DUR_FAISCA;
      if (vf <= 0) {
        faiscas.splice(i, 1);
        continue;
      }
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vx *= Math.pow(0.93, dt);
      f.vy = f.vy * Math.pow(0.93, dt) + 0.07 * dt;
      vivo = true;
      ctx.fillStyle = "rgba(" + (f.claro ? CREME : BRONZE) + ", " + (vf * 0.85).toFixed(3) + ")";
      ctx.fillRect(f.x - f.tam / 2, f.y - f.tam / 2, f.tam, f.tam);
    }

    for (i = rastro.length - 1; i >= 0; i--) {
      var p = rastro[i];
      var vp = 1 - (agora - p.t0) / DUR_RASTRO;
      if (vp <= 0) {
        rastro.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      vivo = true;
      ctx.fillStyle = "rgba(" + BRONZE + ", " + (vp * 0.42).toFixed(3) + ")";
      ctx.fillRect(p.x, p.y, p.tam, p.tam);
    }

    if (vivo) {
      raf = window.requestAnimationFrame(quadro);
      agendarFaxina();
    } else {
      raf = 0;
      ctx.clearRect(0, 0, w, h);
    }
  }

  /* Rede de segurança: o rAF pode ficar AGENDADO mas nunca executar
     (aba oculta, GPU ocupada), deixando rastro congelado na tela.
     Este relógio real detecta a parada e limpa tudo. */
  var faxina = 0;
  function agendarFaxina() {
    window.clearTimeout(faxina);
    faxina = window.setTimeout(function () {
      if (Date.now() - ultimoQuadro < 1200) {
        agendarFaxina();
        return;
      }
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      aneis.length = 0;
      faiscas.length = 0;
      rastro.length = 0;
      if (w && h) ctx.clearRect(0, 0, w, h);
    }, 1500);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
      aneis.length = 0;
      faiscas.length = 0;
      rastro.length = 0;
      ctx.clearRect(0, 0, w, h);
    }
  });

  /* ---------------- pulso ao passar o mouse ---------------- */
  if (pontFino) {
    var alvos = ".button, .nav-whatsapp, .chat-try, .project-card, .offer-card, .package-card, .service-card, .problem-card, .ia-chip, .faq-trigger, .contact-card > a";
    document.addEventListener(
      "pointerover",
      function (e) {
        var el = e.target instanceof Element ? e.target.closest(alvos) : null;
        if (!el || el.dataset.nxPulso === "1") return;
        el.dataset.nxPulso = "1";
        el.classList.add("nx-pulsa");
        window.setTimeout(function () {
          el.classList.remove("nx-pulsa");
          delete el.dataset.nxPulso;
        }, 520);
      },
      { passive: true }
    );
  }

  docEl.classList.add("nx-fx-on");
})();

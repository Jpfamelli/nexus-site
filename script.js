/**
 * NEXUS — interações da página.
 * Progresso de rolagem, menu, entradas por visibilidade, parallax do herói,
 * cursor autoral (ponto + aro + luz), botões magnéticos e acordeão do FAQ.
 */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Cabeçalho sólido + barra de progresso ---------- */
  var header = document.getElementById("site-header");
  var progress = document.getElementById("scroll-progress");
  var frame = 0;
  var lastY = window.scrollY;

  function handleScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-solid", y > 24 || menuOpen);
      var delta = y - lastY;
      if (Math.abs(delta) > 8) {
        header.classList.toggle("is-hidden", delta > 0 && y > 140 && !menuOpen);
        lastY = y;
      }
      if (y <= 140) header.classList.remove("is-hidden");
    }
    if (frame) return;
    frame = window.requestAnimationFrame(function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var value = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      if (progress) progress.style.transform = "scaleX(" + value + ")";
      frame = 0;
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (header) {
    header.addEventListener("focusin", function () {
      header.classList.remove("is-hidden");
    });
  }

  /* ---------- Menu móvel ---------- */
  var menuOpen = false;
  var menuToggle = document.getElementById("menu-toggle");
  var primaryNav = document.getElementById("primary-nav");

  function setMenu(open) {
    var estava = menuOpen;
    menuOpen = open;
    if (primaryNav) primaryNav.classList.toggle("is-open", open);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      menuToggle.classList.toggle("is-open", open);
    }
    if (header) {
      header.classList.toggle("is-solid", window.scrollY > 24 || open);
      if (open) header.classList.remove("is-hidden");
    }
    document.body.style.overflow = open ? "hidden" : "";
    /* v26 (a11y): ao abrir, o foco vai para o primeiro link; ao fechar
       por Escape, volta para o botão que abriu o menu. */
    if (open && primaryNav) {
      var primeiro = primaryNav.querySelector("a");
      if (primeiro) window.setTimeout(function () { primeiro.focus(); }, 60);
    } else if (estava && !open && menuToggle && primaryNav && primaryNav.contains(document.activeElement)) {
      menuToggle.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!menuOpen);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) {
        e.preventDefault();
        setMenu(false);
        menuToggle.focus();
      }
    });
  }

  if (primaryNav) {
    primaryNav.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.closest("a")) setMenu(false);
    });
  }

  /* ---------- Entradas quando o conteúdo aparece ---------- */
  var reveals = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (node) {
      node.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    reveals.forEach(function (node) {
      observer.observe(node);
    });
  }

  /* ---------- Parallax leve do painel do herói ---------- */
  var heroVisual = document.getElementById("hero-visual");

  if (heroVisual && !reducedMotion) {
    heroVisual.addEventListener("pointermove", function (event) {
      var rect = heroVisual.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.setProperty("--tilt-x", y * -5 + "deg");
      heroVisual.style.setProperty("--tilt-y", x * 7 + "deg");
      heroVisual.style.setProperty("--shift-x", x * 10 + "px");
      heroVisual.style.setProperty("--shift-y", y * 8 + "px");
    });
    heroVisual.addEventListener("pointerleave", function () {
      heroVisual.style.setProperty("--tilt-x", "0deg");
      heroVisual.style.setProperty("--tilt-y", "0deg");
      heroVisual.style.setProperty("--shift-x", "0px");
      heroVisual.style.setProperty("--shift-y", "0px");
    });
  }

  /* ---------- Cursor autoral: ponto imediato + aro e luz com atraso ---------- */
  var dot = document.getElementById("cursor-dot");
  var ring = document.getElementById("cursor-ring");
  var halo = document.getElementById("cursor-halo");

  if (dot && ring && halo && finePointer && !reducedMotion) {
    document.documentElement.classList.add("has-custom-cursor");

    var pointerX = -120;
    var pointerY = -120;
    var ringX = pointerX;
    var ringY = pointerY;
    var haloX = pointerX;
    var haloY = pointerY;
    var cursorRaf = 0;
    var lastPointerMove = 0;

    /* Cantos de mira dentro do aro: travam nos limites do alvo,
       ecoando os colchetes de .offer-corners e do hero-image-frame. */
    var ALVO_SELETOR = "[data-cursor-label], .faq-trigger, .project-shot";
    var CANTO = 10;
    var FOLGA = 6;
    var CANTO_BASE = [
      { x: 7, y: 7 },
      { x: 27, y: 7 },
      { x: 27, y: 27 },
      { x: 7, y: 27 }
    ];
    var cantos = ["tl", "tr", "br", "bl"].map(function (pos, i) {
      var el = document.createElement("span");
      el.className = "cursor-corner cursor-corner-" + pos;
      el.setAttribute("aria-hidden", "true");
      el.style.transform = "translate3d(" + CANTO_BASE[i].x + "px, " + CANTO_BASE[i].y + "px, 0)";
      ring.appendChild(el);
      return { el: el, x: CANTO_BASE[i].x, y: CANTO_BASE[i].y };
    });
    var alvoTravado = null;

    var acordarCursor = function () {
      if (!cursorRaf) cursorRaf = window.requestAnimationFrame(renderCursor);
    };

    var soltarAlvo = function () {
      alvoTravado = null;
      ring.classList.remove("is-locked");
      acordarCursor();
    };

    var travarAlvo = function (el) {
      alvoTravado = el;
      ring.classList.add("is-locked");
      acordarCursor();
    };

    var renderCursor = function () {
      ringX += (pointerX - ringX) * 0.17;
      ringY += (pointerY - ringY) * 0.17;
      haloX += (pointerX - haloX) * 0.075;
      haloY += (pointerY - haloY) * 0.075;
      dot.style.transform = "translate3d(" + (pointerX - 3) + "px, " + (pointerY - 3) + "px, 0)";
      ring.style.transform = "translate3d(" + (ringX - 22) + "px, " + (ringY - 22) + "px, 0)";
      halo.style.transform = "translate3d(" + (haloX - 180) + "px, " + (haloY - 180) + "px, 0)";

      var resto =
        Math.abs(pointerX - ringX) + Math.abs(pointerY - ringY) + Math.abs(pointerX - haloX) + Math.abs(pointerY - haloY);

      var destino = CANTO_BASE;
      if (alvoTravado) {
        var r = alvoTravado.getBoundingClientRect();
        if (r.right < ringX - 200 || r.left > ringX + 200 || r.bottom < ringY - 200 || r.top > ringY + 200) {
          soltarAlvo();
        } else {
          var ox = ringX - 22;
          var oy = ringY - 22;
          destino = [
            { x: r.left - FOLGA - ox, y: r.top - FOLGA - oy },
            { x: r.right + FOLGA - CANTO - ox, y: r.top - FOLGA - oy },
            { x: r.right + FOLGA - CANTO - ox, y: r.bottom + FOLGA - CANTO - oy },
            { x: r.left - FOLGA - ox, y: r.bottom + FOLGA - CANTO - oy }
          ];
        }
      }
      for (var i = 0; i < 4; i++) {
        var c = cantos[i];
        c.x += (destino[i].x - c.x) * 0.17;
        c.y += (destino[i].y - c.y) * 0.17;
        c.el.style.transform = "translate3d(" + c.x.toFixed(2) + "px, " + c.y.toFixed(2) + "px, 0)";
        resto += Math.abs(destino[i].x - c.x) + Math.abs(destino[i].y - c.y);
      }

      /* Ponteiro parado e tudo assentado: o laço dorme até o próximo evento. */
      if (performance.now() - lastPointerMove > 2500 && resto < 0.2) {
        cursorRaf = 0;
        return;
      }
      cursorRaf = window.requestAnimationFrame(renderCursor);
    };

    var showCursor = function () {
      dot.classList.add("is-visible");
      ring.classList.add("is-visible");
      halo.classList.add("is-visible");
    };

    var hideCursor = function () {
      dot.classList.remove("is-visible");
      ring.classList.remove("is-visible", "is-active", "is-pressed", "is-locked");
      halo.classList.remove("is-visible");
      alvoTravado = null;
    };

    document.addEventListener("pointermove", function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerMove = performance.now();
      showCursor();
      acordarCursor();
    });

    document.addEventListener("pointerover", function (event) {
      var target = event.target instanceof Element ? event.target.closest("a, button") : null;
      if (target) {
        ring.classList.add("is-active");
        ring.dataset.label = target.dataset.cursorLabel || "ABRIR";
      }
      var alvo = event.target instanceof Element ? event.target.closest(ALVO_SELETOR) : null;
      if (alvo && alvo !== alvoTravado) travarAlvo(alvo);
    });

    document.addEventListener("pointerout", function (event) {
      var from = event.target instanceof Element ? event.target.closest("a, button") : null;
      var to = event.relatedTarget instanceof Element ? event.relatedTarget.closest("a, button") : null;
      if (from && from !== to) {
        ring.classList.remove("is-active");
        ring.dataset.label = "";
      }
      var deAlvo = event.target instanceof Element ? event.target.closest(ALVO_SELETOR) : null;
      var paraAlvo = event.relatedTarget instanceof Element ? event.relatedTarget.closest(ALVO_SELETOR) : null;
      if (deAlvo && deAlvo === alvoTravado && deAlvo !== paraAlvo) soltarAlvo();
    });

    document.addEventListener("pointerdown", function () {
      ring.classList.add("is-pressed");
    });

    document.addEventListener("pointerup", function () {
      ring.classList.remove("is-pressed");
    });

    window.addEventListener(
      "scroll",
      function () {
        if (alvoTravado) acordarCursor();
      },
      { passive: true }
    );

    document.documentElement.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);

    cursorRaf = window.requestAnimationFrame(renderCursor);

    /* Botões magnéticos: acompanham levemente o ponteiro */
    var magneticItems = Array.prototype.slice.call(
      document.querySelectorAll(".button, .nav-whatsapp, .floating-whatsapp")
    );

    magneticItems.forEach(function (item) {
      item.addEventListener("pointermove", function (event) {
        var rect = item.getBoundingClientRect();
        var x = event.clientX - (rect.left + rect.width / 2);
        var y = event.clientY - (rect.top + rect.height / 2);
        item.style.transform = "translate3d(" + x * 0.12 + "px, " + y * 0.16 + "px, 0)";
        /* Magnet (React Bits): a camada interna (seta) desloca um extra,
           criando profundidade — o conteúdo "escapa" um pouco mais que o botão. */
        item.style.setProperty("--mgx", (x * 0.1).toFixed(2) + "px");
        item.style.setProperty("--mgy", (y * 0.12).toFixed(2) + "px");
      });
      item.addEventListener("pointerleave", function () {
        item.style.transform = "";
        item.style.setProperty("--mgx", "0px");
        item.style.setProperty("--mgy", "0px");
      });
    });
  }

  /* ---------- Acordeão do FAQ (um item aberto por vez) ---------- */
  var accordion = document.getElementById("faq-accordion");

  if (accordion) {
    var triggers = Array.prototype.slice.call(accordion.querySelectorAll(".faq-trigger"));

    var closeItem = function (trigger) {
      var content = document.getElementById(trigger.getAttribute("aria-controls"));
      trigger.setAttribute("aria-expanded", "false");
      if (!content) return;
      if (reducedMotion) {
        content.hidden = true;
        return;
      }
      content.dataset.fase = "fechando";
      content.style.transition = "height 260ms cubic-bezier(0.23, 1, 0.32, 1)";
      content.style.height = content.scrollHeight + "px";
      window.requestAnimationFrame(function () {
        content.style.height = "0px";
      });
      content.addEventListener(
        "transitionend",
        function () {
          if (content.dataset.fase !== "fechando") return;
          content.hidden = true;
          content.style.height = "";
        },
        { once: true }
      );
    };

    var openItem = function (trigger) {
      var content = document.getElementById(trigger.getAttribute("aria-controls"));
      trigger.setAttribute("aria-expanded", "true");
      if (!content) return;
      content.dataset.fase = "abrindo";
      content.hidden = false;
      if (reducedMotion) return;
      content.style.height = "0px";
      content.style.transition = "height 260ms cubic-bezier(0.23, 1, 0.32, 1)";
      window.requestAnimationFrame(function () {
        content.style.height = content.scrollHeight + "px";
      });
      content.addEventListener(
        "transitionend",
        function () {
          if (content.dataset.fase === "abrindo") content.style.height = "";
        },
        { once: true }
      );
    };

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        triggers.forEach(function (other) {
          if (other !== trigger && other.getAttribute("aria-expanded") === "true") closeItem(other);
        });
        if (isOpen) {
          closeItem(trigger);
        } else {
          openItem(trigger);
        }
      });
    });
  }

  /* ---------- Contadores da faixa de números ---------- */
  var counters = document.querySelectorAll(".counter");

  var runCounter = function (el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    if (reducedMotion) {
      el.textContent = target;
      return;
    }
    var start = null;
    var duration = 1400;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * eased);
      if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  if (counters.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        el.textContent = el.dataset.target;
      });
    } else {
      var counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }
  }

  /* ---------- Luz do herói que acompanha o mouse ---------- */
  var hero = document.querySelector(".hero");
  var spotlight = document.getElementById("hero-spotlight");

  if (hero && spotlight && finePointer && !reducedMotion) {
    var spotFrame = 0;
    var spotX = 0;
    var spotY = 0;

    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      spotX = event.clientX - rect.left - 320;
      spotY = event.clientY - rect.top - 320;
      spotlight.classList.add("is-on");
      if (spotFrame) return;
      spotFrame = window.requestAnimationFrame(function () {
        spotlight.style.transform = "translate3d(" + spotX + "px, " + spotY + "px, 0)";
        spotFrame = 0;
      });
    });

    hero.addEventListener("pointerleave", function () {
      spotlight.classList.remove("is-on");
    });
  }

  /* ============================================================
     CAMADA PROFISSIONAL — preloader, canvas de conexões, scramble,
     máscaras de linha, marquee com inércia, parallax, tilt+glare,
     label roll e peso variável por proximidade.
     ============================================================ */

  var docEl = document.documentElement;
  docEl.classList.add("js");

  /* ------------------------------------------------------------
     Salvaguarda: em aba de segundo plano (ou sem compositing) o
     relógio de animação do navegador congela e qualquer conteúdo
     que dependa de transição/animação para aparecer fica invisível.
     Se o relógio não andar, marcamos .no-anim e o CSS revela tudo.
     ------------------------------------------------------------ */
  (function () {
    var read = function () {
      return document.timeline ? document.timeline.currentTime : null;
    };
    var t1 = read();
    var checks = 0;
    var probe = window.setInterval(function () {
      checks++;
      var t2 = read();
      if (t1 !== null && t2 !== null && t2 > t1) {
        window.clearInterval(probe);
        docEl.classList.remove("no-anim");
        return;
      }
      if (checks >= 2) {
        window.clearInterval(probe);
        docEl.classList.add("no-anim");
      }
    }, 450);
  })();

  /* ---------- Abertura de marca: contagem 00 → 100 + cortina ----------
     Relógio real (Date.now + setInterval), nunca rAF: rAF congela em aba
     de segundo plano e deixaria a cortina presa. Três redes de segurança:
     o próprio intervalo, um setTimeout absoluto e uma animação CSS. */
  (function () {
    var loader = document.getElementById("preloader");
    var countEl = document.getElementById("preloader-count");

    var kill = function () {
      docEl.classList.add("page-ready");
      armarGarantiaHero();
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      document.body.style.overflow = "";
    };

    if (!loader || !countEl || reducedMotion) {
      kill();
      return;
    }

    docEl.classList.add("with-loader");
    document.body.style.overflow = "hidden";

    /* v26: 900ms de contagem + 600ms de cortina na 1ª visita da sessão;
       visita repetida (sessionStorage nx-seen) pula a contagem e mostra
       só a cortina, 400ms. O dono quer o preloader — ele fica, mais curto. */
    var visto = false;
    try {
      visto = window.sessionStorage.getItem("nx-seen") === "1";
    } catch (_) {}
    var t0 = Date.now();
    var DUR = visto ? 0 : 900;
    var CORTINA = visto ? 400 : 600;
    var ended = false;
    var iv = 0;
    if (visto) loader.classList.add("is-quick");

    var endLoader = function () {
      if (ended) return;
      ended = true;
      window.clearInterval(iv);
      countEl.textContent = "100";
      docEl.classList.add("page-ready");
      armarGarantiaHero();
      loader.classList.add("is-done");
      document.body.style.overflow = "";
      try {
        window.sessionStorage.setItem("nx-seen", "1");
      } catch (_) {}
      window.setTimeout(kill, CORTINA);
    };

    if (visto) {
      window.setTimeout(endLoader, 60);
    } else {
      iv = window.setInterval(function () {
        var p = Math.min((Date.now() - t0) / DUR, 1);
        var e = 1 - Math.pow(1 - p, 3);
        countEl.textContent = String(Math.round(e * 100)).padStart(2, "0");
        if (p >= 1) endLoader();
      }, 40);
    }

    window.setTimeout(endLoader, 1600);
    window.setTimeout(kill, 3200);
  })();

  /* ---------- Máscaras de linha do título do herói ---------- */
  if (!reducedMotion) {
    document.querySelectorAll(".hero h1 .hero-title-line").forEach(function (line, i) {
      var inner = document.createElement("span");
      inner.className = "tl-inner";
      inner.style.setProperty("--i", i);
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
      line.classList.add("tl-mask");
    });
  }

  /* ---------- Títulos de seção: palavras sobem do desfoque ----------
     Evolução da máscara de recorte: cada palavra entra em degradê
     blur→nítido quando a seção aparece, uma vez só. O texto segue
     inteiro no DOM; sem JS ou com movimento reduzido, fica a
     revelação antiga. */
  if (!reducedMotion) {
    document.querySelectorAll(".section-heading h2").forEach(function (h2) {
      var idx = 0;
      var envolver = function (no) {
        var partes = no.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        partes.forEach(function (parte) {
          if (!parte) return;
          if (/^\s+$/.test(parte)) {
            frag.appendChild(document.createTextNode(parte));
            return;
          }
          var s = document.createElement("span");
          s.className = "w-reveal";
          s.style.setProperty("--wi", idx++);
          s.textContent = parte;
          frag.appendChild(s);
        });
        no.parentNode.replaceChild(frag, no);
      };
      Array.prototype.slice.call(h2.childNodes).forEach(function (no) {
        if (no.nodeType === 3) {
          envolver(no);
        } else if (no.nodeType === 1 && no.tagName !== "BR") {
          Array.prototype.slice.call(no.childNodes).forEach(function (interno) {
            if (interno.nodeType === 3) envolver(interno);
          });
        }
      });
      h2.classList.add("is-split");
    });
  }

  /* Garantia final do herói: é a primeira coisa que o visitante vê,
     então 1,6s depois de a página ser liberada (page-ready) ele aparece
     na marra — sem depender de transição, animação ou observer.
     transition:none cancela qualquer transição congelada, que de outro
     modo venceria. Agendada por endLoader/kill para não atropelar a
     entrada recém-liberada do título. */
  function armarGarantiaHero() {
    if (armarGarantiaHero.armada) return;
    armarGarantiaHero.armada = true;
    window.setTimeout(function () {
      document.querySelectorAll(".hero .tl-inner").forEach(function (n) {
        n.style.transition = "none";
        n.style.transform = "none";
      });
    }, 1600);
  }

  /* ---------- Malha reativa do herói: grade de nós que acende ----------
     Em repouso é uma grade discreta; o ponteiro acende as ligações em
     bronze e ondas de choque atravessam a rede. É a marca "Nexus"
     contando a própria história: conexão aparece quando há interação.
     Decoração pura — pointer-events:none, atrás de tudo. */
  (function () {
    var cv = document.getElementById("nx-net");
    var host = document.querySelector(".hero");
    if (!cv || !host || !cv.getContext) return;

    var ctx = cv.getContext("2d");
    var GAP = 34;
    var MR = 190;
    var w = 0, h = 0, cols = 0, rows = 0;
    var pt = [], rip = [];
    var raf = 0, vis = false, t = 0, rt = 0, nextAuto = 0;
    var mx = -1e4, my = -1e4;
    /* v26: no toque o canvas cobre só a primeira tela do herói (não os
       1.700px inteiros), desenha em dpr 1, malha mais aberta e 30fps. */
    var COARSE = window.matchMedia("(pointer: coarse)").matches;
    var pular = false;

    function fit() {
      var dpr = COARSE ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      if (COARSE) {
        cv.style.height = Math.min(host.clientHeight, Math.round(window.innerHeight * 1.2)) + "px";
      }
      w = cv.clientWidth;
      h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      GAP = COARSE ? 56 : w < 760 ? 44 : 34;
      cols = Math.ceil(w / GAP) + 1;
      rows = Math.ceil(h / GAP) + 1;
      pt = [];
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          pt.push({ gx: x * GAP, gy: y * GAP, x: x * GAP, y: y * GAP, e: 0 });
        }
      }
      semearPoeira();
      semearFios();
    }

    function ripple(x, y) {
      if (rip.length > 5) rip.shift();
      rip.push({ x: x, y: y, t: 0 });
    }

    function step(dt) {
      t += dt;
      if (t > nextAuto) {
        nextAuto = t + 2.6 + Math.random() * 2.4;
        ripple(Math.random() * w, Math.random() * h);
      }
      var i;
      for (i = rip.length - 1; i >= 0; i--) {
        rip[i].t += dt;
        if (rip[i].t > 3.2) rip.splice(i, 1);
      }
      for (i = 0; i < pt.length; i++) {
        var p = pt[i];
        var gx = p.gx, gy = p.gy;
        var e = 0.14 + 0.11 * Math.sin((gx + gy * 0.6) * 0.01 - t * 1.05);
        var ox = 0, oy = 0;
        var dx = gx - mx, dy = gy - my;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < MR) {
          var f = 1 - d / MR;
          f *= f;
          e += f * 0.85;
          if (d > 1) {
            ox += (dx / d) * f * 13;
            oy += (dy / d) * f * 13;
          }
        }
        for (var r = 0; r < rip.length; r++) {
          var R = rip[r];
          var rx = gx - R.x, ry = gy - R.y;
          var rd = Math.sqrt(rx * rx + ry * ry);
          var u = (rd - R.t * 340) / 74;
          if (u > -3 && u < 3) {
            var amp = Math.exp(-u * u) * Math.exp(-R.t * 1.25) * Math.exp(-rd * 0.0016);
            e += amp * 0.95;
            if (rd > 1) {
              ox -= (rx / rd) * amp * 15;
              oy -= (ry / rd) * amp * 15;
            }
          }
        }
        p.x = gx + ox;
        p.y = gy + oy;
        p.e = e > 1 ? 1 : e;
      }
    }

    /* Poeira em três camadas: dá profundidade sem custo perceptível.
       Cada camada se move em velocidade diferente (paralaxe). */
    var poeira = [];
    function semearPoeira() {
      poeira = [];
      var n = Math.max(30, Math.min(90, Math.round((w * h) / 24000)));
      for (var i = 0; i < n; i++) {
        var camada = i % 3;
        poeira.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: camada,
          v: 0.05 + camada * 0.07,
          fase: Math.random() * Math.PI * 2,
          tam: 0.6 + camada * 0.5
        });
      }
    }

    /* Fios de fluxo: filamentos bronze quase estáticos atravessando o
       herói atrás da malha. Perto do ponteiro a onda cresce e o traço
       acende; longe dele, quase param — a mesma história da marca,
       contada em outra camada. */
    var fios = [];
    function semearFios() {
      fios = [];
      var n = w < 760 ? 4 : 7;
      for (var i = 0; i < n; i++) {
        fios.push({
          y: h * (0.14 + (0.72 * i) / Math.max(1, n - 1)) + (Math.random() - 0.5) * h * 0.05,
          f1: 0.0028 + Math.random() * 0.0022,
          f2: 0.007 + Math.random() * 0.005,
          p1: Math.random() * Math.PI * 2,
          p2: Math.random() * Math.PI * 2,
          v: 0.18 + Math.random() * 0.26,
          amp: 9 + Math.random() * 14
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var i, b, p, q;

      /* fios de fluxo, atrás de tudo */
      var PASSO = 24;
      for (i = 0; i < fios.length; i++) {
        var fio = fios[i];
        var pts = [];
        for (var fx = 0; fx <= w + PASSO; fx += PASSO) {
          var dxm = fx - mx;
          var dym = fio.y - my;
          var prox = Math.exp(-(dxm * dxm + dym * dym) / 90000);
          pts.push({
            x: fx,
            y:
              fio.y +
              Math.sin(fx * fio.f1 + t * fio.v + fio.p1) * fio.amp * (1 + prox * 1.9) +
              Math.sin(fx * fio.f2 - t * fio.v * 0.6 + fio.p2) * fio.amp * 0.35,
            e: prox
          });
        }
        for (b = 0; b < 3; b++) {
          ctx.beginPath();
          var tem = false;
          for (var seg = 1; seg < pts.length; seg++) {
            if (Math.min(2, (pts[seg].e * 3.4) | 0) !== b) continue;
            ctx.moveTo(pts[seg - 1].x, pts[seg - 1].y);
            ctx.lineTo(pts[seg].x, pts[seg].y);
            tem = true;
          }
          if (!tem) continue;
          ctx.lineWidth = b ? 1 : 0.8;
          ctx.strokeStyle = "rgba(176,118,31," + (0.055 + b * 0.1).toFixed(3) + ")";
          ctx.stroke();
        }
      }

      /* poeira ao fundo, antes da malha */
      for (i = 0; i < poeira.length; i++) {
        var d = poeira[i];
        d.y -= d.v;
        d.x += Math.sin(t * 0.5 + d.fase) * 0.12;
        if (d.y < -4) {
          d.y = h + 4;
          d.x = Math.random() * w;
        }
        var brilho = 0.1 + d.z * 0.07 + Math.sin(t * 1.6 + d.fase) * 0.05;
        ctx.fillStyle = "rgba(245,233,214," + Math.max(0, brilho).toFixed(3) + ")";
        ctx.fillRect(d.x, d.y, d.tam, d.tam);
      }

      ctx.lineWidth = 1;
      for (b = 0; b < 3; b++) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(176,118,31," + (0.1 + b * 0.16) + ")";
        for (i = 0; i < pt.length; i++) {
          p = pt[i];
          if (((p.e * 3.2) | 0) !== b + 1 && !(b === 2 && p.e > 0.94)) continue;
          if ((i + 1) % cols) {
            q = pt[i + 1];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
          q = pt[i + cols];
          if (q) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
        }
        ctx.stroke();
      }
      for (b = 0; b < 4; b++) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(245,233,214," + (0.13 + b * 0.19) + ")";
        var s = 1.4 + b * 0.7;
        for (i = 0; i < pt.length; i++) {
          p = pt[i];
          if (Math.min(3, (p.e * 4) | 0) !== b) continue;
          ctx.rect(p.x - s / 2, p.y - s / 2, s, s);
        }
        ctx.fill();
      }
    }

    var last = 0;
    function loop(ts) {
      if (COARSE) {
        pular = !pular;
        if (pular) {
          raf = window.requestAnimationFrame(loop);
          return;
        }
      }
      var dt = Math.min(0.08, (ts - last) / 1000) || 0.016;
      last = ts;
      step(dt);
      draw();
      raf = window.requestAnimationFrame(loop);
    }
    function play() {
      if (!raf && vis && !document.hidden && !reducedMotion) {
        last = performance.now();
        raf = window.requestAnimationFrame(loop);
      }
    }
    function stop() {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    fit();
    step(0.016);
    draw();
    if (reducedMotion) return;

    new IntersectionObserver(function (e) {
      vis = e[0].isIntersecting;
      if (vis) play();
      else stop();
    }).observe(cv);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else play();
    });
    host.addEventListener(
      "pointermove",
      function (e) {
        var r = cv.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
      },
      { passive: true }
    );
    host.addEventListener("pointerleave", function () {
      mx = -1e4;
      my = -1e4;
    });
    host.addEventListener(
      "pointerdown",
      function (e) {
        var r = cv.getBoundingClientRect();
        ripple(e.clientX - r.left, e.clientY - r.top);
      },
      { passive: true }
    );
    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(rt);
        rt = window.setTimeout(fit, 200);
      },
      { passive: true }
    );
  })();

  /* ---------- Sinal vivo: pulso no chat, nos painéis e no WhatsApp ----------
     Um único interruptor por IntersectionObserver. Só liga o que está na
     tela; nada aqui esconde conteúdo — é só vida em cima do que já existe. */
  (function () {
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          e.target.classList.toggle("nx-live", e.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll(".operation-panel").forEach(function (n) {
      io.observe(n);
    });

    var heroSec = document.getElementById("inicio");
    if (heroSec) {
      new IntersectionObserver(
        function (entries) {
          docEl.classList.toggle("nx-past-hero", !entries[entries.length - 1].isIntersecting);
        },
        { threshold: 0 }
      ).observe(heroSec);
    }

    document.addEventListener("visibilitychange", function () {
      docEl.classList.toggle("nx-idle", document.hidden);
    });
  })();

  /* ---------- Parallax suave nas imagens dos projetos ----------
     A imagem desliza um pouco dentro da moldura conforme a página rola.
     Puramente decorativo: se não rodar, a imagem fica parada e visível. */
  (function () {
    if (reducedMotion) return;
    var shots = Array.prototype.slice.call(document.querySelectorAll(".project-shot img"));
    if (!shots.length || !("IntersectionObserver" in window)) return;

    var ativos = [];
    var raf = 0;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          var i = ativos.indexOf(e.target);
          if (e.isIntersecting && i === -1) ativos.push(e.target);
          else if (!e.isIntersecting && i !== -1) ativos.splice(i, 1);
        });
        if (ativos.length && !raf) laco();
      },
      { threshold: 0.05 }
    );
    shots.forEach(function (s) {
      s.style.willChange = "transform";
      io.observe(s);
    });

    function laco() {
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        var vh = window.innerHeight;
        for (var i = 0; i < ativos.length; i++) {
          var img = ativos[i];
          var r = img.getBoundingClientRect();
          var centro = r.top + r.height / 2 - vh / 2;
          var desloc = Math.max(-14, Math.min(14, (centro / vh) * -18));
          img.style.transform = "scale(1.09) translate3d(0, " + desloc.toFixed(2) + "px, 0)";
        }
        if (ativos.length) laco();
      });
    }
  })();

  /* ---------- Rodapé entra em cascata ---------- */
  (function () {
    if (reducedMotion || !("IntersectionObserver" in window)) return;
    var rodape = document.querySelector(".site-footer");
    if (!rodape) return;
    var io = new IntersectionObserver(
      function (e) {
        if (e[0].isIntersecting) {
          rodape.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(rodape);
    window.setTimeout(function () {
      rodape.classList.add("is-in");
    }, 8000);
  })();

  /* ---------- Linha do tempo do processo: desenha ao entrar ---------- */
  (function () {
    var lista = document.querySelector(".process-list");
    if (!lista) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      lista.classList.add("is-drawn");
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          lista.classList.add("is-drawn");
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(lista);
    /* garantia: se o observer não disparar, desenha assim mesmo */
    window.setTimeout(function () {
      lista.classList.add("is-drawn");
    }, 6000);
  })();

  /* ---------- Luzes de fundo das seções: pausam fora da viewport ---------- */
  (function () {
    if (!("IntersectionObserver" in window)) return;
    document.querySelectorAll(".nx-mesh").forEach(function (el) {
      new IntersectionObserver(function (e) {
        el.classList.toggle("is-idle", !e[0].isIntersecting);
      }).observe(el);
    });
  })();

  /* ---------- Scramble/decode dos rótulos monoespaçados ---------- */
  (function () {
    if (reducedMotion) return;
    var POOL = "!<>-_\\/[]{}=+*^?#";

    function scramble(el) {
      var to = el.dataset.scrText;
      var queue = [];
      for (var i = 0; i < to.length; i++) {
        var start = (Math.random() * 22) | 0;
        queue.push({ to: to[i], start: start, end: start + ((Math.random() * 24) | 0), ch: "" });
      }
      var frameN = 0;
      var rafId = null;
      var update = function () {
        var out = "";
        var done = 0;
        for (var k = 0; k < queue.length; k++) {
          var q = queue[k];
          if (frameN >= q.end) {
            done++;
            out += q.to === "<" ? "&lt;" : q.to;
          } else if (frameN >= q.start) {
            if (!q.ch || Math.random() < 0.28) q.ch = POOL[(Math.random() * POOL.length) | 0];
            out += '<span class="dud">' + (q.ch === "<" ? "&lt;" : q.ch) + "</span>";
          } else {
            out += " ";
          }
        }
        el.innerHTML = out;
        if (done < queue.length) {
          frameN++;
          rafId = window.requestAnimationFrame(update);
        }
      };
      update();
    }

    var targets = [];
    document.querySelectorAll(".eyebrow").forEach(function (eyebrow) {
      var nodes = Array.prototype.slice.call(eyebrow.childNodes).filter(function (n) {
        return n.nodeType === 3 && n.textContent.trim();
      });
      if (!nodes.length) return;
      var text = nodes
        .map(function (n) {
          return n.textContent;
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      var span = document.createElement("span");
      span.className = "scr";
      span.dataset.scrText = text;
      span.setAttribute("aria-label", text);
      span.textContent = text;
      nodes.forEach(function (n) {
        eyebrow.removeChild(n);
      });
      eyebrow.insertBefore(span, eyebrow.querySelector("span:not(.scr)") ? eyebrow.children[1] || null : null);
      targets.push(span);
    });

    var scrObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            scrObserver.unobserve(entry.target);
            scramble(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    targets.forEach(function (t) {
      scrObserver.observe(t);
    });
  })();

  /* ---------- Loop central de scroll: inércia, marquee e parallax ---------- */
  (function () {
    if (reducedMotion) return;

    var state = { target: window.scrollY, current: window.scrollY, velocity: 0 };
    /* v26: o laço dorme quando a página está parada e nada que ele move
       está na tela (ticker, paralaxe, NEXUS gigante); acorda no scroll
       e quando um desses entra na viewport. */
    var loopRaf = 0;
    var lastTs = 0;
    var acordarLoop = function () {
      if (!loopRaf && !document.hidden) {
        lastTs = 0;
        loopRaf = window.requestAnimationFrame(frame);
      }
    };
    window.addEventListener(
      "scroll",
      function () {
        state.target = window.scrollY;
        acordarLoop();
      },
      { passive: true }
    );

    var ticker = document.querySelector(".motion-ticker");
    var track = ticker ? ticker.querySelector(".ticker-track") : null;
    var blockW = 0;
    var tickerVisible = false;
    var marqueeX = 0;
    if (ticker && track) {
      ticker.classList.add("js-marquee");
      var measure = function () {
        blockW = track.scrollWidth / 2;
      };
      measure();
      window.addEventListener("resize", function () {
        window.setTimeout(measure, 200);
      });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      new IntersectionObserver(function (entries) {
        tickerVisible = entries[0].isIntersecting;
        if (tickerVisible) acordarLoop();
      }).observe(ticker);
    }

    var plxItems = Array.prototype.slice
      .call(document.querySelectorAll("[data-speed]"))
      .filter(function (el) {
        /* Em coluna única (< 840px) o visual do herói fica logo abaixo do
           texto: o deslocamento o empurrava por cima das notas do herói. */
        return !(el.id === "hero-visual" && !window.matchMedia("(min-width: 840px)").matches);
      })
      .map(function (el) {
        return { el: el, speed: +el.dataset.speed, top: 0, h: 0, visible: false };
      });
    var measurePlx = function () {
      plxItems.forEach(function (item) {
        var r = item.el.getBoundingClientRect();
        item.top = r.top + window.scrollY;
        item.h = r.height;
      });
    };
    measurePlx();
    window.addEventListener("load", measurePlx);
    window.addEventListener("resize", function () {
      window.setTimeout(measurePlx, 200);
    });
    var plxObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var item = plxItems.find(function (i) {
            return i.el === entry.target;
          });
          if (item) item.visible = entry.isIntersecting;
        });
        acordarLoop();
      },
      { rootMargin: "20%" }
    );
    plxItems.forEach(function (item) {
      plxObserver.observe(item.el);
    });

    var brandWord = document.querySelector(".brand-moment-word");
    var brandMoment = document.querySelector(".brand-moment");
    var brandVisible = false;
    if (brandMoment) {
      new IntersectionObserver(function (entries) {
        brandVisible = entries[0].isIntersecting;
        if (brandVisible) acordarLoop();
      }).observe(brandMoment);
    }

    function frame(ts) {
      var dt = lastTs ? Math.min((ts - lastTs) / 16.67, 4) : 1;
      lastTs = ts;

      state.current += (state.target - state.current) * 0.1;
      state.velocity = state.target - state.current;
      var parado = Math.abs(state.velocity) < 0.05;
      if (parado) state.current = state.target;

      var skew = Math.max(-5, Math.min(5, state.velocity * 0.05));

      if (track && tickerVisible && blockW > 0) {
        marqueeX -= (0.6 + state.velocity * 0.25) * dt;
        var wrapped = ((marqueeX % blockW) + blockW) % blockW;
        track.style.transform = "translate3d(" + -wrapped.toFixed(2) + "px, 0, 0) skewX(" + skew.toFixed(3) + "deg)";
      }

      var plxVivo = false;
      for (var i = 0; i < plxItems.length; i++) {
        var item = plxItems[i];
        if (!item.visible) continue;
        plxVivo = true;
        var center = state.current + window.innerHeight / 2 - (item.top + item.h / 2);
        item.el.style.translate = "0 " + (center * (1 - item.speed)).toFixed(2) + "px";
      }

      if (brandWord && brandVisible) {
        var r = brandMoment.getBoundingClientRect();
        var progress = 1 - (r.top + r.height) / (window.innerHeight + r.height);
        brandWord.style.translate = (progress - 0.5) * -70 + "px 0";
      }

      /* Página parada e nada em movimento na tela: dorme. O ticker é o
         único que anda sozinho — enquanto ele está visível o laço segue. */
      if (parado && !tickerVisible && !brandVisible && !plxVivo) {
        loopRaf = 0;
        return;
      }
      loopRaf = window.requestAnimationFrame(frame);
    }
    acordarLoop();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (loopRaf) {
          window.cancelAnimationFrame(loopRaf);
          loopRaf = 0;
        }
      } else acordarLoop();
    });
  })();

  /* ---------- Tilt 3D + glare nos cartões ---------- */
  (function () {
    if (reducedMotion || !finePointer || !window.matchMedia("(hover: hover)").matches) return;
    var cards = document.querySelectorAll(".project-card, .offer-card, .package-card");
    cards.forEach(function (card) {
      var glare = document.createElement("span");
      glare.className = "card-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);

      var rect = null;
      var rafId = null;
      var ev = null;
      var maxTilt = card.classList.contains("project-card") ? 7 : card.classList.contains("package-card") ? 0 : 5;

      card.addEventListener("pointerenter", function () {
        rect = card.getBoundingClientRect();
      });
      card.addEventListener(
        "pointermove",
        function (event) {
          ev = event;
          if (rafId) return;
          rafId = window.requestAnimationFrame(function () {
            rafId = null;
            if (!rect) rect = card.getBoundingClientRect();
            var px = (ev.clientX - rect.left) / rect.width - 0.5;
            var py = (ev.clientY - rect.top) / rect.height - 0.5;
            card.style.setProperty("--ry", (px * maxTilt).toFixed(2) + "deg");
            card.style.setProperty("--rx", (-py * maxTilt).toFixed(2) + "deg");
            card.style.setProperty("--mx", ((px + 0.5) * 100).toFixed(1) + "%");
            card.style.setProperty("--my", ((py + 0.5) * 100).toFixed(1) + "%");
            card.style.setProperty("--go", "1");
          });
        },
        { passive: true }
      );
      card.addEventListener("pointerleave", function () {
        rect = null;
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--go", "0");
      });
    });
  })();

  /* ---------- Label roll nos botões ---------- */
  (function () {
    if (reducedMotion) return;
    document.querySelectorAll(".button, .nav-whatsapp").forEach(function (btn) {
      var textNode = Array.prototype.slice.call(btn.childNodes).find(function (n) {
        return n.nodeType === 3 && n.textContent.trim();
      });
      if (!textNode) return;
      var text = textNode.textContent.trim();
      var lbl = document.createElement("span");
      lbl.className = "lbl";
      var a = document.createElement("span");
      a.textContent = text;
      var b = document.createElement("span");
      b.textContent = text;
      b.setAttribute("aria-hidden", "true");
      lbl.appendChild(a);
      lbl.appendChild(b);
      btn.replaceChild(lbl, textNode);
    });
  })();

  /* ---------- NEXUS gigante: peso variável por proximidade (lerp) ----------
     Porte do VariableProximity (React Bits): dentro do bloco de marca,
     cada letra pesa conforme a distância ao cursor (raio 160px) — o peso
     atual persegue o alvo num rAF que dorme ao assentar. Só liga depois
     do contorno bronze inundar (.is-filled), para não brigar com a
     transição de preenchimento. Ponteiro fino; reduced-motion desliga. */
  (function () {
    if (reducedMotion || !finePointer) return;
    var word = document.querySelector(".brand-moment-word");
    var section = document.querySelector(".brand-moment");
    if (!word || !section) return;
    var letters = Array.prototype.slice.call(word.children);
    var RAIO = 160;
    var REPOUSO = 700;
    var LEVE = 470;
    var atual = letters.map(function () {
      return REPOUSO;
    });
    var escrito = atual.slice();
    var rects = [];
    var raf = 0;
    var mx = 0;
    var my = 0;
    var dentro = false;

    var cache = function () {
      rects = letters.map(function (l) {
        var r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY };
      });
    };
    cache();
    window.addEventListener("resize", function () {
      window.setTimeout(cache, 250);
    });
    window.addEventListener(
      "scroll",
      function () {
        window.clearTimeout(word.__ct);
        word.__ct = window.setTimeout(cache, 200);
      },
      { passive: true }
    );

    var quadro = function () {
      var resto = 0;
      for (var i = 0; i < letters.length; i++) {
        var alvo = REPOUSO;
        if (dentro && rects[i]) {
          var d = Math.hypot(mx - rects[i].x, my - rects[i].y);
          var t = Math.max(0, 1 - d / RAIO);
          t = t * t * (3 - 2 * t);
          alvo = LEVE + (REPOUSO - LEVE) * t;
        }
        atual[i] += (alvo - atual[i]) * 0.18;
        resto += Math.abs(alvo - atual[i]);
        var w = Math.round(atual[i]);
        if (w !== escrito[i]) {
          escrito[i] = w;
          letters[i].style.fontVariationSettings = "'wght' " + w;
        }
      }
      if (resto > 0.4) raf = window.requestAnimationFrame(quadro);
      else raf = 0;
    };
    var acordar = function () {
      if (!raf) raf = window.requestAnimationFrame(quadro);
    };

    var ligado = false;
    var ligar = function () {
      if (ligado) return;
      ligado = true;
      word.classList.add("nx-prox");
      section.addEventListener(
        "pointermove",
        function (event) {
          mx = event.clientX;
          my = event.clientY + window.scrollY;
          dentro = true;
          acordar();
        },
        { passive: true }
      );
      section.addEventListener("pointerleave", function () {
        dentro = false;
        acordar();
      });
    };

    if (word.classList.contains("is-filled")) {
      window.setTimeout(ligar, 900);
    } else {
      var mo = new MutationObserver(function () {
        if (word.classList.contains("is-filled")) {
          mo.disconnect();
          window.setTimeout(ligar, 900);
        }
      });
      mo.observe(word, { attributes: true, attributeFilter: ["class"] });
    }
  })();

  /* ---------- Painel do herói: split-flap mecânico ----------
     O strong do hero-status vira um painel de aeroporto: cada célula
     "claca" por alguns glifos até assentar na frase seguinte. O texto
     real fica num span.sr-only; o painel animado é decorativo. */
  (function () {
    var board = document.querySelector(".hero-flap-board");
    if (!board) return;

    var FRASES = [
      "SITE + ATENDIMENTO + CONTEÚDO",
      "IA RESPONDENDO NO WHATSAPP",
      "ORÇAMENTO SENDO ACOMPANHADO"
    ];
    var LARG = FRASES.reduce(function (m, f) {
      return Math.max(m, f.length);
    }, 0);
    FRASES = FRASES.map(function (f) {
      while (f.length < LARG) f += " ";
      return f;
    });

    var celulas = [];
    for (var i = 0; i < LARG; i++) {
      var cel = document.createElement("span");
      cel.textContent = FRASES[0][i] === " " ? " " : FRASES[0][i];
      board.appendChild(cel);
      celulas.push(cel);
    }
    if (reducedMotion) return;

    var POOL = "!<>-_\\/[]{}=+*^?#";
    var atual = FRASES[0];
    var idx = 0;
    var raf = 0;

    function virar(destino) {
      var planos = [];
      for (var i = 0; i < LARG; i++) {
        if (atual[i] === destino[i]) continue;
        var seq = [];
        var flips = 2 + ((Math.random() * 3) | 0);
        for (var f = 0; f < flips; f++) seq.push(POOL[(Math.random() * POOL.length) | 0]);
        seq.push(destino[i]);
        planos.push({ i: i, seq: seq, inicio: i * 80, passo: -1 });
      }
      atual = destino;
      if (!planos.length) return;
      var t0 = performance.now();
      var tick = function (agora) {
        var vivo = false;
        var dt = agora - t0;
        for (var k = 0; k < planos.length; k++) {
          var p = planos[k];
          var local = dt - p.inicio;
          if (local < 0) {
            vivo = true;
            continue;
          }
          var passo = Math.min((local / 70) | 0, p.seq.length - 1);
          if (passo !== p.passo) {
            p.passo = passo;
            var ch = p.seq[passo];
            celulas[p.i].textContent = ch === " " ? " " : ch;
            celulas[p.i].classList.toggle("is-flip", passo < p.seq.length - 1);
          }
          if (passo < p.seq.length - 1) vivo = true;
        }
        if (vivo) raf = window.requestAnimationFrame(tick);
        else raf = 0;
      };
      raf = window.requestAnimationFrame(tick);
    }

    window.setInterval(function () {
      if (raf || document.hidden) return;
      if (docEl.classList.contains("nx-past-hero") || docEl.classList.contains("nx-idle")) return;
      idx = (idx + 1) % FRASES.length;
      virar(FRASES[idx]);
    }, 4500);
  })();

  /* ---------- NEXUS gigante: contorno bronze que inunda ao entrar ---------- */
  (function () {
    var word = document.querySelector(".brand-moment-word");
    var section = document.querySelector(".brand-moment");
    if (!word || !section) return;
    Array.prototype.slice.call(word.children).forEach(function (l, i) {
      l.style.setProperty("--fill-i", i);
    });
    if (reducedMotion || !("IntersectionObserver" in window)) {
      word.classList.add("is-filled");
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          word.classList.add("is-filled");
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(section);
  })();

  /* ============================================================
     v20 — shuffle na nav, CountUp nos pacotes, FAQ em cascata
     e RippleGrid no contato.
     ============================================================ */

  /* ---------- Shuffle: links da nav embaralham letras ao pousar ----------
     Porte do Shuffle/DecryptedText (React Bits): ~220ms de glifos
     aleatórios resolvendo da esquerda para a direita. O fantasma de
     peso (::after com data-text) mantém a largura estável. */
  (function () {
    if (reducedMotion || !finePointer) return;
    var POOL = "!<>-_\\/[]{}=+*^?#";
    document.querySelectorAll(".primary-nav > a:not(.nav-whatsapp)").forEach(function (link) {
      var original = link.textContent.trim();
      if (!original) return;
      var vivo = false;
      link.addEventListener("pointerenter", function () {
        if (vivo) return;
        vivo = true;
        link.classList.add("is-shuffling");
        var t0 = performance.now();
        var DUR = 220;
        var tick = function (agora) {
          var p = (agora - t0) / DUR;
          if (p >= 1) {
            link.textContent = original;
            link.classList.remove("is-shuffling");
            vivo = false;
            return;
          }
          var fixas = Math.floor(p * original.length);
          var out = "";
          for (var i = 0; i < original.length; i++) {
            var ch = original[i];
            out += i < fixas || ch === " " ? ch : POOL[(Math.random() * POOL.length) | 0];
          }
          link.textContent = out;
          window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      });
    });
  })();

  /* ---------- CountUp nos pacotes: preço e prazo contam ao entrar ----------
     Porte do CountUp (React Bits): o número sobe de zero com easing
     exponencial e separador de milhar pt-BR. O texto final já está no
     HTML; sem JS ou com movimento reduzido, nada muda. */
  (function () {
    if (reducedMotion || !("IntersectionObserver" in window)) return;
    var alvos = [];
    document.querySelectorAll(".package-card").forEach(function (card) {
      var preco = card.querySelector(".price-block strong");
      var prazo = card.querySelector(".package-topline span:last-child");
      [preco, prazo].forEach(function (el) {
        if (!el) return;
        var txt = el.textContent;
        var m = txt.match(/(\d[\d.]*)/);
        if (!m) return;
        alvos.push({
          el: el,
          alvo: parseInt(m[1].replace(/\./g, ""), 10),
          pre: txt.slice(0, m.index),
          pos: txt.slice(m.index + m[1].length)
        });
      });
    });
    if (!alvos.length) return;

    var fmt = function (n) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    var contar = function (item) {
      var t0 = null;
      var DUR = 1100;
      var passo = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / DUR, 1);
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        item.el.textContent = item.pre + fmt(Math.round(item.alvo * e)) + item.pos;
        if (p < 1) window.requestAnimationFrame(passo);
      };
      window.requestAnimationFrame(passo);
    };

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          var item = alvos.find(function (a) {
            return a.el === entry.target;
          });
          if (item) contar(item);
        });
      },
      { threshold: 0.6 }
    );
    alvos.forEach(function (a) {
      io.observe(a.el);
    });
  })();

  /* ---------- AnimatedList no FAQ: palavras da resposta em cascata ----------
     Cada resposta é dividida em palavras uma única vez; ao abrir o item
     (hidden removido), a animação CSS entra escalonada. O texto segue
     inteiro e legível no DOM. */
  (function () {
    if (reducedMotion) return;
    document.querySelectorAll(".faq-content p").forEach(function (p) {
      var idx = 0;
      var frag = document.createDocumentFragment();
      p.textContent.split(/(\s+)/).forEach(function (parte) {
        if (!parte) return;
        if (/^\s+$/.test(parte)) {
          frag.appendChild(document.createTextNode(parte));
          return;
        }
        var s = document.createElement("span");
        s.className = "faq-w";
        s.style.setProperty("--li", Math.min(idx++, 26));
        s.textContent = parte;
        frag.appendChild(s);
      });
      p.textContent = "";
      p.appendChild(frag);
      p.classList.add("is-lista");
    });
  })();

  /* ---------- RippleGrid bronze no fundo do contato ----------
     Porte em Canvas 2D do RippleGrid (React Bits): grade discreta de
     pontos que ondas circulares acendem de tempos em tempos (e no
     clique). Pausa fora da viewport, com aba oculta e em reduced-motion. */
  (function () {
    if (reducedMotion) return;
    var sec = document.getElementById("contato");
    if (!sec || !("IntersectionObserver" in window)) return;

    var cv = document.createElement("canvas");
    cv.className = "contact-ripple";
    cv.setAttribute("aria-hidden", "true");
    sec.insertBefore(cv, sec.firstChild);
    var ctx = cv.getContext("2d");
    if (!ctx) return;

    var w = 0, h = 0, GAP = 46, cols = 0, rows = 0;
    var raf = 0, vis = false, t = 0, rt = 0, nextAuto = 0;
    var rip = [];
    var lastTs = 0;
    /* v26: no toque a grade é 2× mais aberta, dpr 1 e o canvas cobre
       só a altura de uma tela e meia (a seção cresce com o diagnóstico). */
    var COARSE = window.matchMedia("(pointer: coarse)").matches;

    function fit() {
      var dpr = COARSE ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      if (COARSE) cv.style.height = Math.min(sec.clientHeight, Math.round(window.innerHeight * 1.5)) + "px";
      w = cv.clientWidth;
      h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      GAP = COARSE ? 96 : w < 760 ? 54 : 46;
      cols = Math.ceil(w / GAP) + 1;
      rows = Math.ceil(h / GAP) + 1;
    }

    function ripple(x, y) {
      if (rip.length > 4) rip.shift();
      rip.push({ x: x, y: y, t: 0 });
    }

    function quadro(ts) {
      /* dt real: em telas de 120/144Hz as ondas andam na mesma
         velocidade que a 60Hz, em vez de 2x mais rápido. */
      var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;
      t += dt;
      if (t > nextAuto) {
        nextAuto = t + 3.4 + Math.random() * 2.6;
        ripple(w * (0.15 + Math.random() * 0.7), h * (0.15 + Math.random() * 0.7));
      }
      for (var i = rip.length - 1; i >= 0; i--) {
        rip[i].t += dt;
        if (rip[i].t > 3.4) rip.splice(i, 1);
      }
      ctx.clearRect(0, 0, w, h);
      for (var gy = 0; gy < rows; gy++) {
        for (var gx = 0; gx < cols; gx++) {
          var x = gx * GAP;
          var y = gy * GAP;
          var e = 0.05 + 0.025 * Math.sin((x + y * 0.7) * 0.012 + t * 0.8);
          for (var r = 0; r < rip.length; r++) {
            var R = rip[r];
            var dx = x - R.x;
            var dy = y - R.y;
            var rd = Math.sqrt(dx * dx + dy * dy);
            var u = (rd - R.t * 260) / 90;
            if (u > -3 && u < 3) {
              e += Math.exp(-u * u) * Math.exp(-R.t * 1.1) * 0.24;
            }
          }
          if (e <= 0.012) continue;
          ctx.fillStyle = "rgba(176,118,31," + Math.min(0.32, e).toFixed(3) + ")";
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
      raf = window.requestAnimationFrame(quadro);
    }

    function play() {
      if (!raf && vis && !document.hidden) {
        lastTs = 0;
        raf = window.requestAnimationFrame(quadro);
      }
    }
    function stop() {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    fit();
    /* v26: só desenha com pelo menos 8% da seção na tela (antes rodava
       com 1px visível, do FAQ até o rodapé). Observa o próprio canvas. */
    new IntersectionObserver(
      function (e) {
        vis = e[0].isIntersecting;
        if (vis) play();
        else stop();
      },
      { threshold: 0.08 }
    ).observe(cv);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else play();
    });
    sec.addEventListener(
      "pointerdown",
      function (e) {
        var r = cv.getBoundingClientRect();
        ripple(e.clientX - r.left, e.clientY - r.top);
      },
      { passive: true }
    );
    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(rt);
        rt = window.setTimeout(fit, 200);
      },
      { passive: true }
    );
  })();

  /* ============================================================
     v22 — peça-assinatura: "O sistema trabalhando".
     Conversa de WhatsApp que se constrói conforme o scroll num
     palco sticky de 300vh. Um único rAF com lerp; bidirecional
     (classes ligam E desligam); dorme assentado, fora da viewport
     e com a aba oculta. Reduced-motion: cena final estática (CSS).
     ============================================================ */
  (function () {
    var section = document.querySelector(".showcase-section");
    var track = document.getElementById("showcase-track");
    var stage = document.getElementById("showcase-stage");
    var bar = document.getElementById("showcase-bar");
    if (!section || !track || !stage) return;
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    section.classList.add("is-live");

    var itens = Array.prototype.slice.call(stage.querySelectorAll(".sp-item"));
    var titulos = Array.prototype.slice.call(stage.querySelectorAll(".showcase-title"));
    var typingIn = stage.querySelector(".sp-typing-in");
    var typingOut = stage.querySelector(".sp-typing-out");

    /* Marcos: fração do trilho em que cada balão entra. */
    var MARCOS = { 1: 0.03, 2: 0.08, 3: 0.15, 4: 0.24, 5: 0.34, 6: 0.5, 7: 0.62 };
    var S4 = 0.78;

    var lerp = -1;
    var raf = 0;
    var vis = false;
    var contou = false;

    function medir() {
      var r = track.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      if (total <= 0) return 1;
      var p = -r.top / total;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    }

    function estagio(p) {
      if (p >= S4) return 4;
      if (p >= MARCOS[6]) return 3;
      if (p >= MARCOS[4]) return 2;
      return 1;
    }

    /* CountUp das mini-métricas (pt-BR, uma vez, ao chegar no estágio 4). */
    function contar(el) {
      var alvoN = parseInt(el.dataset.alvo, 10) || 0;
      var t0 = performance.now();
      var DUR = 1000;
      var passo = function (ts) {
        var p = Math.min((ts - t0) / DUR, 1);
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = String(Math.round(alvoN * e)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        if (p < 1) window.requestAnimationFrame(passo);
      };
      window.requestAnimationFrame(passo);
    }

    function aplicar(p) {
      for (var i = 0; i < itens.length; i++) {
        var m = +itens[i].dataset.m;
        itens[i].classList.toggle("is-on", p >= MARCOS[m]);
      }
      if (typingIn) typingIn.classList.toggle("is-done", p >= MARCOS[3]);
      if (typingOut) typingOut.classList.toggle("is-done", p >= MARCOS[5]);

      var st = estagio(p);
      for (var t = 0; t < titulos.length; t++) {
        var ligado = +titulos[t].dataset.stage === st;
        titulos[t].classList.toggle("is-on", ligado);
        /* v26 (a11y): o h2 expõe só o título do estágio atual ao leitor
           de tela, em vez dos quatro emendados. */
        if (ligado) titulos[t].removeAttribute("aria-hidden");
        else titulos[t].setAttribute("aria-hidden", "true");
      }

      var s4 = p >= S4;
      section.classList.toggle("is-s4", s4);
      /* No celular a folha de métricas ocupa a base da tela — o botão
         flutuante sai de cena enquanto o CTA do palco está em foco.
         v26: só enquanto o trilho ainda ocupa metade da tela (antes a
         classe sobrevivia até o loop de marcas e o início de projetos). */
      var trilhoNaTela = track.getBoundingClientRect().bottom > window.innerHeight * 0.5;
      document.documentElement.classList.toggle("nx-sys-s4", s4 && vis && trilhoNaTela);
      if (s4 && !contou) {
        contou = true;
        Array.prototype.slice.call(stage.querySelectorAll(".sp-count")).forEach(contar);
      }
      if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }

    function quadro() {
      var alvo = medir();
      if (lerp < 0) lerp = alvo;
      lerp += (alvo - lerp) * 0.14;
      var assentado = Math.abs(alvo - lerp) < 0.001;
      if (assentado) lerp = alvo;
      aplicar(lerp);
      if (!vis || document.hidden || assentado) {
        raf = 0;
        return;
      }
      raf = window.requestAnimationFrame(quadro);
    }

    function acordar() {
      if (!raf && vis && !document.hidden) raf = window.requestAnimationFrame(quadro);
    }

    new IntersectionObserver(
      function (e) {
        vis = e[0].isIntersecting;
        if (!vis) document.documentElement.classList.remove("nx-sys-s4");
        if (vis) acordar();
      },
      { rootMargin: "12%" }
    ).observe(track);

    window.addEventListener("scroll", acordar, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(section.__rt);
        section.__rt = window.setTimeout(acordar, 150);
      },
      { passive: true }
    );
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) acordar();
    });

    /* Estado correto já no primeiro pinte (carregou no meio da página). */
    aplicar(medir());
    lerp = medir();
  })();

  /* ============================================================
     v25 — nxChart: motor de gráficos dourados.
     SVG inline gerado por JS a partir de dados. Traço em gradiente
     bronze→dourado, área que esmaece, brilho leve (só desktop),
     grade hairline mono, crosshair + tooltip (mouse; toque no celular),
     desenho ao entrar (IO, uma vez), tween por relógio real quando os
     dados mudam e um único rAF central para tudo. Reduced-motion:
     estado final direto. Tipos: line/area, bars (vertical/horizontal
     empilhada), donut com CountUp central, heatmap, spark e monitor.
     ============================================================ */
  var nxChart = (function () {
    var NS = "http://www.w3.org/2000/svg";
    var coarse = window.matchMedia("(pointer: coarse)").matches;
    var GLOW = !reducedMotion && finePointer && window.matchMedia("(min-width: 840px)").matches;
    var seq = 0;

    var fmtInt = function (n) {
      return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    var fmtBRL = function (n) {
      return "R$ " + fmtInt(n);
    };

    function mk(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      if (attrs) {
        for (var k in attrs) {
          if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
        }
      }
      if (parent) parent.appendChild(n);
      return n;
    }
    function div(cls, parent, text) {
      var n = document.createElement("div");
      n.className = cls;
      if (text !== undefined) n.textContent = text;
      if (parent) parent.appendChild(n);
      return n;
    }
    function esc(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /* ---------- defs globais: gradientes e brilho, uma vez ---------- */
    (function () {
      var defsSvg = mk("svg", { class: "nxc-defs", "aria-hidden": "true", focusable: "false", width: "0", height: "0" });
      var defs = mk("defs", null, defsSvg);
      var g1 = mk("linearGradient", { id: "nxc-stroke", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
      mk("stop", { offset: "0", "stop-color": "#b0761f" }, g1);
      mk("stop", { offset: "0.6", "stop-color": "#d9a544" }, g1);
      mk("stop", { offset: "1", "stop-color": "#f5e9d6" }, g1);
      var g2 = mk("linearGradient", { id: "nxc-fill", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
      mk("stop", { offset: "0", "stop-color": "#d9a544", "stop-opacity": "0.42" }, g2);
      mk("stop", { offset: "0.55", "stop-color": "#b0761f", "stop-opacity": "0.12" }, g2);
      mk("stop", { offset: "1", "stop-color": "#b0761f", "stop-opacity": "0" }, g2);
      var g3 = mk("linearGradient", { id: "nxc-bar", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
      mk("stop", { offset: "0", "stop-color": "#e6c06a" }, g3);
      mk("stop", { offset: "1", "stop-color": "#b0761f" }, g3);
      var g4 = mk("linearGradient", { id: "nxc-bar-h", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
      mk("stop", { offset: "0", "stop-color": "#b0761f" }, g4);
      mk("stop", { offset: "1", "stop-color": "#e6c06a" }, g4);
      var f = mk("filter", { id: "nxc-glow", x: "-10%", y: "-40%", width: "120%", height: "180%" }, defs);
      mk("feGaussianBlur", { stdDeviation: "2.4", result: "b" }, f);
      var m = mk("feMerge", null, f);
      mk("feMergeNode", { in: "b" }, m);
      mk("feMergeNode", { in: "SourceGraphic" }, m);
      var montar = function () {
        if (document.body && !defsSvg.parentNode) document.body.appendChild(defsSvg);
      };
      if (document.body) montar();
      else document.addEventListener("DOMContentLoaded", montar);
    })();

    /* ---------- relógio central: um rAF para tweens e linhas vivas ---------- */
    var tarefas = [];
    var raf = 0;
    function passo(ts) {
      for (var i = tarefas.length - 1; i >= 0; i--) {
        var manter = false;
        try {
          manter = tarefas[i](ts);
        } catch (_) {
          manter = false;
        }
        if (!manter) tarefas.splice(i, 1);
      }
      raf = tarefas.length ? window.requestAnimationFrame(passo) : 0;
    }
    function agendar(fn) {
      tarefas.push(fn);
      if (!raf) raf = window.requestAnimationFrame(passo);
    }
    /* gráficos que andam sozinhos: religam ao voltar para a aba */
    var vivos = [];
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return;
      if (tarefas.length && !raf) raf = window.requestAnimationFrame(passo);
      window.setTimeout(function () {
        for (var i = 0; i < vivos.length; i++) if (vivos[i].desenhado && vivos[i].ligar) vivos[i].ligar();
      }, 60);
    });

    /* tween de um vetor: from→to em dur ms, easing cúbico, relógio real */
    function tween(from, to, dur, cb, done) {
      var n = to.length;
      var cur = new Array(n);
      var i;
      if (reducedMotion || dur <= 0) {
        for (i = 0; i < n; i++) cur[i] = to[i];
        cb(cur, 1);
        if (done) done();
        return function () {};
      }
      var t0 = performance.now();
      var vivo = true;
      agendar(function (ts) {
        if (!vivo) return false;
        var p = Math.min((ts - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        for (var k = 0; k < n; k++) cur[k] = from[k] + (to[k] - from[k]) * e;
        cb(cur, p);
        if (p >= 1) {
          vivo = false;
          if (done) done();
          return false;
        }
        return true;
      });
      return function () {
        vivo = false;
      };
    }

    /* ---------- observadores compartilhados ---------- */
    var ioDesenho = null;
    var ioPresenca = null;
    if ("IntersectionObserver" in window) {
      ioDesenho = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            ioDesenho.unobserve(e.target);
            var inst = e.target.__nxc;
            if (inst) inst.reveal();
          });
        },
        { threshold: 0.3 }
      );
      ioPresenca = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            var inst = e.target.__nxc;
            if (inst) inst.setVisible(e.isIntersecting);
          });
        },
        { threshold: 0.05 }
      );
    }

    /* ---------- base comum: wrapper, svg em px reais, tooltip ---------- */
    var tipAberto = null;
    document.addEventListener(
      "pointerdown",
      function (e) {
        if (tipAberto && !(e.target instanceof Element && tipAberto.wrap.contains(e.target))) tipAberto.esconder();
      },
      { passive: true }
    );
    window.addEventListener(
      "scroll",
      function () {
        if (tipAberto && coarse) tipAberto.esconder();
      },
      { passive: true }
    );

    function Base(tipo, opts) {
      var self = this;
      self.id = "nxc" + ++seq;
      self.opts = opts;
      self.format = opts.format || fmtInt;
      self.host = typeof opts.host === "string" ? document.querySelector(opts.host) : opts.host;
      self.wrap = div("nxc nxc-k-" + tipo + (opts.className ? " " + opts.className : ""));
      self.wrap.__nxc = self;
      self.svg = opts.label
        ? mk("svg", { role: "img", "aria-label": opts.label, focusable: "false", "aria-describedby": opts.table ? self.id + "-t" : null }, self.wrap)
        : mk("svg", { "aria-hidden": "true", focusable: "false" }, self.wrap);
      self.W = 0;
      self.H = 0;
      self.desenhado = false;
      self.visivel = true;
      self.stop = null;
      self.tip = div("nxc-tip", self.wrap);
      self.tip.setAttribute("aria-hidden", "true");
      self.tip.hidden = true;
      if (opts.table) {
        self.tabela = document.createElement("table");
        self.tabela.className = "sr-only";
        self.tabela.id = self.id + "-t";
        self.wrap.appendChild(self.tabela);
      }
      if (opts.note) {
        var nota = div("nxc-note", null, opts.note);
        self.nota = nota;
      }
      if (self.host) {
        self.host.appendChild(self.wrap);
        if (self.nota) self.host.appendChild(self.nota);
      }
      self.medir();
      var ro = 0;
      var remedir = function () {
        window.clearTimeout(ro);
        ro = window.setTimeout(function () {
          if (self.medir()) self.render();
        }, 120);
      };
      if ("ResizeObserver" in window) {
        new ResizeObserver(remedir).observe(self.wrap);
      } else {
        window.addEventListener("resize", remedir, { passive: true });
      }
      if (ioDesenho && !reducedMotion && !opts.immediate) ioDesenho.observe(self.wrap);
      else self.desenhado = true;
      if (ioPresenca && opts.live) ioPresenca.observe(self.wrap);

      /* interação: mouse segue; toque fixa */
      if (opts.hover !== false) {
        var mover = function (e) {
          var r = self.svg.getBoundingClientRect();
          self.apontar(e.clientX - r.left, e.clientY - r.top);
        };
        if (!coarse) {
          self.wrap.addEventListener("pointermove", mover, { passive: true });
          self.wrap.addEventListener("pointerleave", function () {
            self.esconder();
          });
        } else {
          self.wrap.addEventListener(
            "pointerdown",
            function (e) {
              mover(e);
            },
            { passive: true }
          );
        }
      }
    }
    Base.prototype.medir = function () {
      var w = this.wrap.clientWidth;
      var h = this.svg.clientHeight || this.wrap.clientHeight;
      if (!w || !h) return false;
      if (w === this.W && h === this.H) return false;
      this.W = w;
      this.H = h;
      this.svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      return true;
    };
    Base.prototype.reveal = function () {
      if (this.desenhado) return;
      this.desenhado = true;
      this.wrap.classList.add("is-drawn");
      if (this.aoDesenhar) this.aoDesenhar();
    };
    Base.prototype.setVisible = function (v) {
      this.visivel = v;
      this.wrap.classList.toggle("is-idle", !v);
      if (this.aoVisivel) this.aoVisivel(v);
    };
    Base.prototype.mostrar = function (x, y, html, ancora) {
      var tip = this.tip;
      tip.innerHTML = html;
      tip.hidden = false;
      var tw = tip.offsetWidth;
      var th = tip.offsetHeight;
      var px = x + 12;
      if (px + tw > this.W - 4) px = x - tw - 12;
      if (px < 2) px = 2;
      var py = (ancora !== undefined ? ancora : y) - th - 10;
      if (py < 2) py = this.H - th > 24 ? 2 : y + 14;
      tip.style.transform = "translate3d(" + Math.round(px) + "px, " + Math.round(py) + "px, 0)";
      this.wrap.classList.add("is-hover");
      tipAberto = this;
    };
    Base.prototype.esconder = function () {
      this.tip.hidden = true;
      this.wrap.classList.remove("is-hover");
      if (this.aoEsconder) this.aoEsconder();
      if (tipAberto === this) tipAberto = null;
    };
    Base.prototype.apontar = function () {};
    Base.prototype.render = function () {};
    Base.prototype.tabelaHTML = function (cab, linhas) {
      if (!this.tabela) return;
      var h = "<caption>" + esc(this.opts.label || "") + "</caption><thead><tr>";
      for (var i = 0; i < cab.length; i++) h += "<th scope=\"col\">" + esc(cab[i]) + "</th>";
      h += "</tr></thead><tbody>";
      for (var r = 0; r < linhas.length; r++) {
        h += "<tr>";
        for (var c = 0; c < linhas[r].length; c++) h += (c ? "<td>" : "<th scope=\"row\">") + esc(linhas[r][c]) + (c ? "</td>" : "</th>");
        h += "</tr>";
      }
      this.tabela.innerHTML = h + "</tbody>";
    };

    /* caminho suave por pontos médios (mesma família da sparkline do painel) */
    function suave(xs, ys) {
      var n = xs.length;
      if (!n) return "";
      var d = "M" + xs[0].toFixed(1) + " " + ys[0].toFixed(1);
      for (var j = 1; j < n; j++) {
        var mx = ((xs[j - 1] + xs[j]) / 2).toFixed(1);
        var my = ((ys[j - 1] + ys[j]) / 2).toFixed(1);
        d += " Q" + xs[j - 1].toFixed(1) + " " + ys[j - 1].toFixed(1) + " " + mx + " " + my;
      }
      d += " L" + xs[n - 1].toFixed(1) + " " + ys[n - 1].toFixed(1);
      return d;
    }
    function teto(v, fixo) {
      if (fixo) return fixo;
      var m = 0;
      for (var i = 0; i < v.length; i++) if (v[i] > m) m = v[i];
      if (m <= 0) return 1;
      var p = Math.pow(10, Math.floor(Math.log(m) / Math.LN10));
      var k = Math.ceil(m / p);
      if (k > 5) k = 10;
      else if (k > 2) k = 5;
      else if (k > 1) k = 2;
      return k * p;
    }
    function fmtCurto(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 ? 1 : 0).replace(".", ",") + "M";
      if (n >= 1000) return (n / 1000).toFixed(n % 1000 ? 1 : 0).replace(".", ",") + "k";
      return String(Math.round(n));
    }

    /* ======================= LINHA / ÁREA ======================= */
    function Line(opts) {
      Base.call(this, "line", opts);
      var s = this;
      s.valores = opts.values.slice();
      s.mostrados = s.valores.slice();
      s.labels = opts.labels || [];
      s.padL = opts.axes === false ? 4 : 34;
      s.padR = 10;
      s.padT = 12;
      s.padB = opts.axes === false ? 6 : 20;
      s.clip = mk("clipPath", { id: s.id + "-c" }, mk("defs", null, s.svg));
      s.clipRect = mk("rect", null, s.clip);
      s.grade = mk("g", { class: "nxc-grid" }, s.svg);
      s.gl = [mk("line", null, s.grade), mk("line", null, s.grade), mk("line", null, s.grade)];
      s.gt = [];
      if (opts.axes !== false) {
        for (var i = 0; i < 3; i++) s.gt.push(mk("text", { class: "nxc-ylab", "text-anchor": "end" }, s.grade));
      }
      s.xt = [];
      s.area = mk("path", { class: "nxc-area", fill: "url(#nxc-fill)", "clip-path": "url(#" + s.id + "-c)" }, s.svg);
      if (GLOW) s.halo = mk("path", { class: "nxc-halo", fill: "none", filter: "url(#nxc-glow)", pathLength: "1000" }, s.svg);
      s.linha = mk("path", { class: "nxc-line", fill: "none", stroke: "url(#nxc-stroke)", pathLength: "1000" }, s.svg);
      s.ponta = mk("circle", { class: "nxc-end", r: "3.5" }, s.svg);
      s.cross = mk("g", { class: "nxc-cross" }, s.svg);
      s.crossL = mk("line", null, s.cross);
      s.crossC = mk("circle", { r: "4" }, s.cross);
      s.render();
      s.atualizarTabela();
    }
    Line.prototype = Object.create(Base.prototype);
    Line.prototype.geom = function (vals) {
      var s = this;
      var n = vals.length;
      var max = teto(s.valores, s.opts.ymax);
      var pw = s.W - s.padL - s.padR;
      var ph = s.H - s.padT - s.padB;
      var xs = [], ys = [];
      for (var i = 0; i < n; i++) {
        xs.push(s.padL + (n > 1 ? (i * pw) / (n - 1) : pw / 2));
        ys.push(s.padT + ph - (Math.max(0, vals[i]) / max) * ph);
      }
      return { xs: xs, ys: ys, max: max, pw: pw, ph: ph };
    };
    Line.prototype.render = function () {
      var s = this;
      if (!s.W) return;
      var g = s.geom(s.mostrados);
      s.g = g;
      var d = suave(g.xs, g.ys);
      s.linha.setAttribute("d", d);
      if (s.halo) s.halo.setAttribute("d", d);
      s.area.setAttribute("d", d + " L" + g.xs[g.xs.length - 1].toFixed(1) + " " + (s.padT + g.ph) + " L" + g.xs[0].toFixed(1) + " " + (s.padT + g.ph) + " Z");
      s.clipRect.setAttribute("x", s.padL - 1);
      s.clipRect.setAttribute("y", 0);
      s.clipRect.setAttribute("width", g.pw + 2);
      s.clipRect.setAttribute("height", s.H);
      var ult = g.xs.length - 1;
      s.ponta.setAttribute("cx", g.xs[ult].toFixed(1));
      s.ponta.setAttribute("cy", g.ys[ult].toFixed(1));
      for (var i = 0; i < 3; i++) {
        var y = s.padT + (g.ph * i) / 2;
        s.gl[i].setAttribute("x1", s.padL);
        s.gl[i].setAttribute("x2", s.W - s.padR);
        s.gl[i].setAttribute("y1", y.toFixed(1));
        s.gl[i].setAttribute("y2", y.toFixed(1));
        if (s.gt[i]) {
          s.gt[i].setAttribute("x", s.padL - 7);
          s.gt[i].setAttribute("y", (y + 3).toFixed(1));
          s.gt[i].textContent = fmtCurto(g.max * (1 - i / 2));
        }
      }
      if (s.opts.axes !== false && s.labels.length) {
        var passo = Math.max(1, Math.ceil(s.labels.length / Math.max(2, Math.floor(g.pw / 34))));
        var k = 0;
        for (var j = 0; j < s.labels.length; j++) {
          if (j % passo !== 0) continue;
          var t = s.xt[k] || (s.xt[k] = mk("text", { class: "nxc-xlab", "text-anchor": "middle" }, s.grade));
          t.setAttribute("x", g.xs[j].toFixed(1));
          t.setAttribute("y", s.H - 6);
          t.textContent = s.labels[j];
          t.style.display = "";
          k++;
        }
        for (; k < s.xt.length; k++) s.xt[k].style.display = "none";
      }
    };
    Line.prototype.update = function (vals, imediato) {
      var s = this;
      s.valores = vals.slice();
      if (s.stop) s.stop();
      s.atualizarTabela();
      if (imediato || !s.desenhado) {
        s.mostrados = vals.slice();
        s.render();
        return;
      }
      var de = s.mostrados.slice();
      while (de.length < vals.length) de.push(de.length ? de[de.length - 1] : 0);
      de.length = vals.length;
      s.stop = tween(de, vals, s.opts.dur || 520, function (cur) {
        s.mostrados = cur.slice();
        s.render();
      });
    };
    Line.prototype.atualizarTabela = function () {
      var s = this;
      if (!s.tabela) return;
      var rows = [];
      for (var i = 0; i < s.valores.length; i++) rows.push([s.labels[i] || String(i + 1), s.format(s.valores[i])]);
      s.tabelaHTML([s.opts.xName || "Período", s.opts.yName || "Valor"], rows);
    };
    Line.prototype.apontar = function (x, y) {
      var s = this;
      if (!s.g || !s.g.xs.length) return;
      var n = s.g.xs.length;
      var pw = s.g.pw;
      var i = Math.round(((x - s.padL) / pw) * (n - 1));
      if (i < 0) i = 0;
      if (i > n - 1) i = n - 1;
      var px = s.g.xs[i];
      var py = s.g.ys[i];
      s.crossL.setAttribute("x1", px.toFixed(1));
      s.crossL.setAttribute("x2", px.toFixed(1));
      s.crossL.setAttribute("y1", s.padT);
      s.crossL.setAttribute("y2", s.padT + s.g.ph);
      s.crossC.setAttribute("cx", px.toFixed(1));
      s.crossC.setAttribute("cy", py.toFixed(1));
      var lab = s.labels[i] !== undefined ? s.labels[i] : "";
      var html = (lab ? "<small>" + esc(lab) + "</small>" : "") + "<b>" + esc(s.format(s.valores[i])) + "</b>";
      if (s.opts.tip) html = s.opts.tip(i, s.valores[i], lab);
      s.mostrar(px, y, html, py);
    };

    /* ======================= LINHA VIVA (anda por relógio real) ======================= */
    function Live(opts) {
      opts.live = true;
      opts.axes = opts.axes === undefined ? false : opts.axes;
      opts.hover = opts.hover === undefined ? true : opts.hover;
      Line.call(this, opts);
      var s = this;
      s.N = opts.values.length;
      s.desloc = 0;
      s.ultimoTick = 0;
      s.periodo = opts.period || 900;
      s.gerar = opts.next;
      s.wrap.classList.add("nxc-k-live");
      vivos.push(s);
    }
    Live.prototype = Object.create(Line.prototype);
    Live.prototype.geom = function (vals) {
      var g = Line.prototype.geom.call(this, vals);
      var n = vals.length;
      var dx = n > 1 ? g.pw / (n - 1) : 0;
      var desloc = this.desloc || 0;
      for (var i = 0; i < n; i++) g.xs[i] += desloc * dx;
      return g;
    };
    Live.prototype.aoDesenhar = function () {
      this.ligar();
    };
    Live.prototype.aoVisivel = function (v) {
      if (v) this.ligar();
    };
    Live.prototype.pausado = function () {
      return document.hidden || !this.visivel || (this.opts.gate && this.opts.gate());
    };
    Live.prototype.ligar = function () {
      var s = this;
      if (s.ligado || reducedMotion || !s.desenhado) return;
      s.ligado = true;
      s.ultimoTick = performance.now();
      agendar(function (ts) {
        if (s.pausado()) {
          s.ligado = false;
          s.ultimoTick = 0;
          return false;
        }
        if (!s.ultimoTick) s.ultimoTick = ts;
        var p = (ts - s.ultimoTick) / s.periodo;
        if (p >= 1) {
          /* commit: novo ponto entra pela direita */
          s.valores.shift();
          s.valores.push(s.gerar ? s.gerar(s.valores) : s.valores[s.valores.length - 1]);
          s.mostrados = s.valores.slice();
          s.ultimoTick = ts;
          p = 0;
          if (s.opts.onTick) s.opts.onTick(s.valores[s.valores.length - 1]);
        }
        /* entre commits: os pontos escorregam para a esquerda */
        s.desloc = 1 - p;
        s.render();
        return true;
      });
    };

    /* ======================= BARRAS ======================= */
    function Bars(opts) {
      Base.call(this, "bars", opts);
      var s = this;
      s.series = opts.series.map(function (sr) {
        return { name: sr.name, values: sr.values.slice(), cls: sr.cls || "" };
      });
      s.labels = opts.labels || [];
      s.mostrados = s.series.map(function (sr) {
        return sr.values.slice();
      });
      s.padL = opts.axes === false ? 4 : 34;
      s.padR = 8;
      s.padT = 10;
      s.padB = opts.axes === false ? 4 : 20;
      s.grade = mk("g", { class: "nxc-grid" }, s.svg);
      s.gl = [mk("line", null, s.grade), mk("line", null, s.grade), mk("line", null, s.grade)];
      s.gt = [];
      if (opts.axes !== false) for (var i = 0; i < 3; i++) s.gt.push(mk("text", { class: "nxc-ylab", "text-anchor": "end" }, s.grade));
      s.xt = [];
      s.foco = mk("rect", { class: "nxc-focus" }, s.svg);
      s.gb = mk("g", { class: "nxc-bars-g" }, s.svg);
      s.rects = [];
      for (var k = 0; k < s.series.length; k++) {
        s.rects.push([]);
        for (var j = 0; j < s.series[k].values.length; j++) {
          var r = mk("rect", { class: "nxc-bar nxc-bar-s" + (k + 1) + (s.series[k].cls ? " " + s.series[k].cls : ""), rx: "1" }, s.gb);
          r.style.setProperty("--d", String(j * 45 + k * 30));
          s.rects[k].push(r);
        }
      }
      s.render();
      s.atualizarTabela();
    }
    Bars.prototype = Object.create(Base.prototype);
    Bars.prototype.render = function () {
      var s = this;
      if (!s.W) return;
      var todos = [];
      for (var k = 0; k < s.series.length; k++) todos = todos.concat(s.series[k].values);
      var max = teto(todos, s.opts.ymax);
      var pw = s.W - s.padL - s.padR;
      var ph = s.H - s.padT - s.padB;
      var n = s.series[0].values.length;
      var gw = pw / n;
      var ns = s.series.length;
      var bw = Math.max(2, (gw * 0.62) / ns);
      var gap = Math.min(3, bw * 0.18);
      s.g = { pw: pw, ph: ph, gw: gw, max: max, n: n };
      for (k = 0; k < ns; k++) {
        for (var j = 0; j < n; j++) {
          var v = Math.max(0, s.mostrados[k][j]);
          var h = (v / max) * ph;
          var x = s.padL + j * gw + (gw - (bw * ns + gap * (ns - 1))) / 2 + k * (bw + gap);
          var r = s.rects[k][j];
          r.setAttribute("x", x.toFixed(1));
          r.setAttribute("width", bw.toFixed(1));
          r.setAttribute("y", (s.padT + ph - h).toFixed(1));
          r.setAttribute("height", Math.max(0.5, h).toFixed(1));
        }
      }
      for (var i = 0; i < 3; i++) {
        var y = s.padT + (ph * i) / 2;
        s.gl[i].setAttribute("x1", s.padL);
        s.gl[i].setAttribute("x2", s.W - s.padR);
        s.gl[i].setAttribute("y1", y.toFixed(1));
        s.gl[i].setAttribute("y2", y.toFixed(1));
        if (s.gt[i]) {
          s.gt[i].setAttribute("x", s.padL - 7);
          s.gt[i].setAttribute("y", (y + 3).toFixed(1));
          s.gt[i].textContent = fmtCurto(max * (1 - i / 2));
        }
      }
      if (s.opts.axes !== false && s.labels.length) {
        var passo = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(pw / 30))));
        var c = 0;
        for (j = 0; j < n; j++) {
          if (j % passo !== 0) continue;
          var t = s.xt[c] || (s.xt[c] = mk("text", { class: "nxc-xlab", "text-anchor": "middle" }, s.grade));
          t.setAttribute("x", (s.padL + j * gw + gw / 2).toFixed(1));
          t.setAttribute("y", s.H - 6);
          t.textContent = s.labels[j];
          t.style.display = "";
          c++;
        }
        for (; c < s.xt.length; c++) s.xt[c].style.display = "none";
      }
    };
    Bars.prototype.update = function (series, imediato) {
      var s = this;
      for (var k = 0; k < s.series.length; k++) s.series[k].values = series[k].slice();
      if (s.stop) s.stop();
      s.atualizarTabela();
      var flat = [];
      var de = [];
      for (k = 0; k < s.series.length; k++) {
        flat = flat.concat(s.series[k].values);
        de = de.concat(s.mostrados[k]);
      }
      if (imediato || !s.desenhado) {
        s.mostrados = s.series.map(function (sr) {
          return sr.values.slice();
        });
        s.render();
        return;
      }
      var n = s.series[0].values.length;
      s.stop = tween(de, flat, s.opts.dur || 520, function (cur) {
        for (var q = 0; q < s.series.length; q++) s.mostrados[q] = cur.slice(q * n, (q + 1) * n);
        s.render();
      });
    };
    Bars.prototype.atualizarTabela = function () {
      var s = this;
      if (!s.tabela) return;
      var cab = [s.opts.xName || "Período"].concat(
        s.series.map(function (sr) {
          return sr.name;
        })
      );
      var rows = [];
      for (var j = 0; j < s.series[0].values.length; j++) {
        var row = [s.labels[j] || String(j + 1)];
        for (var k = 0; k < s.series.length; k++) row.push(s.format(s.series[k].values[j]));
        rows.push(row);
      }
      s.tabelaHTML(cab, rows);
    };
    Bars.prototype.apontar = function (x, y) {
      var s = this;
      if (!s.g) return;
      var j = Math.floor((x - s.padL) / s.g.gw);
      if (j < 0) j = 0;
      if (j > s.g.n - 1) j = s.g.n - 1;
      s.foco.setAttribute("x", (s.padL + j * s.g.gw).toFixed(1));
      s.foco.setAttribute("y", s.padT);
      s.foco.setAttribute("width", s.g.gw.toFixed(1));
      s.foco.setAttribute("height", s.g.ph);
      var lab = s.labels[j] !== undefined ? s.labels[j] : "";
      var html = lab ? "<small>" + esc(lab) + "</small>" : "";
      if (s.opts.tip) {
        html = s.opts.tip(j, s.series, lab);
      } else {
        for (var k = 0; k < s.series.length; k++) {
          html += "<span><i class=\"nxc-sw nxc-sw-" + (k + 1) + "\"></i>" + esc(s.series[k].name) + " <b>" + esc(s.format(s.series[k].values[j])) + "</b></span>";
        }
      }
      var top = s.padT + s.g.ph;
      for (k = 0; k < s.series.length; k++) {
        var yy = s.padT + s.g.ph - (Math.max(0, s.series[k].values[j]) / s.g.max) * s.g.ph;
        if (yy < top) top = yy;
      }
      s.mostrar(s.padL + j * s.g.gw + s.g.gw / 2, y, html, top);
    };

    /* ======================= BARRA HORIZONTAL EMPILHADA ======================= */
    function Stack(opts) {
      Base.call(this, "stack", opts);
      var s = this;
      s.itens = opts.items;
      s.total = 0;
      for (var i = 0; i < s.itens.length; i++) s.total += s.itens[i].value;
      s.rects = [];
      for (i = 0; i < s.itens.length; i++) {
        var r = mk("rect", { class: "nxc-seg nxc-seg-" + (i + 1) + (s.itens[i].cls ? " " + s.itens[i].cls : "") }, s.svg);
        r.style.setProperty("--d", String(i * 110));
        s.rects.push(r);
      }
      s.foco = mk("rect", { class: "nxc-focus" }, s.svg);
      s.render();
      if (s.tabela) {
        s.tabelaHTML(
          [opts.xName || "Parte", opts.yName || "Itens"],
          s.itens.map(function (it) {
            return [it.label, String(it.value)];
          })
        );
      }
      if (opts.legend !== false) {
        var leg = div("nxc-legend", s.wrap);
        s.itens.forEach(function (it, k) {
          var li = div("nxc-legend-item", leg);
          li.innerHTML = "<i class=\"nxc-sw nxc-sw-" + (k + 1) + "\"></i>" + esc(it.label) + " <b>" + it.value + "</b>";
        });
      }
    }
    Stack.prototype = Object.create(Base.prototype);
    Stack.prototype.render = function () {
      var s = this;
      if (!s.W || !s.total) return;
      var gap = 2;
      var pw = s.W - gap * (s.itens.length - 1);
      var x = 0;
      s.pos = [];
      for (var i = 0; i < s.itens.length; i++) {
        var w = (s.itens[i].value / s.total) * pw;
        var r = s.rects[i];
        r.setAttribute("x", x.toFixed(1));
        r.setAttribute("y", 0);
        r.setAttribute("width", Math.max(0, w).toFixed(1));
        r.setAttribute("height", s.H);
        s.pos.push({ x: x, w: w });
        x += w + gap;
      }
    };
    Stack.prototype.apontar = function (x, y) {
      var s = this;
      if (!s.pos) return;
      for (var i = 0; i < s.pos.length; i++) {
        if (x >= s.pos[i].x && x <= s.pos[i].x + s.pos[i].w) {
          s.foco.setAttribute("x", s.pos[i].x.toFixed(1));
          s.foco.setAttribute("y", 0);
          s.foco.setAttribute("width", s.pos[i].w.toFixed(1));
          s.foco.setAttribute("height", s.H);
          var it = s.itens[i];
          var html = "<small>" + esc(it.label) + "</small><b>" + it.value + " de " + s.total + "</b>" + (it.detail ? "<span>" + esc(it.detail) + "</span>" : "");
          s.mostrar(s.pos[i].x + s.pos[i].w / 2, y, html, 0);
          return;
        }
      }
    };

    /* ======================= ANEL / DONUT ======================= */
    function Donut(opts) {
      Base.call(this, "donut", opts);
      var s = this;
      s.fatias = opts.slices.map(function (f) {
        return { label: f.label, value: f.value };
      });
      s.mostrados = s.fatias.map(function (f) {
        return f.value;
      });
      s.prog = reducedMotion || opts.immediate ? 1 : 0;
      s.arcos = [];
      s.trilho = mk("circle", { class: "nxc-track", fill: "none" }, s.svg);
      for (var i = 0; i < s.fatias.length; i++) {
        s.arcos.push(mk("circle", { class: "nxc-arc nxc-arc-" + (i + 1), fill: "none", pathLength: "100" }, s.svg));
      }
      s.centro = div("nxc-center", s.wrap);
      s.centroN = document.createElement("strong");
      s.centroL = document.createElement("small");
      s.centro.appendChild(s.centroN);
      s.centro.appendChild(s.centroL);
      s.centro.setAttribute("aria-hidden", "true");
      s.centroMostrado = 0;
      if (opts.legend !== false) {
        s.leg = div("nxc-legend", s.wrap);
        s.legItens = s.fatias.map(function (f, k) {
          var li = div("nxc-legend-item", s.leg);
          li.innerHTML = "<i class=\"nxc-sw nxc-sw-" + (k + 1) + "\"></i>" + esc(f.label) + " <b></b>";
          return li.querySelector("b");
        });
      }
      s.render();
      s.atualizarTexto(s.prog === 1);
    }
    Donut.prototype = Object.create(Base.prototype);
    Donut.prototype.render = function () {
      var s = this;
      if (!s.W) return;
      var cx = s.W / 2;
      var cy = s.H / 2;
      var R = Math.min(s.W, s.H) / 2 - 8;
      var sw = Math.max(8, R * 0.3);
      var r = R - sw / 2;
      s.geo = { cx: cx, cy: cy, r: r, sw: sw };
      s.trilho.setAttribute("cx", cx);
      s.trilho.setAttribute("cy", cy);
      s.trilho.setAttribute("r", r);
      s.trilho.setAttribute("stroke-width", sw);
      var total = 0;
      var i;
      for (i = 0; i < s.mostrados.length; i++) total += s.mostrados[i];
      var acc = 0;
      s.fatiaIni = [];
      for (i = 0; i < s.arcos.length; i++) {
        var frac = total ? s.mostrados[i] / total : 0;
        var len = Math.max(0, frac * 100 * s.prog - 1.2);
        var a = s.arcos[i];
        a.setAttribute("cx", cx);
        a.setAttribute("cy", cy);
        a.setAttribute("r", r);
        a.setAttribute("stroke-width", sw);
        a.setAttribute("stroke-dasharray", len.toFixed(2) + " " + (100 - len).toFixed(2));
        a.setAttribute("stroke-dashoffset", (-acc * 100 * s.prog + 25).toFixed(2));
        s.fatiaIni.push({ a0: acc, a1: acc + frac });
        acc += frac;
      }
      s.centro.style.fontSize = Math.max(14, Math.round(R * 0.42)) + "px";
    };
    Donut.prototype.atualizarTexto = function (imediato) {
      var s = this;
      var total = 0;
      var i;
      for (i = 0; i < s.fatias.length; i++) total += s.fatias[i].value;
      var alvo = total ? (s.fatias[0].value / total) * 100 : 0;
      s.centroL.textContent = s.fatias[0].label;
      if (s.legItens) {
        for (i = 0; i < s.fatias.length; i++) s.legItens[i].textContent = (total ? Math.round((s.fatias[i].value / total) * 100) : 0) + "%";
      }
      if (s.tabela) {
        s.tabelaHTML(
          ["Origem", "Participação"],
          s.fatias.map(function (f) {
            return [f.label, (total ? Math.round((f.value / total) * 100) : 0) + "%"];
          })
        );
      }
      if (imediato || reducedMotion) {
        s.centroMostrado = alvo;
        s.centroN.textContent = Math.round(alvo) + "%";
        return;
      }
      if (s.stopC) s.stopC();
      s.stopC = tween([s.centroMostrado], [alvo], 900, function (cur) {
        s.centroMostrado = cur[0];
        s.centroN.textContent = Math.round(cur[0]) + "%";
      });
    };
    Donut.prototype.aoDesenhar = function () {
      var s = this;
      if (s.stop) s.stop();
      s.stop = tween([0], [1], 1100, function (cur) {
        s.prog = cur[0];
        s.render();
      });
      s.atualizarTexto(false);
    };
    Donut.prototype.update = function (vals) {
      var s = this;
      for (var i = 0; i < s.fatias.length; i++) s.fatias[i].value = vals[i];
      if (s.stop) s.stop();
      if (!s.desenhado) {
        s.mostrados = vals.slice();
        s.render();
        s.atualizarTexto(true);
        return;
      }
      s.stop = tween(s.mostrados.slice(), vals, 640, function (cur) {
        s.mostrados = cur.slice();
        s.render();
      });
      s.atualizarTexto(false);
    };
    Donut.prototype.apontar = function (x, y) {
      var s = this;
      if (!s.geo || !s.fatiaIni) return;
      var dx = x - s.geo.cx;
      var dy = y - s.geo.cy;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < s.geo.r - s.geo.sw / 2 - 2 || d > s.geo.r + s.geo.sw / 2 + 2) {
        s.esconder();
        return;
      }
      var ang = (Math.atan2(dy, dx) + Math.PI / 2) / (Math.PI * 2);
      if (ang < 0) ang += 1;
      for (var i = 0; i < s.fatiaIni.length; i++) {
        if (ang >= s.fatiaIni[i].a0 && ang < s.fatiaIni[i].a1) {
          var f = s.fatias[i];
          var total = 0;
          for (var k = 0; k < s.fatias.length; k++) total += s.fatias[k].value;
          for (k = 0; k < s.arcos.length; k++) s.arcos[k].classList.toggle("is-on", k === i);
          s.mostrar(x, y, "<small>" + esc(f.label) + "</small><b>" + (total ? Math.round((f.value / total) * 100) : 0) + "%</b>", y);
          return;
        }
      }
    };
    Donut.prototype.aoEsconder = function () {
      for (var k = 0; k < this.arcos.length; k++) this.arcos[k].classList.remove("is-on");
    };

    /* ======================= HEATMAP ======================= */
    function Heat(opts) {
      Base.call(this, "heat", opts);
      var s = this;
      s.linhas = opts.rows;
      s.rowLabels = opts.rowLabels || [];
      s.colLabels = opts.colLabels || [];
      s.padL = 30;
      s.padT = 4;
      s.padB = 16;
      s.max = 0;
      var r, c;
      for (r = 0; r < s.linhas.length; r++) for (c = 0; c < s.linhas[r].length; c++) if (s.linhas[r][c] > s.max) s.max = s.linhas[r][c];
      s.cells = [];
      s.gc = mk("g", { class: "nxc-cells" }, s.svg);
      for (r = 0; r < s.linhas.length; r++) {
        s.cells.push([]);
        for (c = 0; c < s.linhas[r].length; c++) {
          var rc = mk("rect", { class: "nxc-cell", rx: "1" }, s.gc);
          rc.style.setProperty("--d", String((r + c) * 55));
          rc.setAttribute("fill-opacity", (0.07 + 0.93 * (s.max ? s.linhas[r][c] / s.max : 0)).toFixed(3));
          s.cells[r].push(rc);
        }
      }
      s.rt = s.rowLabels.map(function () {
        return mk("text", { class: "nxc-ylab", "text-anchor": "end" }, s.svg);
      });
      s.ct = s.colLabels.map(function () {
        return mk("text", { class: "nxc-xlab", "text-anchor": "middle" }, s.svg);
      });
      s.foco = mk("rect", { class: "nxc-focus nxc-focus-cell" }, s.svg);
      s.render();
      if (s.tabela) {
        var rows = [];
        for (r = 0; r < s.linhas.length; r++) {
          rows.push([s.rowLabels[r] || String(r + 1)].concat(s.linhas[r].map(String)));
        }
        s.tabelaHTML(["Dia"].concat(s.colLabels), rows);
      }
    }
    Heat.prototype = Object.create(Base.prototype);
    Heat.prototype.render = function () {
      var s = this;
      if (!s.W) return;
      var R = s.linhas.length;
      var C = s.linhas[0].length;
      var pw = s.W - s.padL - 2;
      var ph = s.H - s.padT - s.padB;
      var cw = pw / C;
      var ch = ph / R;
      var gap = Math.min(2, cw * 0.14);
      s.g = { cw: cw, ch: ch, R: R, C: C };
      for (var r = 0; r < R; r++) {
        for (var c = 0; c < C; c++) {
          var rc = s.cells[r][c];
          rc.setAttribute("x", (s.padL + c * cw + gap / 2).toFixed(1));
          rc.setAttribute("y", (s.padT + r * ch + gap / 2).toFixed(1));
          rc.setAttribute("width", Math.max(1, cw - gap).toFixed(1));
          rc.setAttribute("height", Math.max(1, ch - gap).toFixed(1));
        }
        if (s.rt[r]) {
          s.rt[r].setAttribute("x", s.padL - 6);
          s.rt[r].setAttribute("y", (s.padT + r * ch + ch / 2 + 3).toFixed(1));
          s.rt[r].textContent = s.rowLabels[r];
        }
      }
      var passo = Math.max(1, Math.ceil(C / Math.max(2, Math.floor(pw / 26))));
      for (c = 0; c < C; c++) {
        if (!s.ct[c]) continue;
        s.ct[c].style.display = c % passo ? "none" : "";
        s.ct[c].setAttribute("x", (s.padL + c * cw + cw / 2).toFixed(1));
        s.ct[c].setAttribute("y", s.H - 4);
        s.ct[c].textContent = s.colLabels[c];
      }
    };
    Heat.prototype.apontar = function (x, y) {
      var s = this;
      if (!s.g) return;
      var c = Math.floor((x - s.padL) / s.g.cw);
      var r = Math.floor((y - s.padT) / s.g.ch);
      if (c < 0 || r < 0 || c >= s.g.C || r >= s.g.R) {
        s.esconder();
        return;
      }
      s.foco.setAttribute("x", (s.padL + c * s.g.cw).toFixed(1));
      s.foco.setAttribute("y", (s.padT + r * s.g.ch).toFixed(1));
      s.foco.setAttribute("width", s.g.cw.toFixed(1));
      s.foco.setAttribute("height", s.g.ch.toFixed(1));
      var v = s.linhas[r][c];
      var html = "<small>" + esc((s.rowLabels[r] || "") + " · " + (s.colLabels[c] || "")) + "</small><b>" + esc(s.format(v)) + "</b>";
      if (s.opts.tip) html = s.opts.tip(r, c, v);
      s.mostrar(s.padL + c * s.g.cw + s.g.cw / 2, y, html, s.padT + r * s.g.ch);
    };

    /* ======================= MICRO-SPARK ======================= */
    function Spark(opts) {
      opts.axes = false;
      opts.hover = false;
      opts.table = false;
      Line.call(this, opts);
      this.wrap.classList.add("nxc-k-spark");
      this.padL = 2;
      this.padR = 2;
      this.padT = 4;
      this.padB = 4;
      this.render();
    }
    Spark.prototype = Object.create(Line.prototype);

    /* ======================= MONITOR (pulso que varre por relógio real) ======================= */
    function Monitor(opts) {
      opts.hover = false;
      opts.table = false;
      opts.live = true;
      opts.immediate = true;
      Base.call(this, "monitor", opts);
      var s = this;
      s.periodo = opts.period || 3200;
      s.gate = opts.gate;
      var defs = mk("defs", null, s.svg);
      s.clip = mk("clipPath", { id: s.id + "-c" }, defs);
      s.clipRect = mk("rect", { x: "0", y: "0", width: "0", height: "100" }, s.clip);
      s.grad = mk("linearGradient", { id: s.id + "-g", gradientUnits: "userSpaceOnUse", x1: "0", x2: "100", y1: "0", y2: "0" }, defs);
      mk("stop", { offset: "0", "stop-color": "#b0761f", "stop-opacity": "0" }, s.grad);
      mk("stop", { offset: "0.55", "stop-color": "#d9a544", "stop-opacity": "0.7" }, s.grad);
      mk("stop", { offset: "1", "stop-color": "#f5e9d6", "stop-opacity": "1" }, s.grad);
      s.base = mk("path", { class: "nxc-mon-base", fill: "none" }, s.svg);
      s.traco = mk("path", { class: "nxc-mon-line", fill: "none", stroke: "url(#" + s.id + "-g)", "clip-path": "url(#" + s.id + "-c)" }, s.svg);
      if (GLOW) s.traco.setAttribute("filter", "url(#nxc-glow)");
      s.cabeca = mk("circle", { class: "nxc-mon-head", r: "2.4" }, s.svg);
      s.fase = reducedMotion ? 0.72 : 0;
      s.render();
      vivos.push(s);
      s.wrap.classList.add("is-drawn");
      s.ligar();
    }
    Monitor.prototype = Object.create(Base.prototype);
    Monitor.prototype.render = function () {
      var s = this;
      if (!s.W) return;
      /* pulso tipo monitor: linha de base com batidas a cada ~110px */
      var y0 = s.H * 0.62;
      var d = "M0 " + y0.toFixed(1);
      var x = 0;
      var P = 118;
      s.pontos = [];
      while (x < s.W + P) {
        var seg = [
          [x + 26, y0],
          [x + 34, y0 - s.H * 0.12],
          [x + 40, y0 + s.H * 0.08],
          [x + 46, y0 - s.H * 0.5],
          [x + 54, y0 + s.H * 0.26],
          [x + 60, y0],
          [x + 78, y0 - s.H * 0.14],
          [x + 88, y0],
          [x + P, y0]
        ];
        for (var i = 0; i < seg.length; i++) {
          d += " L" + seg[i][0].toFixed(1) + " " + seg[i][1].toFixed(1);
          s.pontos.push(seg[i]);
        }
        x += P;
      }
      s.base.setAttribute("d", d);
      s.traco.setAttribute("d", d);
      s.clipRect.setAttribute("height", s.H);
      s.aplicar(s.fase || 0);
    };
    Monitor.prototype.yEm = function (x) {
      var p = this.pontos;
      if (!p || !p.length) return this.H * 0.62;
      var prev = [0, this.H * 0.62];
      for (var i = 0; i < p.length; i++) {
        if (p[i][0] >= x) {
          var t = (x - prev[0]) / Math.max(0.001, p[i][0] - prev[0]);
          return prev[1] + (p[i][1] - prev[1]) * t;
        }
        prev = p[i];
      }
      return prev[1];
    };
    Monitor.prototype.aplicar = function (fase) {
      var s = this;
      s.fase = fase;
      var cauda = Math.min(s.W * 0.55, 260);
      var head = fase * (s.W + cauda) - 4;
      var ini = head - cauda;
      s.clipRect.setAttribute("x", ini.toFixed(1));
      s.clipRect.setAttribute("width", cauda.toFixed(1));
      s.grad.setAttribute("x1", ini.toFixed(1));
      s.grad.setAttribute("x2", head.toFixed(1));
      var dentro = head >= 0 && head <= s.W;
      s.cabeca.style.opacity = dentro ? "1" : "0";
      if (dentro) {
        s.cabeca.setAttribute("cx", head.toFixed(1));
        s.cabeca.setAttribute("cy", s.yEm(head).toFixed(1));
      }
    };
    Monitor.prototype.pausado = function () {
      return document.hidden || !this.visivel || (this.gate && this.gate());
    };
    Monitor.prototype.ligar = function () {
      var s = this;
      if (s.ligado || reducedMotion) return;
      s.ligado = true;
      var t0 = performance.now() - (s.fase || 0) * s.periodo;
      agendar(function (ts) {
        if (s.pausado()) {
          s.ligado = false;
          return false;
        }
        s.aplicar((Math.max(0, ts - t0) % s.periodo) / s.periodo);
        return true;
      });
    };
    Monitor.prototype.aoDesenhar = function () {
      this.ligar();
    };
    Monitor.prototype.aoVisivel = function (v) {
      if (v) this.ligar();
    };
    Monitor.prototype.reveal = function () {
      if (this.desenhado) return;
      this.desenhado = true;
      this.wrap.classList.add("is-drawn");
      if (reducedMotion) this.aplicar(0.72);
      else this.ligar();
    };

    /* ---------- realce de um SVG já existente (sparkline do painel) ----------
       Dá ao gráfico legado o gradiente, o brilho e o crosshair+tooltip
       do motor, sem redesenhar: quem chama informa como achar os pontos. */
    function enhance(svg, opts) {
      if (!svg) return null;
      var wrap = svg.parentNode;
      var inst = {
        svg: svg,
        wrap: wrap,
        W: 0,
        opts: opts,
        format: opts.format || fmtInt,
        tip: div("nxc-tip", wrap)
      };
      inst.tip.hidden = true;
      inst.tip.setAttribute("aria-hidden", "true");
      wrap.classList.add("nxc", "nxc-enhanced");
      wrap.style.position = "relative";
      var line = svg.querySelector(opts.line);
      if (line) {
        line.setAttribute("stroke", "url(#nxc-stroke)");
        if (GLOW) {
          var halo = line.cloneNode(false);
          halo.removeAttribute("id");
          halo.setAttribute("class", "nxc-halo");
          halo.setAttribute("filter", "url(#nxc-glow)");
          line.parentNode.insertBefore(halo, line);
          inst.halo = halo;
        }
      }
      var cross = mk("g", { class: "nxc-cross" }, svg);
      var crossL = mk("line", null, cross);
      var crossC = mk("circle", { r: "4" }, cross);
      inst.mostrar = Base.prototype.mostrar;
      inst.esconder = Base.prototype.esconder;
      inst.sync = function () {
        if (inst.halo && line) inst.halo.setAttribute("d", line.getAttribute("d"));
      };
      inst.apontar = function (px, py) {
        var r = svg.getBoundingClientRect();
        inst.W = r.width;
        inst.H = r.height;
        var pts = opts.points();
        if (!pts.length) return;
        var vb = svg.viewBox.baseVal;
        var sx = r.width / (vb.width || r.width);
        var sy = r.height / (vb.height || r.height);
        var melhor = 0;
        var dm = Infinity;
        for (var i = 0; i < pts.length; i++) {
          var dd = Math.abs(pts[i].x * sx - px);
          if (dd < dm) {
            dm = dd;
            melhor = i;
          }
        }
        var p = pts[melhor];
        crossL.setAttribute("x1", p.x);
        crossL.setAttribute("x2", p.x);
        crossL.setAttribute("y1", 0);
        crossL.setAttribute("y2", vb.height || r.height);
        crossC.setAttribute("cx", p.x);
        crossC.setAttribute("cy", p.y);
        inst.mostrar(p.x * sx, py, "<small>" + esc(p.label) + "</small><b>" + esc(inst.format(p.value)) + "</b>", p.y * sy);
      };
      var mover = function (e) {
        var r = svg.getBoundingClientRect();
        inst.apontar(e.clientX - r.left, e.clientY - r.top);
      };
      if (!coarse) {
        wrap.addEventListener("pointermove", mover, { passive: true });
        wrap.addEventListener("pointerleave", function () {
          inst.esconder();
        });
      } else {
        wrap.addEventListener("pointerdown", mover, { passive: true });
      }
      return inst;
    }

    return {
      line: function (o) {
        return new Line(o);
      },
      live: function (o) {
        return new Live(o);
      },
      bars: function (o) {
        return new Bars(o);
      },
      stack: function (o) {
        return new Stack(o);
      },
      donut: function (o) {
        return new Donut(o);
      },
      heat: function (o) {
        return new Heat(o);
      },
      spark: function (o) {
        return new Spark(o);
      },
      monitor: function (o) {
        return new Monitor(o);
      },
      enhance: enhance,
      tween: tween,
      schedule: agendar,
      fmtInt: fmtInt,
      fmtBRL: fmtBRL
    };
  })();

  /* ============================================================
     v24 — herói vivo, comparador, a conta, painel-demo, marcas em
     loop e cortinas entre seções. Tudo por relógio real ou por
     rAF que dorme; tudo pausa fora da viewport e com aba oculta.
     ============================================================ */

  /* ---------- Herói vivo: notificações em loop + paralaxe de profundidade ----------
     Quatro mini-cards entram com mola e saem em fade, num ciclo de 9s
     medido em Date.now() (nunca por quadro). Pausam com aba oculta,
     fora do herói (nx-past-hero) e em nx-idle — o relógio congela e
     retoma de onde parou. Reduced-motion: o CSS deixa 2 cards fixos. */
  (function () {
    var live = document.getElementById("hero-live");
    var visual = document.getElementById("hero-visual");
    var heroSec = document.getElementById("inicio");
    if (!live || !visual || !heroSec || reducedMotion) return;

    var notas = Array.prototype.slice.call(live.querySelectorAll(".hero-note"));
    var CICLO = 9000;
    var PASSO = 1500;
    var DURA = 4200;
    var SAIDA = 460;
    var t0 = Date.now() + 2400;
    var pausadoDesde = 0;

    function pausado() {
      return document.hidden || docEl.classList.contains("nx-past-hero") || docEl.classList.contains("nx-idle");
    }

    window.setInterval(function () {
      var agora = Date.now();
      if (pausado()) {
        if (!pausadoDesde) pausadoDesde = agora;
        return;
      }
      if (pausadoDesde) {
        t0 += agora - pausadoDesde;
        pausadoDesde = 0;
      }
      if (agora < t0) return;
      var fase = (agora - t0) % CICLO;
      for (var i = 0; i < notas.length; i++) {
        var local = fase - i * PASSO;
        if (local < 0) local += CICLO;
        var dentro = local < DURA;
        var saindo = !dentro && local < DURA + SAIDA;
        notas[i].classList.toggle("is-in", dentro);
        notas[i].classList.toggle("is-out", saindo);
      }
    }, 100);

    /* Paralaxe de profundidade: três planos (moldura 0.45, cards ~1, cards ~1.7)
       lidos de --px/--py no CSS; lerp num rAF que dorme ao assentar. */
    if (!finePointer) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function laco() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      visual.style.setProperty("--px", cx.toFixed(2) + "px");
      visual.style.setProperty("--py", cy.toFixed(2) + "px");
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.05) raf = window.requestAnimationFrame(laco);
      else raf = 0;
    }
    heroSec.addEventListener(
      "pointermove",
      function (e) {
        var r = heroSec.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 28;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 22;
        if (!raf) raf = window.requestAnimationFrame(laco);
      },
      { passive: true }
    );
    heroSec.addEventListener("pointerleave", function () {
      tx = 0;
      ty = 0;
      if (!raf) raf = window.requestAnimationFrame(laco);
    });
  })();

  /* ---------- A conta: quanto custa não responder ----------
     Só faz conta com o que o visitante informa: contatos × 30 × % × ticket.
     Resultados tuenam do valor exibido para o novo (CountUp curto) e o
     CTA leva os números do visitante no texto do WhatsApp. */
  (function () {
    var form = document.getElementById("calc");
    if (!form) return;
    var inC = document.getElementById("calc-contatos");
    var inP = document.getElementById("calc-perda");
    var inT = document.getElementById("calc-ticket");
    var outC = document.getElementById("calc-contatos-out");
    var outP = document.getElementById("calc-perda-out");
    var outT = document.getElementById("calc-ticket-out");
    var r1 = document.getElementById("calc-r1");
    var r2 = document.getElementById("calc-r2");
    var formula = document.getElementById("calc-formula");
    var cta = document.getElementById("calc-cta");
    if (!inC || !inP || !inT || !r1 || !r2) return;

    var fmt = function (n) {
      return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    var mostrado = { a: 0, b: 0 };
    var raf = 0;
    var visto = false;

    function preencher(input) {
      var p = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty("--p", p.toFixed(1) + "%");
    }

    function animar(a, b) {
      if (reducedMotion) {
        r1.textContent = fmt(a);
        r2.textContent = "R$ " + fmt(b);
        mostrado = { a: a, b: b };
        return;
      }
      var de = { a: mostrado.a, b: mostrado.b };
      var t0 = performance.now();
      if (raf) window.cancelAnimationFrame(raf);
      var passo = function (ts) {
        var p = Math.min((ts - t0) / 560, 1);
        var e = 1 - Math.pow(1 - p, 3);
        mostrado = { a: de.a + (a - de.a) * e, b: de.b + (b - de.b) * e };
        r1.textContent = fmt(mostrado.a);
        r2.textContent = "R$ " + fmt(mostrado.b);
        raf = p < 1 ? window.requestAnimationFrame(passo) : 0;
      };
      raf = window.requestAnimationFrame(passo);
    }

    /* v25 — dois gráficos ligados aos sliders. Os 12 meses partem do mês
       atual e usam os dias corridos de cada um (28/30/31): a única coisa
       que varia é o calendário. Nada além dos três controles entra aqui. */
    var MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    var hoje = new Date();
    var meses = [];
    for (var mi = 0; mi < 12; mi++) {
      var dm = new Date(hoje.getFullYear(), hoje.getMonth() + mi + 1, 0);
      meses.push({ label: MESES[dm.getMonth()], dias: dm.getDate(), ano: dm.getFullYear() });
    }
    var rotulos = meses.map(function (m) {
      return m.label;
    });
    var hostBars = document.getElementById("calc-bars");
    var hostArea = document.getElementById("calc-area");
    var gBarras = null;
    var gArea = null;
    if (hostBars && nxChart) {
      gBarras = nxChart.bars({
        host: hostBars,
        label: "Com os seus números: contatos atendidos e contatos sem resposta por mês, nos próximos 12 meses.",
        labels: rotulos,
        series: [
          { name: "Atendidos", values: meses.map(function () { return 0; }), cls: "nxc-bar-ok" },
          { name: "Sem resposta", values: meses.map(function () { return 0; }) }
        ],
        format: function (v) {
          return fmt(v) + " contatos";
        },
        table: true,
        xName: "Mês",
        tip: function (j, series, lab) {
          return (
            "<small>" + lab + " · " + meses[j].dias + " dias</small>" +
            "<span><i class=\"nxc-sw nxc-sw-1\"></i>Atendidos <b>" + fmt(series[0].values[j]) + "</b></span>" +
            "<span><i class=\"nxc-sw nxc-sw-2\"></i>Sem resposta <b>" + fmt(series[1].values[j]) + "</b></span>"
          );
        }
      });
    }
    if (hostArea && nxChart) {
      gArea = nxChart.line({
        host: hostArea,
        label: "Com os seus números: faturamento em risco acumulado ao longo de 12 meses.",
        labels: rotulos,
        values: meses.map(function () { return 0; }),
        format: function (v) {
          return "R$ " + fmt(v);
        },
        table: true,
        xName: "Mês",
        yName: "Acumulado",
        tip: function (j, v, lab) {
          return "<small>" + lab + " · acumulado</small><b>R$ " + fmt(v) + "</b><span>no mês: R$ " + fmt(mensal[j]) + "</span>";
        }
      });
    }
    var mensal = meses.map(function () { return 0; });

    function graficos(c, p, t) {
      if (!gBarras && !gArea) return;
      var atend = [], perd = [], acum = [], soma = 0;
      for (var j = 0; j < meses.length; j++) {
        var total = c * meses[j].dias;
        var semResp = (total * p) / 100;
        atend.push(total - semResp);
        perd.push(semResp);
        mensal[j] = semResp * t;
        soma += mensal[j];
        acum.push(soma);
      }
      if (gBarras) gBarras.update([atend, perd]);
      if (gArea) gArea.update(acum);
    }

    function calcular() {
      var c = +inC.value;
      var p = +inP.value;
      var t = +inT.value;
      var perdidos = (c * 30 * p) / 100;
      var risco = perdidos * t;
      graficos(c, p, t);
      if (outC) outC.textContent = String(c);
      if (outP) outP.textContent = p + "%";
      if (outT) outT.textContent = "R$ " + fmt(t);
      if (formula) {
        formula.innerHTML =
          "<b>" + c + "</b> contatos × 30 dias × <b>" + p + "%</b> sem resposta × <b>R$ " + fmt(t) + "</b> de ticket — cada contato perdido contado como um ticket inteiro";
      }
      r1.dataset.valor = String(Math.round(perdidos));
      r2.dataset.valor = String(Math.round(risco));
      if (cta) {
        cta.href =
          "https://wa.me/5512982211090?text=" +
          encodeURIComponent(
            "Olá, vim pelo site da Nexus e fiz a conta: " +
              c +
              " contatos por dia, " +
              p +
              "% sem resposta rápida e ticket médio de R$ " +
              fmt(t) +
              ". Dá cerca de " +
              fmt(perdidos) +
              " contatos sem resposta e R$ " +
              fmt(risco) +
              " em risco por mês. Quero fechar esse vazamento."
          );
      }
      preencher(inC);
      preencher(inP);
      preencher(inT);
      if (visto) animar(perdidos, risco);
      else {
        r1.textContent = fmt(perdidos);
        r2.textContent = "R$ " + fmt(risco);
      }
    }

    form.addEventListener("input", calcular);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
    calcular();

    /* Ao aparecer, os dois números sobem do zero uma vez. */
    if (reducedMotion || !("IntersectionObserver" in window)) {
      visto = true;
      return;
    }
    var io = new IntersectionObserver(
      function (en) {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        visto = true;
        mostrado = { a: 0, b: 0 };
        animar(+r1.dataset.valor, +r2.dataset.valor);
      },
      { threshold: 0.4 }
    );
    io.observe(form);
  })();

  /* ---------- Painel-demo vivo (demonstração ilustrativa) ----------
     Relógio real em tudo: hora local no cabeçalho, contadores que
     ticam em intervalos aleatórios de Date.now(), sparkline que ganha
     um ponto novo a cada ~6s e feed de eventos entrando por cima.
     Números fictícios, rotulados como demonstração no próprio painel. */
  (function () {
    var dash = document.getElementById("dash");
    if (!dash) return;
    var k1 = document.getElementById("dash-k1");
    var k1d = document.getElementById("dash-k1d");
    var k2 = document.getElementById("dash-k2");
    var k3 = document.getElementById("dash-k3");
    var clock = document.getElementById("dash-clock");
    var linha = document.getElementById("dash-line");
    var area = document.getElementById("dash-area");
    var dot = document.getElementById("dash-dot");
    var dotPulse = document.getElementById("dash-dot-pulse");
    var feed = document.getElementById("dash-feed");
    var chartLast = document.getElementById("dash-chart-last");

    var N = 24;
    var pts = [];
    var i;
    for (i = 0; i < N; i++) {
      pts.push(Math.max(2, Math.round(7 + 4 * Math.sin(i * 0.55) + 3 * Math.sin(i * 1.7) + (Math.random() - 0.5) * 3)));
    }
    var conversas = 37;
    var hora = 6;
    var agend = 12;

    /* v26: eventos diferentes dos do herói e do showcase — aqui é a
       operação inteira (pós-venda, robôs, anúncios, CRM), não a conversa. */
    var EVENTOS = [
      { t: "Pesquisa de satisfação enviada", s: "serviço concluído às 17h", k: "msg" },
      { t: "Backup diário concluído", s: "banco salvo, 2,4 MB", k: "ok" },
      { t: "Alerta de anúncio: CPC subiu", s: "campanha Google · radar", k: "ia" },
      { t: "Lembrete de retorno disparado", s: "cliente sem visita há 6 meses", k: "cal" },
      { t: "Resumo semanal gerado pela IA", s: "CRM · 14 leads novos", k: "ia" },
      { t: "Mensagem de aniversário enviada", s: "pós-venda automático", k: "msg" },
      { t: "Vigia: tudo no ar", s: "checagem das 8h", k: "ok" },
      { t: "Orçamento parado retomado", s: "sem resposta há 3 dias", k: "cal" }
    ];
    var ICONES = {
      msg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
      ia: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 12-13h-8l0-7z"/></svg>',
      cal: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="1"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
      ok: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
    };

    function hhmm(d) {
      return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }

    /* A viewBox acompanha a proporção real do SVG (preserveAspectRatio
       none): a linha não estica e o ponto final continua redondo. */
    var svg = document.getElementById("dash-spark");
    var grade = svg ? svg.querySelector(".dash-grid") : null;
    var W = 400;
    function medirW() {
      if (!svg || !svg.clientWidth || !svg.clientHeight) return;
      W = Math.max(200, Math.round((120 * svg.clientWidth) / svg.clientHeight));
      svg.setAttribute("viewBox", "0 0 " + W + " 120");
      if (grade) grade.setAttribute("d", "M0 30H" + W + "M0 60H" + W + "M0 90H" + W);
      [dot, dotPulse].forEach(function (el) {
        if (el) el.setAttribute("cx", W);
      });
    }

    function caminho() {
      var H = 120, max = 18;
      var xs = [], ys = [];
      for (var j = 0; j < N; j++) {
        xs.push((j * W) / (N - 1));
        ys.push(H - 8 - (Math.min(pts[j], max) / max) * (H - 20));
      }
      var d = "M" + xs[0].toFixed(1) + " " + ys[0].toFixed(1);
      for (j = 1; j < N; j++) {
        var mx = ((xs[j - 1] + xs[j]) / 2).toFixed(1);
        var my = ((ys[j - 1] + ys[j]) / 2).toFixed(1);
        d += " Q" + xs[j - 1].toFixed(1) + " " + ys[j - 1].toFixed(1) + " " + mx + " " + my;
      }
      d += " L" + xs[N - 1].toFixed(1) + " " + ys[N - 1].toFixed(1);
      return { d: d, ultimoY: ys[N - 1], xs: xs, ys: ys };
    }

    /* v25 — a sparkline original entra no motor: gradiente, brilho e
       crosshair+tooltip (mouse; toque no celular). O desenho continua
       sendo o de sempre. */
    var realce = nxChart
      ? nxChart.enhance(svg, {
          line: "#dash-line",
          format: function (v) {
            return Math.round(v) + (v === 1 ? " conversa" : " conversas");
          },
          points: function () {
            var c = caminho();
            var out = [];
            for (var j = 0; j < N; j++) out.push({ x: c.xs[j], y: c.ys[j], value: pts[j], label: "janela " + (j + 1) + " / " + N });
            return out;
          }
        })
      : null;

    function desenhar(animado) {
      var c = caminho();
      var areaD = c.d + " L" + W + " 120 L0 120 Z";
      if (linha) {
        linha.setAttribute("d", c.d);
        if (animado && !reducedMotion) linha.style.d = 'path("' + c.d + '")';
      }
      if (area) {
        area.setAttribute("d", areaD);
        if (animado && !reducedMotion) area.style.d = 'path("' + areaD + '")';
      }
      var y = c.ultimoY.toFixed(1);
      [dot, dotPulse].forEach(function (el) {
        if (!el) return;
        el.setAttribute("cy", y);
        if (animado && !reducedMotion) el.style.cy = y + "px";
      });
      if (realce) realce.sync();
    }

    function tick(el) {
      if (!el || reducedMotion) return;
      el.classList.remove("is-tick");
      void el.offsetWidth;
      el.classList.add("is-tick");
    }

    function evento(ev, quando, silencioso) {
      if (!feed) return;
      var li = document.createElement("li");
      li.innerHTML =
        "<i>" + (ICONES[ev.k] || ICONES.msg) + "</i><div><b></b><span></span></div><time></time>";
      li.querySelector("b").textContent = ev.t;
      li.querySelector("span").textContent = ev.s;
      li.querySelector("time").textContent = hhmm(quando);
      if (silencioso || reducedMotion) li.style.animation = "none";
      feed.insertBefore(li, feed.firstChild);
      while (feed.children.length > 6) {
        var ultimo = feed.lastElementChild;
        if (ultimo.classList.contains("is-out")) break;
        ultimo.classList.add("is-out");
        (function (n) {
          window.setTimeout(function () {
            if (n.parentNode) n.parentNode.removeChild(n);
          }, 380);
        })(ultimo);
      }
    }

    /* Estado inicial: três eventos com horários dos últimos minutos. */
    var agora = new Date();
    evento(EVENTOS[1], new Date(agora.getTime() - 9 * 60000), true);
    evento(EVENTOS[3], new Date(agora.getTime() - 4 * 60000), true);
    evento(EVENTOS[0], new Date(agora.getTime() - 1 * 60000), true);
    medirW();
    desenhar(false);
    var rtW = 0;
    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(rtW);
        rtW = window.setTimeout(function () {
          medirW();
          desenhar(false);
        }, 200);
      },
      { passive: true }
    );
    if (clock) clock.textContent = hhmm(agora);

    var vis = false;
    var proxEvento = Date.now() + 2500;
    var proxPonto = Date.now() + 6000;
    var idxEv = 3;

    window.setInterval(function () {
      var t = Date.now();
      var d = new Date(t);
      if (clock) clock.textContent = hhmm(d);
      if (document.hidden || !vis || reducedMotion) {
        /* congela a agenda para não despejar tudo ao voltar */
        if (t > proxEvento) proxEvento = t + 1500;
        if (t > proxPonto) proxPonto = t + 3000;
        return;
      }
      if (t >= proxEvento) {
        proxEvento = t + 3200 + Math.random() * 5200;
        var ev = EVENTOS[idxEv % EVENTOS.length];
        idxEv++;
        evento(ev, d, false);
        conversas++;
        hora = Math.min(hora + 1, 14); /* "+N na última hora" não cresce sem fim */
        if (k1) {
          k1.textContent = String(conversas);
          tick(k1);
        }
        if (k1d) k1d.textContent = "+" + hora;
        if (ev.k === "cal" || ev.k === "ok") {
          agend++;
          if (k2) {
            k2.textContent = String(agend);
            tick(k2);
          }
        }
        if (k3 && Math.random() < 0.5) {
          k3.textContent = String(3 + Math.floor(Math.random() * 3));
          tick(k3.parentNode);
        }
      }
      if (t >= proxPonto) {
        proxPonto = t + 6000;
        var ultimo = pts[N - 1];
        var novo = Math.max(2, Math.min(18, ultimo + Math.round((Math.random() - 0.45) * 5)));
        pts.shift();
        pts.push(novo);
        desenhar(true);
        if (chartLast) chartLast.textContent = "ponto novo · " + hhmm(d);
      }
    }, 1000);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (en) {
          vis = en[en.length - 1].isIntersecting;
          dash.classList.toggle("is-idle", !vis);
          if (vis) dash.classList.add("is-drawn");
        },
        { threshold: 0.25 }
      ).observe(dash);
    } else {
      vis = true;
      dash.classList.add("is-drawn");
    }

    /* Tilt 3D leve ao mouse (ponteiro fino, sem movimento reduzido). */
    if (!finePointer || reducedMotion || !window.matchMedia("(hover: hover)").matches) return;
    var rect = null, rafT = 0, ev2 = null;
    dash.addEventListener("pointerenter", function () {
      rect = dash.getBoundingClientRect();
    });
    dash.addEventListener(
      "pointermove",
      function (e) {
        ev2 = e;
        if (rafT) return;
        rafT = window.requestAnimationFrame(function () {
          rafT = 0;
          if (!rect) rect = dash.getBoundingClientRect();
          var px = (ev2.clientX - rect.left) / rect.width - 0.5;
          var py = (ev2.clientY - rect.top) / rect.height - 0.5;
          dash.style.setProperty("--ry", (px * 4).toFixed(2) + "deg");
          dash.style.setProperty("--rx", (-py * 4).toFixed(2) + "deg");
        });
      },
      { passive: true }
    );
    dash.addEventListener("pointerleave", function () {
      rect = null;
      dash.style.setProperty("--rx", "0deg");
      dash.style.setProperty("--ry", "0deg");
    });
  })();

  /* ============================================================
     v25 — aplicações do nxChart pelo site.
     Regra de honestidade: ou o gráfico é dirigido pelos números do
     visitante (calculadora) ou vem rotulado como demonstração/cena
     ilustrativa (painel, showcase, herói). Nada aqui é resultado de
     cliente.
     ============================================================ */

  /* ---------- Painel-demo: dashboard completo (demonstração ilustrativa) ---------- */
  (function () {
    var dash = document.getElementById("dash");
    var hostBars = document.getElementById("dash-bars");
    var hostDonut = document.getElementById("dash-donut");
    var hostHeat = document.getElementById("dash-heat");
    var hostLive = document.getElementById("dash-live");
    if (!dash || !hostBars || !hostDonut || !hostHeat || !hostLive) return;

    var DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    var baseSemana = [14, 22, 19, 26, 24, 31, 9];
    var barras = nxChart.bars({
      host: hostBars,
      label: "Demonstração ilustrativa: agendamentos por dia da semana. Valores fictícios que mudam sozinhos; a tabela traz os números atuais.",
      labels: DIAS,
      series: [{ name: "Agendamentos", values: baseSemana.slice() }],
      format: function (v) {
        return Math.round(v) + " agend.";
      },
      table: true,
      xName: "Dia"
    });

    var origens = [
      { label: "WhatsApp", value: 62 },
      { label: "Instagram", value: 26 },
      { label: "Google", value: 12 }
    ];
    var anel = nxChart.donut({
      host: hostDonut,
      label: "Demonstração ilustrativa: origem dos contatos por canal (WhatsApp, Instagram, Google). Valores fictícios que mudam sozinhos; a tabela traz os números atuais.",
      slices: origens,
      table: true
    });

    /* 7 dias × 12 faixas de 2h: manhã morna, almoço quente, noite mais quente ainda */
    var faixas = [];
    var h;
    for (h = 0; h < 24; h += 2) faixas.push(h + "h");
    var perfil = [1, 0, 1, 3, 6, 8, 7, 6, 8, 9, 7, 3];
    var pesoDia = [0.8, 1, 0.9, 1, 1.1, 0.7, 0.4];
    var linhas = [];
    for (var d = 0; d < 7; d++) {
      var row = [];
      for (var c = 0; c < 12; c++) {
        var seed = Math.sin(d * 12.9898 + c * 78.233) * 43758.5453;
        var ruido = seed - Math.floor(seed);
        row.push(Math.max(0, Math.round(perfil[c] * pesoDia[d] * 1.3 + ruido * 2.2)));
      }
      linhas.push(row);
    }
    nxChart.heat({
      host: hostHeat,
      label: "Demonstração ilustrativa: horários em que o cliente chama, por dia da semana e faixa de duas horas. Pico entre 18h e 22h.",
      rows: linhas,
      rowLabels: DIAS,
      colLabels: faixas,
      table: true,
      tip: function (r, c, v) {
        return "<small>" + DIAS[r] + " · " + faixas[c] + "–" + ((c * 2 + 2) % 24) + "h</small><b>" + v + (v === 1 ? " chamada" : " chamadas") + "</b>";
      }
    });

    var serieViva = [];
    var fase = 0;
    for (var i = 0; i < 40; i++) {
      fase += 0.35;
      serieViva.push(Math.max(1, Math.round(6 + 3 * Math.sin(fase) + 2 * Math.sin(fase * 2.3) + (Math.random() - 0.5) * 2)));
    }
    var vivoUlt = document.getElementById("dash-live-last");
    nxChart.live({
      host: hostLive,
      label: "Demonstração ilustrativa: mensagens por minuto, linha ao vivo que anda com o relógio.",
      values: serieViva,
      period: 900,
      ymax: 14,
      format: function (v) {
        return Math.round(v) + " msg/min";
      },
      next: function (vals) {
        fase += 0.35;
        var n = 6 + 3 * Math.sin(fase) + 2 * Math.sin(fase * 2.3) + (Math.random() - 0.5) * 2.4;
        return Math.max(1, Math.min(13, Math.round(n)));
      },
      onTick: function (v) {
        if (vivoUlt) vivoUlt.textContent = "ilustrativo · " + v + " msg/min";
      },
      gate: function () {
        return docEl.classList.contains("nx-idle");
      }
    });

    /* Vida por relógio real: barras e anel respiram a cada ~9s, só na tela. */
    if (reducedMotion) return;
    var vis = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (en) {
          vis = en[en.length - 1].isIntersecting;
        },
        { threshold: 0.2 }
      ).observe(dash);
    } else vis = true;
    (function respirar() {
      window.setTimeout(function () {
        if (!document.hidden && vis) {
          var novo = baseSemana.map(function (v) {
            return Math.max(4, v + Math.round((Math.random() - 0.5) * 6));
          });
          barras.update([novo]);
          var w = 58 + Math.round(Math.random() * 8);
          var ig = 22 + Math.round(Math.random() * 8);
          anel.update([w, ig, Math.max(6, 100 - w - ig)]);
        }
        respirar();
      }, document.hidden || !vis ? 4000 : 8000 + Math.random() * 4000);
    })();
  })();

  /* ---------- Pacotes: barra empilhada "o que entra", derivada da lista real ----------
     Cada item do card é classificado por palavra-chave em quatro frentes.
     "Tudo do pacote X" herda os itens do card anterior. Nada inventado:
     a proporção é a contagem literal de itens. */
  (function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".package-card"));
    if (!cards.length) return;
    var FRENTES = [
      { key: "presenca", label: "Presença" },
      { key: "atendimento", label: "Atendimento" },
      { key: "conteudo", label: "Conteúdo" },
      { key: "gestao", label: "Gestão" }
    ];
    /* regras em ordem de prioridade: a primeira que casar decide.
       "Suporte por WhatsApp" é suporte (gestão), não atendimento;
       "Anúncios no Google" é mídia/conteúdo, não presença. */
    var REGRAS = [
      [/suporte|relat[óo]rio|reuni[ãa]o|priorit|sistema|painel/i, 3],
      [/an[úu]ncio|v[íi]deo|social|grava|pe[çc]as|conte[úu]do/i, 2],
      [/ia|atendente|agendamento|cobran|or[çc]amento|recupera|whatsapp/i, 1],
      [/site|google|p[áa]gina|logo|identidade/i, 0]
    ];
    var anteriores = [];
    cards.forEach(function (card) {
      var itens = Array.prototype.slice.call(card.querySelectorAll("ul li")).map(function (li) {
        return li.textContent.replace(/\s+/g, " ").trim();
      });
      var lista = [];
      itens.forEach(function (txt) {
        if (/^tudo do pacote/i.test(txt)) {
          lista = lista.concat(anteriores);
        } else lista.push(txt);
      });
      anteriores = lista;
      var contagem = FRENTES.map(function (f) {
        return { label: f.label, value: 0, exemplos: [] };
      });
      lista.forEach(function (txt) {
        var k = 3;
        for (var i = 0; i < REGRAS.length; i++) {
          if (REGRAS[i][0].test(txt)) {
            k = REGRAS[i][1];
            break;
          }
        }
        contagem[k].value++;
        contagem[k].exemplos.push(txt);
      });
      var itensBarra = contagem
        .filter(function (c) {
          return c.value > 0;
        })
        .map(function (c) {
          return { label: c.label, value: c.value, detail: c.exemplos.join(" · ") };
        });
      /* v26: só a barra e o rótulo — a legenda repetia a lista logo
         abaixo e concorria com o preço; o tooltip explica cada segmento. */
      var box = document.createElement("div");
      box.className = "package-mix";
      var head = document.createElement("div");
      head.className = "package-mix-head";
      head.innerHTML = "<span>O QUE ENTRA</span><span>" + lista.length + " ITENS · 4 FRENTES</span>";
      box.appendChild(head);
      var host = document.createElement("div");
      host.className = "package-mix-bar";
      box.appendChild(host);
      var ul = card.querySelector("ul");
      card.insertBefore(box, ul);
      nxChart.stack({
        host: host,
        label:
          "Distribuição dos " +
          lista.length +
          " itens do pacote por frente: " +
          itensBarra
            .map(function (it) {
              return it.label + " " + it.value;
            })
            .join(", ") +
          ".",
        items: itensBarra,
        table: true,
        legend: false,
        xName: "Frente",
        yName: "Itens"
      });
    });
  })();

  /* ---------- Projetos: hairline dourada que corre na base do card ao pousar ---------- */
  (function () {
    document.querySelectorAll(".project-card").forEach(function (card) {
      var l = document.createElement("i");
      l.className = "project-line";
      l.setAttribute("aria-hidden", "true");
      card.appendChild(l);
    });
  })();

  /* ---------- Marcas dos clientes em loop: pausa fora da viewport ---------- */
  (function () {
    var loop = document.getElementById("client-loop");
    if (!loop || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (en) {
      loop.classList.toggle("is-idle", !en[en.length - 1].isIntersecting);
    }).observe(loop);
  })();

  /* ---------- Cortina bronze entre seções ----------
     O span .sec-wipe (serviços, projetos, pacotes) recebe .is-go uma
     vez, quando a seção entra na tela — uma linha bronze com rastro
     atravessa o topo da seção. Seções já no meio da tela ao carregar
     não varrem. Reduced-motion e no-anim: o CSS esconde o span. */
  (function () {
    if (reducedMotion || !("IntersectionObserver" in window)) return;
    var wipes = Array.prototype.slice.call(document.querySelectorAll(".sec-wipe"));
    if (!wipes.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          e.target.classList.add("is-go");
        });
      },
      { threshold: 0.02 }
    );
    var vh = window.innerHeight;
    wipes.forEach(function (w) {
      var sec = w.parentNode;
      var r = sec.getBoundingClientRect();
      if (r.top < vh * 0.6 && r.bottom > 0) return; /* já estava na tela */
      io.observe(w);
    });
  })();
  /* ============================================================
     v26 — registro de cliques nos CTAs, mapa do ecossistema IndyCar
     e diagnóstico em 60 segundos. Regras mantidas: relógio real ou
     rAF central que dorme; pausa fora da viewport e com aba oculta;
     reduced-motion = tudo desenhado e parado; nada some sem JS.
     ============================================================ */

  /* ---------- Cliques nos CTAs (WhatsApp e telefone): um listener só ----------
     Registra o texto do CTA e a seção de origem. Sem serviço configurado
     nada sai da página: fica em window.dataLayer (GA4/GTM leem daí) e no
     gtag, se existir. Para um endpoint próprio (Netlify Function, Plausible):
     window.NX_ANALYTICS = { endpoint: "https://..." } antes deste script. */
  (function () {
    document.addEventListener(
      "click",
      function (e) {
        var a = e.target instanceof Element ? e.target.closest('a[href*="wa.me"], a[href^="tel:"]') : null;
        if (!a) return;
        var sec = a.closest("section, footer, header, .client-loop, .brand-moment, .ia-overlay");
        var dado = {
          event: "nx_cta",
          canal: /^tel:/.test(a.getAttribute("href") || "") ? "tel" : "whatsapp",
          texto: (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
          secao: sec ? sec.id || (sec.className || "").split(" ")[0] : "",
          largura: window.innerWidth,
          t: Date.now()
        };
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(dado);
        if (typeof window.gtag === "function") {
          try {
            window.gtag("event", "nx_cta", dado);
          } catch (_) {}
        }
        var cfg = window.NX_ANALYTICS;
        if (cfg && cfg.endpoint && navigator.sendBeacon) {
          try {
            navigator.sendBeacon(cfg.endpoint, JSON.stringify(dado));
          } catch (_) {}
        }
      },
      { passive: true }
    );
  })();

  /* ---------- Mapa do ecossistema IndyCar ----------
     Oito módulos posicionados em % (data-x/data-y) sobre um palco de
     proporção fixa; as ligações são <path> em hairline bronze que se
     desenham ao entrar (stroke-dashoffset) e recebem pulsos de dados
     viajando por relógio real (getPointAtLength no rAF central do
     nxChart). Hover/foco/toque abre o cartão do módulo. No celular o
     mapa vira uma coluna: os nós empilham numa linha central e o cartão
     abre logo abaixo. Reduced-motion: tudo desenhado e parado. */
  (function () {
    var map = document.getElementById("eco-map");
    var svg = document.getElementById("eco-lines");
    if (!map || !svg) return;

    var NS = "http://www.w3.org/2000/svg";
    var VW = 1000;
    var VH = 620;
    var nodes = Array.prototype.slice.call(map.querySelectorAll(".eco-node"));
    var porChave = {};
    var descs = {};
    var pos = {};

    nodes.forEach(function (n) {
      var k = n.dataset.eco;
      porChave[k] = n;
      pos[k] = { x: +n.dataset.x, y: +n.dataset.y };
      n.style.setProperty("--x", n.dataset.x + "%");
      n.style.setProperty("--y", n.dataset.y + "%");
      var d = document.getElementById(n.getAttribute("aria-controls"));
      if (d) {
        descs[k] = d;
        d.style.setProperty("--x", n.dataset.x + "%");
        d.style.setProperty("--y", n.dataset.y + "%");
      }
    });

    /* Tudo passa pelo banco único; em volta, o caminho do cliente. */
    var LINKS = [
      ["site", "banco"],
      ["agenda", "banco"],
      ["whats", "banco"],
      ["crm", "banco"],
      ["pos", "banco"],
      ["ads", "banco"],
      ["robos", "banco"],
      ["site", "agenda"],
      ["agenda", "whats"],
      ["whats", "crm"],
      ["crm", "pos"],
      ["ads", "site"],
      ["robos", "ads"]
    ];

    var gLinks = document.createElementNS(NS, "g");
    gLinks.setAttribute("class", "eco-links");
    svg.appendChild(gLinks);
    var gPulsos = document.createElementNS(NS, "g");
    gPulsos.setAttribute("class", "eco-pulses");
    svg.appendChild(gPulsos);

    function ponto(k) {
      return { x: (pos[k].x / 100) * VW, y: (pos[k].y / 100) * VH };
    }

    var paths = [];
    LINKS.forEach(function (l, i) {
      if (!pos[l[0]] || !pos[l[1]]) return;
      var a = ponto(l[0]);
      var b = ponto(l[1]);
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var len = Math.hypot(dx, dy) || 1;
      var curva = l[1] === "banco" ? 0.07 : 0.16;
      var cx = (a.x + b.x) / 2 - dy * curva;
      var cy = (a.y + b.y) / 2 + dx * curva;
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", "M" + a.x.toFixed(1) + " " + a.y.toFixed(1) + " Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + b.x.toFixed(1) + " " + b.y.toFixed(1));
      p.setAttribute("pathLength", "1");
      p.setAttribute("class", "eco-link" + (l[1] === "banco" ? " eco-link-core" : ""));
      p.style.setProperty("--d", String(i * 90));
      p.dataset.from = l[0];
      p.dataset.to = l[1];
      gLinks.appendChild(p);
      paths.push(p);
    });

    var pulsos = paths.map(function (p, i) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("class", "eco-pulse");
      c.setAttribute("r", "3.2");
      c.style.opacity = "0";
      gPulsos.appendChild(c);
      return { el: c, path: p, len: 0, dur: 2600 + (i % 5) * 420, off: i * 530, dir: i % 3 === 0 ? -1 : 1 };
    });

    var MOBILE = window.matchMedia("(max-width: 839px)");
    var vis = false;
    var ligado = false;

    function pausado() {
      return document.hidden || !vis || reducedMotion || MOBILE.matches || docEl.classList.contains("nx-idle");
    }

    function ligar() {
      if (ligado || pausado() || !nxChart) return;
      ligado = true;
      var t0 = performance.now();
      nxChart.schedule(function (ts) {
        if (pausado()) {
          ligado = false;
          for (var j = 0; j < pulsos.length; j++) pulsos[j].el.style.opacity = "0";
          return false;
        }
        for (var i = 0; i < pulsos.length; i++) {
          var u = pulsos[i];
          if (!u.len) {
            try {
              u.len = u.path.getTotalLength();
            } catch (_) {
              u.len = 0;
            }
            if (!u.len) continue;
          }
          var f = ((ts - t0 + u.off) % u.dur) / u.dur;
          if (u.dir < 0) f = 1 - f;
          var pt = u.path.getPointAtLength(f * u.len);
          u.el.setAttribute("cx", pt.x.toFixed(1));
          u.el.setAttribute("cy", pt.y.toFixed(1));
          u.el.style.opacity = f < 0.1 ? (f / 0.1).toFixed(2) : f > 0.9 ? ((1 - f) / 0.1).toFixed(2) : "1";
        }
        return true;
      });
    }

    /* desenho ao entrar (uma vez) */
    if (reducedMotion || !("IntersectionObserver" in window)) {
      map.classList.add("is-drawn");
      vis = true;
    } else {
      var ioDraw = new IntersectionObserver(
        function (en) {
          if (!en[0].isIntersecting) return;
          ioDraw.disconnect();
          map.classList.add("is-drawn");
        },
        { threshold: 0.2 }
      );
      ioDraw.observe(map);
      /* garantia: se o observer não disparar com o mapa já na tela, desenha */
      window.setTimeout(function () {
        var r = map.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) map.classList.add("is-drawn");
      }, 9000);
      new IntersectionObserver(
        function (en) {
          vis = en[en.length - 1].isIntersecting;
          map.classList.toggle("is-idle", !vis);
          if (vis) window.setTimeout(ligar, map.classList.contains("is-drawn") ? 0 : 900);
        },
        { threshold: 0.12 }
      ).observe(map);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) window.setTimeout(ligar, 80);
      });
      MOBILE.addEventListener ? MOBILE.addEventListener("change", ligar) : MOBILE.addListener(ligar);
    }

    /* cartões dos módulos */
    var aberto = null;
    var fixo = false;
    var fecharT = 0;

    function abrir(k, porClique) {
      if (aberto && aberto !== k) fechar();
      var n = porChave[k];
      var d = descs[k];
      if (!n || !d) return;
      window.clearTimeout(fecharT);
      aberto = k;
      fixo = !!porClique;
      n.setAttribute("aria-expanded", "true");
      n.classList.add("is-open");
      d.hidden = false;
      map.classList.add("has-open");
      for (var i = 0; i < paths.length; i++) {
        paths[i].classList.toggle("is-lit", paths[i].dataset.from === k || paths[i].dataset.to === k);
      }
    }

    function fechar() {
      window.clearTimeout(fecharT);
      if (!aberto) return;
      var n = porChave[aberto];
      var d = descs[aberto];
      if (n) {
        n.setAttribute("aria-expanded", "false");
        n.classList.remove("is-open");
      }
      if (d) d.hidden = true;
      aberto = null;
      fixo = false;
      map.classList.remove("has-open");
      for (var i = 0; i < paths.length; i++) paths[i].classList.remove("is-lit");
    }

    function agendarFechar() {
      window.clearTimeout(fecharT);
      fecharT = window.setTimeout(function () {
        if (!fixo) fechar();
      }, 260);
    }

    nodes.forEach(function (n) {
      var k = n.dataset.eco;
      n.addEventListener("click", function () {
        if (aberto === k && fixo) fechar();
        else abrir(k, true);
      });
      if (finePointer && !MOBILE.matches) {
        n.addEventListener("pointerenter", function () {
          if (!fixo) abrir(k, false);
          else window.clearTimeout(fecharT);
        });
        n.addEventListener("pointerleave", function () {
          if (!fixo) agendarFechar();
        });
      }
      var d = descs[k];
      if (d && finePointer) {
        d.addEventListener("pointerenter", function () {
          window.clearTimeout(fecharT);
        });
        d.addEventListener("pointerleave", function () {
          if (!fixo) agendarFechar();
        });
      }
    });

    map.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && aberto) {
        var n = porChave[aberto];
        fechar();
        if (n) n.focus();
      }
    });
    /* Fecha ao clicar fora — em "click", não em "pointerdown": no celular o
       cartão aberto ocupa espaço no fluxo, e fechar no pointerdown deslocava
       a página debaixo do dedo antes do touchend (o toque se perdia). */
    document.addEventListener("click", function (e) {
      if (aberto && !(e.target instanceof Element && map.contains(e.target))) fechar();
    });
    window.addEventListener("resize", function () {
      window.clearTimeout(map.__rt);
      map.__rt = window.setTimeout(function () {
        for (var i = 0; i < pulsos.length; i++) pulsos[i].len = 0;
      }, 200);
    });
  })();

  /* ---------- Diagnóstico em 60 segundos ----------
     Quatro etapas em cartas (nome + negócio; cidade; o que trava; canal
     e horário) e um resumo em "ordem de serviço". Sem backend: o botão
     final abre o wa.me com a mensagem montada. Tudo fica salvo em
     localStorage e volta quando a pessoa reabre a página. Enter avança;
     Escape não faz nada destrutivo; erros em role=alert. */
  (function () {
    var root = document.getElementById("diagnostico");
    var form = document.getElementById("diag-form");
    if (!root || !form) return;

    var steps = Array.prototype.slice.call(form.querySelectorAll(".diag-step"));
    var back = document.getElementById("diag-back");
    var next = document.getElementById("diag-next");
    var reset = document.getElementById("diag-reset");
    var count = document.getElementById("diag-count");
    var prog = document.getElementById("diag-progress");
    var erro = document.getElementById("diag-error");
    var send = document.getElementById("diag-send");
    var osId = document.getElementById("diag-os-id");
    var TOTAL = 4;
    var KEY = "nx-diag-v1";
    var WA = "https://wa.me/5512982211090?text=";
    var atual = 1;
    var salvarT = 0;

    root.classList.add("is-js");

    function campo(nome) {
      return form.elements[nome] ? form.elements[nome] : null;
    }
    function valor(nome) {
      var c = campo(nome);
      if (!c) return "";
      if (c.length !== undefined && !c.tagName) {
        /* RadioNodeList */
        return c.value || "";
      }
      return String(c.value || "").trim();
    }
    function marcados(nome) {
      return Array.prototype.slice
        .call(form.querySelectorAll('input[name="' + nome + '"]:checked'))
        .map(function (i) {
          return i.value;
        });
    }
    function ler() {
      return {
        nome: valor("nome"),
        negocio: valor("negocio"),
        cidade: valor("cidade"),
        trava: marcados("trava"),
        canal: valor("canal"),
        horario: valor("horario")
      };
    }

    function salvar() {
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ step: atual, dados: ler(), t: Date.now() }));
      } catch (_) {}
    }
    function limparSalvo() {
      try {
        window.localStorage.removeItem(KEY);
      } catch (_) {}
    }
    function restaurar() {
      var raw = null;
      try {
        raw = window.localStorage.getItem(KEY);
      } catch (_) {}
      if (!raw) return 1;
      var d;
      try {
        d = JSON.parse(raw);
      } catch (_) {
        return 1;
      }
      if (!d || !d.dados) return 1;
      var v = d.dados;
      ["nome", "negocio", "cidade"].forEach(function (k) {
        var c = campo(k);
        if (c && typeof v[k] === "string") c.value = v[k];
      });
      form.querySelectorAll('input[name="trava"]').forEach(function (i) {
        i.checked = Array.isArray(v.trava) && v.trava.indexOf(i.value) >= 0;
      });
      ["canal", "horario"].forEach(function (k) {
        if (!v[k]) return;
        var r = form.querySelector('input[name="' + k + '"][value="' + v[k].replace(/"/g, "") + '"]');
        if (r) r.checked = true;
      });
      var st = parseInt(d.step, 10) || 1;
      return Math.max(1, Math.min(TOTAL + 1, st));
    }

    function rotulo(btn, texto) {
      var l = btn.querySelector(".lbl");
      if (l) {
        Array.prototype.slice.call(l.querySelectorAll("span")).forEach(function (s) {
          s.textContent = texto;
        });
        return;
      }
      var tn = Array.prototype.slice.call(btn.childNodes).find(function (n) {
        return n.nodeType === 3 && n.textContent.trim();
      });
      if (tn) tn.textContent = " " + texto + " ";
    }

    function mostrarErro(msg) {
      if (!erro) return;
      erro.textContent = msg;
      erro.hidden = !msg;
    }

    function validar(n) {
      if (n === 1 && valor("nome").length < 2) {
        mostrarErro("Diga pelo menos como devemos te chamar.");
        var c = campo("nome");
        if (c) c.focus();
        return false;
      }
      if (n === 3 && !marcados("trava").length) {
        mostrarErro("Marque pelo menos uma coisa que trava hoje — pode ser mais de uma.");
        var primeira = form.querySelector('input[name="trava"]');
        if (primeira) primeira.focus();
        return false;
      }
      mostrarErro("");
      return true;
    }

    function hashCurto(txt) {
      var h = 0;
      for (var i = 0; i < txt.length; i++) h = (h * 31 + txt.charCodeAt(i)) >>> 0;
      return h.toString(36).toUpperCase().slice(-4).padStart(4, "0");
    }

    function resumo() {
      var v = ler();
      var set = function (id, t) {
        var el = document.getElementById(id);
        if (el) el.textContent = t || "—";
      };
      set("diag-s-nome", v.nome);
      set("diag-s-negocio", v.negocio);
      set("diag-s-cidade", v.cidade);
      set("diag-s-trava", v.trava.join(", "));
      set("diag-s-canal", v.canal);
      set("diag-s-horario", v.horario);
      var d = new Date();
      var num = "OS-" + String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0") + "-" + hashCurto(v.nome + "|" + v.negocio + "|" + v.cidade);
      if (osId) osId.textContent = "Nº " + num;
      var linhas = [
        "Olá, vim pelo site da Nexus e fiz o diagnóstico em 60 segundos (" + num + ").",
        "Nome: " + (v.nome || "—"),
        "Negócio: " + (v.negocio || "—"),
        "Cidade: " + (v.cidade || "—"),
        "O que mais trava: " + (v.trava.length ? v.trava.join(", ") : "—"),
        "Canal preferido: " + (v.canal || "—"),
        "Melhor horário: " + (v.horario || "—"),
        "Quero marcar meu diagnóstico gratuito de 30 minutos."
      ];
      if (send) send.href = WA + encodeURIComponent(linhas.join("\n"));
    }

    function focar(n) {
      var alvo;
      var step = steps.find(function (s) {
        return +s.dataset.step === n;
      });
      if (!step) return;
      if (n > TOTAL) alvo = send;
      else alvo = step.querySelector('input:not([type="checkbox"]):not([type="radio"]), input:checked, input');
      if (alvo && alvo.focus) {
        try {
          alvo.focus({ preventScroll: true });
        } catch (_) {
          alvo.focus();
        }
      }
    }

    function mostrar(n, foco) {
      atual = n;
      steps.forEach(function (s) {
        var k = +s.dataset.step;
        var p = k === n ? "active" : k < n ? "prev" : k === n + 1 ? "next" : "far";
        s.dataset.pos = p;
        s.classList.toggle("is-active", k === n);
        if (k === n) {
          s.removeAttribute("inert");
          s.removeAttribute("aria-hidden");
        } else {
          s.setAttribute("inert", "");
          s.setAttribute("aria-hidden", "true");
        }
      });
      if (count) count.textContent = n > TOTAL ? "RESUMO PRONTO" : "ETAPA " + n + " / " + TOTAL;
      if (prog) {
        var segs = prog.children;
        for (var i = 0; i < segs.length; i++) segs[i].classList.toggle("is-on", i < n);
        prog.classList.toggle("is-done", n > TOTAL);
      }
      if (back) back.hidden = n === 1;
      if (next) {
        next.hidden = n > TOTAL;
        rotulo(next, n === TOTAL ? "Ver meu resumo" : "Continuar");
      }
      if (reset) reset.hidden = n <= TOTAL;
      root.dataset.step = String(n);
      mostrarErro("");
      if (n > TOTAL) resumo();
      salvar();
      if (foco) window.setTimeout(function () { focar(n); }, reducedMotion ? 0 : 90);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (atual > TOTAL) return;
      if (!validar(atual)) return;
      mostrar(atual + 1, true);
    });
    form.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var t = e.target;
      if (t && (t.type === "checkbox" || t.type === "radio")) {
        e.preventDefault();
        if (atual <= TOTAL && validar(atual)) mostrar(atual + 1, true);
      }
    });
    if (back) {
      back.addEventListener("click", function () {
        if (atual > 1) mostrar(atual - 1, true);
      });
    }
    if (reset) {
      reset.addEventListener("click", function () {
        limparSalvo();
        form.reset();
        mostrar(1, true);
      });
    }
    form.addEventListener("input", function () {
      mostrarErro("");
      window.clearTimeout(salvarT);
      salvarT = window.setTimeout(salvar, 250);
    });
    form.addEventListener("change", function () {
      window.clearTimeout(salvarT);
      salvarT = window.setTimeout(salvar, 120);
    });

    mostrar(restaurar(), false);
  })();

})();

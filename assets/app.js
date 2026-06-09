/* ===========================================================
   Contele Teams API Docs — interações (zero dependências)
   - syntax highlighting (JSON + bash/cURL)
   - botão "Copiar código"
   - scroll-spy na sidebar
   - busca/filtro de endpoints
   - menu mobile + voltar ao topo
   =========================================================== */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  // Escapa &, <, > mas preserva aspas (necessário para o highlighter de JSON).
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Respeita a preferência do SO por menos movimento (vestibular/acessibilidade).
  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // O HTML-fonte já vem com &lt; &gt; &amp; escapados. Para copiar o texto puro,
  // basta ler textContent (o navegador já desescapa).
  function highlightJson(raw) {
    var s = escHtml(raw);
    return s.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      function (match) {
        var cls = 'tok-num';
        if (/^"/.test(match)) {
          cls = /:\s*$/.test(match) ? 'tok-key' : 'tok-str';
        } else if (/^(true|false)$/.test(match)) {
          cls = 'tok-bool';
        } else if (/^null$/.test(match)) {
          cls = 'tok-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  function highlightBash(raw) {
    var s = escHtml(raw);
    // 1) strings entre aspas simples ou duplas
    s = s.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, function (m) {
      return '<span class="tok-str">' + m + '</span>';
    });
    // 2) flags (--url, --header, -X ...) precedidas por espaço/início
    s = s.replace(/(^|\s)(--?[a-zA-Z][\w-]*)/g, function (m, pre, flag) {
      return pre + '<span class="tok-flag">' + flag + '</span>';
    });
    // 3) o comando curl
    s = s.replace(/\bcurl\b/g, '<span class="tok-cmd">curl</span>');
    // 4) verbos HTTP soltos (GET, POST...)
    s = s.replace(/\b(GET|POST|PUT|DELETE|PATCH)\b/g, '<span class="tok-method">$1</span>');
    return s;
  }

  /* ---------- 1. syntax highlighting + copy ---------- */
  var blocks = document.querySelectorAll('.code');
  blocks.forEach(function (block) {
    var lang = block.getAttribute('data-lang');
    var codeEl = block.querySelector('pre code');
    if (!codeEl) return;

    var raw = codeEl.textContent; // texto puro p/ cópia (já desescapado)

    if (lang === 'json') {
      codeEl.innerHTML = highlightJson(raw);
    } else if (lang === 'bash') {
      codeEl.innerHTML = highlightBash(raw);
    }

    var btn = block.querySelector('.copy-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      copyText(raw).then(function () {
        var original = btn.textContent;
        btn.textContent = 'Copiado ✓';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1600);
      });
    });
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }
    return fallbackCopy(text);
  }
  function fallbackCopy(text) {
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  /* ---------- 2. scroll-spy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var linkById = {};
  navLinks.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    linkById[id] = a;
  });
  // alvos: seções e endpoints com id que tenham link correspondente
  var targets = Array.prototype.slice
    .call(document.querySelectorAll('[id]'))
    .filter(function (el) { return linkById[el.id]; });

  var current = null;
  function setActive(id) {
    if (id === current) return;
    if (current && linkById[current]) linkById[current].classList.remove('active');
    if (linkById[id]) {
      linkById[id].classList.add('active');
      revealInNav(linkById[id]); // rola só a sidebar, nunca a página
    }
    current = id;
  }

  // Revela o link ativo rolando APENAS o container .nav-scroll — nunca o window.
  // (scrollIntoView mexia no scroll da página e "desviava" a navegação ao clicar.)
  function revealInNav(link) {
    var c = link.closest('.nav-scroll');
    if (!c) return;
    var cRect = c.getBoundingClientRect();
    var lRect = link.getBoundingClientRect();
    if (lRect.top < cRect.top + 8) {
      c.scrollTop -= (cRect.top + 8 - lRect.top);
    } else if (lRect.bottom > cRect.bottom - 8) {
      c.scrollTop += (lRect.bottom - (cRect.bottom - 8));
    }
  }

  if ('IntersectionObserver' in window) {
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible[e.target.id] = e.intersectionRatio;
        else delete visible[e.target.id];
      });
      // escolhe o alvo visível mais próximo do topo
      var best = null, bestTop = Infinity;
      Object.keys(visible).forEach(function (id) {
        var rect = document.getElementById(id).getBoundingClientRect();
        var top = Math.abs(rect.top);
        if (top < bestTop) { bestTop = top; best = id; }
      });
      if (best) setActive(best);
    }, { rootMargin: '-10% 0px -70% 0px', threshold: [0, 1] });
    targets.forEach(function (t) { observer.observe(t); });
  }

  // clique direto também marca ativo
  navLinks.forEach(function (a) {
    a.addEventListener('click', function () {
      setActive(a.getAttribute('href').slice(1));
      closeSidebar();
    });
  });

  /* ---------- 3. busca / filtro ---------- */
  var search = document.getElementById('navSearch');
  var navScroll = document.querySelector('.nav-scroll');
  if (search && navScroll) {
    // estado "nenhum resultado" (criado uma vez, alternado conforme a busca)
    var navEmpty = document.createElement('p');
    navEmpty.className = 'nav-empty';
    navEmpty.textContent = 'Nenhum endpoint encontrado';
    navEmpty.style.display = 'none';
    navScroll.appendChild(navEmpty);

    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      var anyVisible = false;
      navLinks.forEach(function (a) {
        var match = a.textContent.toLowerCase().indexOf(q) !== -1;
        a.style.display = match ? '' : 'none';
        if (match) anyVisible = true;
      });
      // esconde cabeçalhos de grupo sem links visíveis
      document.querySelectorAll('.nav-group').forEach(function (g) {
        var el = g.nextElementSibling, groupHasVisible = false;
        while (el && el.classList.contains('nav-link')) {
          if (el.style.display !== 'none') groupHasVisible = true;
          el = el.nextElementSibling;
        }
        g.style.display = groupHasVisible ? '' : 'none';
      });
      navEmpty.style.display = anyVisible ? 'none' : 'block';
    });
  }

  /* ---------- 4. menu mobile ---------- */
  var sidebar = document.getElementById('sidebar');
  var toggle = document.getElementById('menuToggle');
  var overlay = document.getElementById('overlay');
  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    var firstLink = sidebar.querySelector('.nav-link');
    if (firstLink) firstLink.focus();
  }
  function closeSidebar() {
    var wasOpen = sidebar.classList.contains('open');
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      if (wasOpen) toggle.focus(); // devolve o foco ao botão que abriu
    }
  }
  if (toggle) toggle.addEventListener('click', openSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
  });

  /* ---------- 5. voltar ao topo ---------- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) toTop.classList.add('show');
      else toTop.classList.remove('show');
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 6. deep-links (âncoras copiáveis nos títulos) ---------- */
  targets.forEach(function (el) {
    var heading = el.querySelector('.ep-title') || el.querySelector('h1, h2');
    if (!heading) return;
    // remove o '#' decorativo antigo, se houver (vira link de verdade)
    var deco = heading.querySelector('.h-anchor');
    if (deco) heading.removeChild(deco);

    var a = document.createElement('a');
    a.className = 'anchor-link';
    a.href = '#' + el.id;
    a.setAttribute('aria-label', 'Copiar link para esta seção');
    a.title = 'Copiar link';
    a.textContent = '#';
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (history.replaceState) history.replaceState(null, '', '#' + el.id);
      else location.hash = el.id;
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      copyText(location.href);
      a.classList.add('copied');
      setTimeout(function () { a.classList.remove('copied'); }, 1300);
    });
    heading.appendChild(a);
  });
})();

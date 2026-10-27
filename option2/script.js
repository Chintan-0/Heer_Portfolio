(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* entrances: once, staggered by --d, never hidden without script */
  var items = document.querySelectorAll('.rv, .rv-mask');
  function show(el) { el.classList.add('in'); var p = el.closest('.proj'); if (p) p.classList.add('in'); }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { items.forEach(show); }, 6000);
  } else {
    items.forEach(show);
    document.querySelectorAll('.proj').forEach(function (p) { p.classList.add('in'); });
  }

  /* the live thing: a request console */
  var routes = {
    about: {
      name: 'Heer Mehta',
      role: 'Software developer',
      based_in: 'Gandhinagar, India',
      studying: 'M.Sc. Information Technology, Dhirubhai Ambani University',
      focus: ['backend APIs', 'full-stack features', 'applied AI prototypes']
    },
    skills: {
      languages: ['Python', 'JavaScript', 'TypeScript', 'C++', 'SQL'],
      backend: ['Django', 'FastAPI', 'REST APIs'],
      frontend: ['React', 'HTML', 'CSS', 'Bootstrap'],
      data_and_ai: ['PostgreSQL', 'Firebase', 'Pandas', 'Scikit-learn', 'LLMs', 'RAG'],
      tools: ['Git', 'Linux', 'Postman', 'VS Code']
    },
    projects: [
      { name: 'Book-E-Pedia', kind: 'full-stack', stack: ['React', 'Django', 'REST APIs', 'SQLite'] },
      { name: 'InsightEdge', kind: 'AI, hackathon', stack: ['Python', 'FastAPI', 'NLP', 'Firebase'] },
      { name: 'Customer Segmentation', kind: 'machine learning', stack: ['Scikit-learn', 'Pandas', 'Streamlit'] },
      { name: 'Forest Fire Detection', kind: 'computer vision', stack: ['TensorFlow', 'Keras', 'Jupyter'] }
    ],
    experience: [
      { where: 'Digital.ai Labs, Tata Motors', what: 'Intern, researched LLM, RAG, vector database and agent workflow approaches; supported model experimentation on Linux in an OCI environment', when: 'May to July 2026' },
      { where: 'Dhirubhai Ambani University', what: 'M.Sc. Information Technology', when: '2025 to present' },
      { where: 'Shreyarth University', what: 'B.Sc. Information Technology, CPI 8.88', when: '2022 to 2025' }
    ],
    availability: {
      freelance: true,
      software_roles: true,
      reply_by: 'email',
      contact: 'mehta.heer910@gmail.com'
    }
  };

  var out = document.getElementById('out');
  var buttons = document.querySelectorAll('.route');
  var timer;

  function render(key) {
    var body = JSON.stringify(routes[key], null, 2);
    var head = '<span class="req">GET /heer/' + key + '  <span class="ok">200 OK</span></span>';
    clearTimeout(timer);
    if (reduce) { out.innerHTML = head + esc(body); return; }
    var lines = body.split('\n'), i = 0;
    out.innerHTML = head;
    (function tick() {
      i = Math.min(lines.length, i + 2);
      out.innerHTML = head + esc(lines.slice(0, i).join('\n'));
      if (i < lines.length) timer = setTimeout(tick, 28);
    })();
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      render(b.getAttribute('data-route'));
    });
  });
})();

/* pinned story: scroll advances the reel through the work */
(function () {
  var pin = document.getElementById('pin');
  var strip = document.getElementById('strip');
  var cap = document.getElementById('cap');
  if (!pin || !strip) return;
  var frames = strip.children;
  var names = [
    ['Book-E-Pedia', 'React, Django, REST APIs'],
    ['InsightEdge', 'Python, FastAPI, NLP, Firebase'],
    ['Customer Segmentation', 'Python, Scikit-learn, Streamlit'],
    ['Forest Fire Detection', 'Python, TensorFlow, Keras']
  ];
  var cur = -1, ticking = false;
  function update() {
    ticking = false;
    var r = pin.getBoundingClientRect();
    var span = pin.offsetHeight - (window.innerHeight - 64);
    var p = Math.min(1, Math.max(0, (64 - r.top) / span));
    var i = p * (frames.length - 1);
    strip.style.setProperty('--i', i.toFixed(3));
    var k = Math.round(i);
    if (k !== cur) {
      cur = k;
      for (var n = 0; n < frames.length; n++) frames[n].classList.toggle('on', n === k);
      cap.innerHTML = '<b>' + names[k][0] + '</b><span>' + names[k][1] + '</span>';
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  update();
})();

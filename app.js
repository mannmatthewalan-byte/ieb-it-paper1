/* IEB IT Paper 1 cram site — app.js
   Plain JS, no build step. Reads globals from data/*.js (see CONTRACT.md):
   P1_PAPERS, P1_TOPICS, P1_DRILLS, P1_PLAN. Any of them may be missing; views show empty states. */

/* ======================================================================
   EXAM DATE/TIME — edit if your time differs (SAST = UTC+02:00)
   ====================================================================== */
const EXAM_AT = "2026-10-22T09:00:00+02:00";

(function () {
  "use strict";

  const EXAM_DATE = new Date(EXAM_AT);
  const BASE_TITLE = "IEB IT Paper 1";
  const SECTION_ORDER = ["SQL", "OOP", "Files & Arrays", "Algorithms", "Dates & Strings", "Exam technique"];
  const JAVA_SECTIONS = ["OOP", "Files & Arrays", "Algorithms", "Dates & Strings"];
  const SESSION_ORDER = { November: 0, Prelim: 1, May: 2, June: 3, Practice: 4 };
  const DRILL_TYPES = ["sql", "java", "mcq", "predict"];
  const TYPE_LABEL = { sql: "SQL", java: "Java", mcq: "MCQ", predict: "Predict" };

  /* ---------------- Data (tolerates missing globals) ---------------- */
  const missing = [];
  function arr(name, file) {
    const v = window[name];
    if (Array.isArray(v)) return v.filter(function (x) { return x && typeof x === "object"; });
    missing.push(file);
    return [];
  }
  const PAPERS = arr("P1_PAPERS", "data/papers.js");
  const TOPICS = arr("P1_TOPICS", "data/topics.js");
  const DRILLS = arr("P1_DRILLS", "data/drills.js");
  let PLAN = window.P1_PLAN;
  if (!PLAN || typeof PLAN !== "object") { missing.push("data/plan.js"); PLAN = {}; }
  const list = function (x) { return Array.isArray(x) ? x : []; };

  const topicById = new Map();
  const topicByKey = new Map(); // normalised id/title -> topic
  TOPICS.forEach(function (t) {
    if (!t.id) return;
    topicById.set(t.id, t);
    topicByKey.set(norm(t.id), t);
    if (t.title) topicByKey.set(norm(t.title), t);
  });
  function resolveTag(tag) { return topicByKey.get(norm(tag)) || null; }

  const sortedPapers = PAPERS.slice().sort(function (a, b) {
    return (b.year || 0) - (a.year || 0) || (SESSION_ORDER[a.session] ?? 9) - (SESSION_ORDER[b.session] ?? 9);
  });
  const paperById = new Map();
  PAPERS.forEach(function (p) { if (p.id) paperById.set(String(p.id), p); });

  // Flat list of all questions with their paper + section.
  const QUESTIONS = [];
  sortedPapers.forEach(function (p) {
    list(p.sections).forEach(function (s) {
      list(s.questions).forEach(function (q) {
        if (q && typeof q === "object") QUESTIONS.push({ paper: p, section: s, q: q });
      });
    });
  });
  function questionsForTopic(t) {
    return QUESTIONS.filter(function (x) {
      return list(x.q.tags).some(function (tag) { const r = resolveTag(tag); return r && r.id === t.id; });
    });
  }
  function drillsForTopic(id) { return DRILLS.filter(function (d) { return d.topic === id; }); }

  /* ---------------- Storage (always try/catch, memory fallback) ---------------- */
  const mem = {};
  function load(key, fallback) {
    try {
      const raw = window.localStorage.getItem("p1:" + key);
      if (raw != null) return JSON.parse(raw);
    } catch (e) { /* storage blocked or bad JSON */ }
    return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : fallback;
  }
  function save(key, val) {
    mem[key] = val;
    try { window.localStorage.setItem("p1:" + key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }
  function loadSet(key) { return new Set(list(load(key, []))); }
  function saveSet(key, set) { save(key, Array.from(set)); }

  /* ---------------- Utils ---------------- */
  function norm(s) { return String(s == null ? "" : s).trim().toLowerCase(); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x"; }
  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || "")) ? String(u) : null; }
  function enc(s) { return encodeURIComponent(String(s)); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function sum(a, f) { return a.reduce(function (t, x) { return t + (Number(f(x)) || 0); }, 0); }
  function sectionRank(s) { const i = SECTION_ORDER.indexOf(s); return i < 0 ? 99 : i; }
  function paperLabel(p) { return (p.year || "") + " " + (p.session || ""); }
  function qHref(p, q) { return "#/papers/" + enc(p.id) + "?q=" + enc(q.num); }
  function qId(num) { return "q-" + slug(num); }
  function langOf(lang, fallback) {
    const l = norm(lang);
    if (l === "sql" || l === "java") return l;
    return fallback || "";
  }

  const ICON = {
    copy: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    check: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>',
    chev: '<svg class="ico chev" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    search: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    print: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>',
    arrow: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    zap: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    shuffle: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
    x: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    grid: '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
  };

  function prioHtml(p) {
    const n = Math.max(1, Math.min(3, Number(p) || 1));
    const label = n === 3 ? "High" : n === 2 ? "Medium" : "Low";
    return '<span class="prio-wrap" data-p="' + n + '" title="Priority ' + n + ' of 3">' +
      '<span class="prio" data-p="' + n + '" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="prio-label">' + label + '<span class="sr-only"> priority</span></span></span>';
  }
  function emptyHtml(title, body) {
    return '<div class="empty"><strong>' + esc(title) + "</strong>" + (body ? esc(body) : "") + "</div>";
  }
  function missingNotice(files) {
    const m = files.filter(function (f) { return missing.indexOf(f) >= 0; });
    if (!m.length) return "";
    return '<div class="notice" role="note"><span aria-hidden="true">⚠</span><span>Content not loaded yet: ' +
      m.map(function (f) { return "<code>" + esc(f) + "</code>"; }).join(", ") +
      ". Sections that depend on it are empty for now.</span></div>";
  }

  /* ---------------- Code blocks (text inserted via textContent, then highlighted) ---------------- */
  const codeRegistry = new Map();
  let codeSeq = 0;
  function codeBlock(code, lang, title) {
    const id = "cb" + (++codeSeq);
    codeRegistry.set(id, { code: String(code == null ? "" : code), lang: langOf(lang), title: title || "" });
    return '<div class="code" data-cb="' + id + '"></div>';
  }
  function hydrateCode(root) {
    root.querySelectorAll("[data-cb]").forEach(function (el) {
      const id = el.getAttribute("data-cb");
      const info = codeRegistry.get(id);
      el.removeAttribute("data-cb");
      if (!info) return;
      codeRegistry.delete(id);

      const head = document.createElement("div");
      head.className = "code-head";
      const left = document.createElement("span");
      left.className = "code-title";
      if (info.lang) {
        const l = document.createElement("span");
        l.className = "code-lang";
        l.textContent = info.lang;
        left.appendChild(l);
      }
      left.appendChild(document.createTextNode(info.title));
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.innerHTML = ICON.copy + "<span>Copy</span>";
      btn.setAttribute("aria-label", "Copy " + (info.title || info.lang || "code"));
      btn.addEventListener("click", function () { copyText(info.code, btn); });
      head.appendChild(left);
      head.appendChild(btn);

      const pre = document.createElement("pre");
      pre.setAttribute("tabindex", "0");
      const codeEl = document.createElement("code");
      codeEl.textContent = info.code;
      if (info.lang) codeEl.className = "language-" + info.lang;
      pre.appendChild(codeEl);
      el.appendChild(head);
      el.appendChild(pre);
      if (info.lang && window.hljs && typeof window.hljs.highlightElement === "function") {
        try { window.hljs.highlightElement(codeEl); } catch (e) { /* plain text is fine */ }
      }
    });
  }
  function copyText(text, btn) {
    function done(ok) {
      toast(ok ? "Copied to clipboard" : "Copy failed: select the code manually");
      if (btn && ok) {
        btn.classList.add("copied");
        btn.querySelector("span").textContent = "Copied";
        setTimeout(function () { btn.classList.remove("copied"); btn.querySelector("span").textContent = "Copy"; }, 1600);
      }
    }
    function fallback() {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        done(ok);
      } catch (e) { done(false); }
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else fallback();
  }
  let toastTimer = null;
  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  /* Reveal sections: <button data-reveal aria-expanded aria-controls> + panel[hidden] */
  let revealSeq = 0;
  function revealBtn(label, panelId, extraClass) {
    return '<button type="button" class="btn btn-sm reveal-btn ' + (extraClass || "") + '" data-reveal aria-expanded="false" aria-controls="' +
      panelId + '"><span>' + esc(label) + "</span>" + ICON.chev + "</button>";
  }
  function setReveal(btn, open) {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (panel) panel.hidden = !open;
  }

  /* ---------------- Progress ---------------- */
  function planKey(item, i) { return i + "|" + (item.time || "") + "|" + (item.task || ""); }
  function progress() {
    const revised = loadSet("revised");
    const plan = loadSet("plan");
    const res = load("drills", {}) || {};
    const tonight = list(PLAN.tonight);
    const topicsDone = TOPICS.filter(function (t) { return revised.has(t.id); }).length;
    const planDone = tonight.filter(function (it, i) { return plan.has(planKey(it, i)); }).length;
    const drillsGot = DRILLS.filter(function (d) { return res[d.id] === "got"; }).length;
    const parts = [];
    if (TOPICS.length) parts.push(topicsDone / TOPICS.length);
    if (DRILLS.length) parts.push(drillsGot / DRILLS.length);
    if (tonight.length) parts.push(planDone / tonight.length);
    const overall = parts.length ? Math.round((parts.reduce(function (a, b) { return a + b; }, 0) / parts.length) * 100) : 0;
    return { topicsDone: topicsDone, planDone: planDone, drillsGot: drillsGot, tonight: tonight.length, overall: overall };
  }
  function progressCardInner() {
    const p = progress();
    const r = 32, c = 2 * Math.PI * r;
    const off = c * (1 - p.overall / 100);
    function item(label, n, d, cls) {
      return '<div class="progress-item"><div class="pi-head"><span>' + esc(label) + "</span><span>" + n + "/" + d +
        '</span></div><div class="meter ' + (cls || "") + '" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="' + d +
        '" aria-valuenow="' + n + '"><span style="width:' + pct(n, d) + '%"></span></div></div>';
    }
    return '<div class="card-head"><h2>Your progress</h2><span class="muted tiny">saved on this device</span></div>' +
      '<div class="overall"><svg class="ring" viewBox="0 0 80 80" role="img" aria-label="Overall ' + p.overall + ' percent">' +
      '<circle class="ring-bg" cx="40" cy="40" r="' + r + '"/>' +
      '<circle class="ring-fg" cx="40" cy="40" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '<text x="40" y="46" text-anchor="middle">' + p.overall + "%</text></svg>" +
      '<div><strong>Overall readiness</strong><p class="muted small" style="margin:2px 0 0">Average of topics revised, drills nailed and tonight\'s plan.</p></div></div>' +
      '<div class="progress-row">' +
      item("Topics revised", p.topicsDone, TOPICS.length) +
      item("Drills nailed", p.drillsGot, DRILLS.length, "good") +
      item("Tonight's plan", p.planDone, p.tonight) +
      "</div>";
  }
  function refreshProgress() {
    const el = document.getElementById("progress-card");
    if (el) el.innerHTML = progressCardInner();
  }

  /* ---------------- Countdown ---------------- */
  function timeLeft() {
    const ms = EXAM_DATE.getTime() - Date.now();
    if (!isFinite(ms) || ms <= 0) return null;
    const s = Math.floor(ms / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, total: s };
  }
  function tick() {
    const t = timeLeft();
    const pill = document.getElementById("tminus");
    if (pill) {
      if (!t) pill.textContent = "";
      else if (t.d >= 2) pill.textContent = "T−" + t.d + "d " + t.h + "h";
      else pill.textContent = "T−" + (t.d * 24 + t.h) + ":" + pad(t.m) + ":" + pad(t.s);
      pill.title = "Time until the exam starts";
    }
    const cd = document.getElementById("countdown");
    if (cd) {
      if (!t) {
        cd.outerHTML = '<p class="hero-done" id="countdown-done">It\'s exam time. Breathe, read the whole paper, bank the SQL marks. You\'ve got this.</p>';
      } else {
        ["d", "h", "m", "s"].forEach(function (k) {
          const el = cd.querySelector('[data-cd="' + k + '"]');
          if (el) el.textContent = k === "d" ? String(t.d) : pad(t[k]);
        });
      }
    }
  }
  function examLabel() {
    try {
      return EXAM_DATE.toLocaleString("en-ZA", {
        weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        hour12: false, timeZone: "Africa/Johannesburg"
      }) + " SAST";
    } catch (e) { return EXAM_AT; }
  }

  /* ======================================================================
     VIEWS
     ====================================================================== */

  /* ---------------- Home ---------------- */
  function viewHome() {
    const t = timeLeft();
    const tonight = list(PLAN.tonight);
    const planSet = loadSet("plan");
    const revised = loadSet("revised");
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    let nowIdx = -1;
    tonight.forEach(function (it, i) {
      const m = /^(\d{1,2}):(\d{2})/.exec(it.time || "");
      if (m && Number(m[1]) * 60 + Number(m[2]) <= nowMins) nowIdx = i;
    });
    let h = missingNotice(["data/papers.js", "data/topics.js", "data/drills.js", "data/plan.js"]);

    // "On now" = the latest plan slot that has started; before the first slot, the first one.
    const curIdx = nowIdx >= 0 ? nowIdx : 0;
    const cur = tonight[curIdx], nxt = tonight[curIdx + 1];
    const showDays = !t || t.d > 0;

    // Hero / countdown
    h += '<section class="hero" aria-labelledby="hero-h"><div class="hero-main">' +
      '<div class="eyebrow"><span class="live-dot" aria-hidden="true"></span>Exam war-room</div>' +
      '<h1 id="hero-h">' + (t ? "IT Paper 1 starts in" : "IT Paper 1 is today") + "</h1>" +
      '<p class="hero-sub">Section A SQL · Section B Java OOP · 3 hours · 150 marks</p>' +
      (t
        ? '<div class="countdown" id="countdown" role="timer" aria-label="Time until the exam" style="--cd-cols:' + (showDays ? 4 : 3) + '">' +
          (showDays ? cdCell("d", String(t.d), "days") : "") + cdCell("h", pad(t.h), "hours") + cdCell("m", pad(t.m), "min") + cdCell("s", pad(t.s), "sec", "sec") + "</div>"
        : '<p class="hero-done">It\'s exam time. Breathe, read the whole paper, bank the SQL marks. You\'ve got this.</p>') +
      '<div class="hero-meta"><span>' + esc(examLabel()) + '</span><span>Edit if your time differs: <code>EXAM_AT</code> in app.js</span></div>' +
      '<div class="btn-row hero-actions"><a class="btn btn-primary" href="#/drills">' + ICON.zap + "Start drilling</a>" +
      '<a class="btn btn-hero" href="#/heatmap">' + ICON.grid + "Exam heatmap</a></div>" +
      '</div><div class="hero-side">';
    if (cur && t) {
      h += '<div class="hs-block"><div class="hs-label"><span>' + (nowIdx >= 0 ? "On now" : "First up") + '</span><a href="#tonight-h" data-jump="tonight-h">Plan ↓</a></div>' +
        '<div class="hs-now"><span class="hs-time">' + esc(cur.time || "") + '</span><span class="hs-task">' + esc(cur.task || "") + "</span></div>" +
        (nxt ? '<div class="hs-next"><span class="hs-time">' + esc(nxt.time || "") + "</span><span>Then: " + esc(nxt.task || "") + "</span></div>" : "") + "</div>";
    }
    h += '<div class="hero-stats">' +
      heroStat(TOPICS.length, "topics") + heroStat(PAPERS.length, "papers") + heroStat(QUESTIONS.length, "Qs") + heroStat(DRILLS.length, "drills") +
      "</div></div></section>";

    h += '<div class="home-grid"><div class="stack">';

    // Tonight
    h += '<section class="card" aria-labelledby="tonight-h"><div class="card-head"><h2 id="tonight-h">Tonight\'s plan</h2>' +
      '<span class="muted tiny mono" id="plan-count">' + tonight.filter(function (it, i) { return planSet.has(planKey(it, i)); }).length + "/" + tonight.length + " done</span></div>";
    if (!tonight.length) h += emptyHtml("No plan loaded yet", " The schedule comes from data/plan.js.");
    else {
      h += '<ol class="timeline">';
      tonight.forEach(function (it, i) {
        const key = planKey(it, i);
        const done = planSet.has(key);
        h += '<li class="' + (done ? "done" : "") + '"><label class="check"><input type="checkbox" data-plan="' + esc(key) + '"' + (done ? " checked" : "") + ">" +
          '<span class="check-body"><span class="tl-time">' + esc(it.time || "") + "</span>" +
          (it.mins ? '<span class="tl-mins">' + esc(it.mins) + " min</span>" : "") +
          (i === nowIdx && t ? '<span class="tl-now">NOW</span>' : "") +
          '<span class="check-text">' + esc(it.task || "") + "</span></span></label></li>";
      });
      h += "</ol>";
    }
    h += "</section></div><div class=\"stack\">";

    // Progress
    h += '<section class="card" id="progress-card" aria-label="Your progress">' + progressCardInner() + "</section>";

    // Mark stats
    const stats = list(PLAN.markStats).filter(function (s) { return s && s.area; });
    h += '<section class="card" aria-labelledby="marks-h"><div class="card-head"><h2 id="marks-h">Where the marks are</h2><span class="muted tiny">avg marks per paper</span></div>';
    if (!stats.length) h += emptyHtml("No mark stats yet", " These come from data/plan.js.");
    else {
      const max = Math.max.apply(null, stats.map(function (s) { return Number(s.avg) || 0; }).concat([1]));
      const total = sum(stats, function (s) { return s.avg; });
      h += '<div class="bars" role="list">';
      stats.forEach(function (s) {
        const v = Number(s.avg) || 0;
        h += '<div class="bar-row" role="listitem"><span class="bar-label" title="' + esc(s.area) + '">' + esc(s.area) + "</span>" +
          '<span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:' + Math.max(2, (v / max) * 100).toFixed(1) + '%"></span></span>' +
          '<span class="bar-val">' + esc(v) + (total ? " <small>" + pct(v, total) + "%</small>" : "") + "</span></div>";
      });
      h += "</div>";
    }
    h += "</section></div></div>";

    // Top priority topics (full width)
    const top = TOPICS.filter(function (x) { return Number(x.priority) === 3; })
      .sort(function (a, b) { return sectionRank(a.section) - sectionRank(b.section); });
    h += '<section class="card section-gap" aria-labelledby="top-h"><div class="card-head"><h2 id="top-h">Top priority topics</h2>' +
      '<a class="card-link" href="#/topics">All topics →</a></div>' +
      '<p class="muted small">Examined almost every year. Make sure every one of these is solid.</p>';
    if (!top.length) h += emptyHtml("Nothing here yet", " Priority-3 topics from data/topics.js appear here.");
    else {
      h += '<ul class="topic-mini two">';
      top.forEach(function (x) {
        h += '<li><a href="#/topics/' + enc(x.id) + '"><span class="section-pill">' + esc(x.section) + '</span><span class="tm-title">' + esc(x.title) + "</span>" +
          (revised.has(x.id) ? '<span class="tm-done">✓ revised</span>' : '<span class="muted" aria-hidden="true">→</span>') + "</a></li>";
      });
      h += "</ul>";
    }
    h += "</section>";
    return { html: h };
  }
  function cdCell(k, v, lbl, cls) {
    return '<div class="cd-cell ' + (cls || "") + '"><span class="cd-num" data-cd="' + k + '">' + esc(v) + '</span><span class="cd-lbl">' + lbl + "</span></div>";
  }
  function heroStat(n, lbl) {
    return '<div class="hero-stat"><strong>' + n + "</strong><span>" + lbl + "</span></div>";
  }

  /* ---------------- Topics ---------------- */
  const topicFilter = { section: "all", prio: "all", status: "all", q: "" };
  function viewTopics() {
    const sections = Array.from(new Set(TOPICS.map(function (t) { return t.section; }).filter(Boolean)))
      .sort(function (a, b) { return sectionRank(a) - sectionRank(b); });
    let h = '<div class="page-head"><div class="eyebrow">Revise</div><h1>Topics</h1>' +
      "<p>Everything Paper 1 tests, ranked by how often it comes up. Open a topic for templates, pitfalls and every past-paper question on it.</p></div>";
    h += missingNotice(["data/topics.js"]);
    h += '<div class="toolbar">' +
      '<div class="field-wrap">' + ICON.search + '<label class="sr-only" for="topic-q">Filter topics</label>' +
      '<input class="field" id="topic-q" type="search" placeholder="Filter topics…" autocomplete="off" value="' + esc(topicFilter.q) + '"></div>' +
      '<div><div class="filter-label" id="fl-sec">Section</div><div class="chips" role="group" aria-labelledby="fl-sec">' +
      chip("section", "all", "All", TOPICS.length) +
      sections.map(function (s) { return chip("section", s, s, TOPICS.filter(function (t) { return t.section === s; }).length); }).join("") +
      "</div></div>" +
      '<div class="filter-row"><div><div class="filter-label" id="fl-pri">Priority</div><div class="chips" role="group" aria-labelledby="fl-pri">' +
      chip("prio", "all", "Any") + chip("prio", "3", "High") + chip("prio", "2", "Medium") + chip("prio", "1", "Low") + "</div></div>" +
      '<div><div class="filter-label" id="fl-st">Status</div><div class="chips" role="group" aria-labelledby="fl-st">' +
      chip("status", "all", "All") + chip("status", "todo", "Not revised") + chip("status", "done", "Revised") + "</div></div></div>" +
      "</div>";
    h += '<div id="topic-results" aria-live="polite"></div>';
    return {
      html: h,
      after: function () {
        renderTopicResults();
        const q = document.getElementById("topic-q");
        q.addEventListener("input", function () { topicFilter.q = q.value; renderTopicResults(); });
      }
    };
  }
  function chip(group, val, label, count) {
    const on = String(topicFilter[group]) === String(val);
    return '<button type="button" class="chip" data-tf="' + group + '" data-val="' + esc(val) + '" aria-pressed="' + on + '">' + esc(label) +
      (count != null ? ' <span class="count">' + count + "</span>" : "") + "</button>";
  }
  function renderTopicResults() {
    const el = document.getElementById("topic-results");
    if (!el) return;
    const revised = loadSet("revised");
    const terms = norm(topicFilter.q).split(/\s+/).filter(Boolean);
    const rows = TOPICS.filter(function (t) {
      if (topicFilter.section !== "all" && t.section !== topicFilter.section) return false;
      if (topicFilter.prio !== "all" && String(t.priority) !== topicFilter.prio) return false;
      if (topicFilter.status === "done" && !revised.has(t.id)) return false;
      if (topicFilter.status === "todo" && revised.has(t.id)) return false;
      if (terms.length) {
        const hay = norm([t.title, t.summary, t.section, t.id].concat(list(t.points)).join(" "));
        if (!terms.every(function (w) { return hay.indexOf(w) >= 0; })) return false;
      }
      return true;
    }).sort(function (a, b) {
      return (Number(b.priority) || 0) - (Number(a.priority) || 0) || sectionRank(a.section) - sectionRank(b.section) || String(a.title).localeCompare(String(b.title));
    });
    if (!rows.length) {
      el.innerHTML = TOPICS.length ? emptyHtml("No topics match", " Try clearing a filter.") : emptyHtml("No topics loaded yet", " They come from data/topics.js.");
      return;
    }
    let h = '<p class="muted small">' + plural(rows.length, "topic") + "</p><div class=\"topic-grid\">";
    rows.forEach(function (t) {
      const done = revised.has(t.id);
      const nq = questionsForTopic(t).length;
      h += '<a class="topic-card' + (done ? " revised" : "") + '" data-p="' + esc(t.priority) + '" href="#/topics/' + enc(t.id) + '">' +
        '<div class="tc-top"><span class="section-pill">' + esc(t.section || "") + "</span>" + prioHtml(t.priority) + "</div>" +
        "<h3>" + esc(t.title) + "</h3><p>" + esc(t.summary || "") + "</p>" +
        '<div class="tc-foot">' +
        (done ? '<span class="revised-badge">✓ Revised</span>' : "") +
        (list(t.years).length ? '<span class="tag">' + list(t.years).length + "× examined</span>" : "") +
        (nq ? '<span class="tag">' + plural(nq, "question") + "</span>" : "") +
        (drillsForTopic(t.id).length ? '<span class="tag">' + plural(drillsForTopic(t.id).length, "drill") + "</span>" : "") +
        "</div></a>";
    });
    el.innerHTML = h + "</div>";
  }

  function viewTopic(id) {
    const t = topicById.get(id);
    if (!t) return notFound("That topic doesn't exist (yet).", "#/topics", "Back to topics");
    const revised = loadSet("revised");
    const done = revised.has(t.id);
    const qs = questionsForTopic(t);
    const ds = drillsForTopic(t.id);
    const yearsWithPaper = new Map();
    sortedPapers.forEach(function (p) { if (!yearsWithPaper.has(p.year)) yearsWithPaper.set(p.year, p); });

    let h = '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/topics">Topics</a> / ' + esc(t.section || "") + "</nav>";
    h += '<div class="topic-header"><div><h1>' + esc(t.title) + '</h1><div class="meta"><span class="section-pill">' + esc(t.section || "") + "</span>" + prioHtml(t.priority) + "</div></div>" +
      '<button type="button" class="btn toggle-revised" id="toggle-revised" aria-pressed="' + done + '">' + ICON.check + "<span>" + (done ? "Revised" : "Mark as revised") + "</span></button></div>";
    if (t.summary) h += '<p class="lead">' + esc(t.summary) + "</p>";

    const years = list(t.years).slice().sort();
    if (years.length) {
      h += '<div class="years-row"><span class="filter-label">Examined in</span><div class="chips">' + years.map(function (y) {
        const p = yearsWithPaper.get(y);
        return p ? '<a class="badge badge-year" href="#/papers/' + enc(p.id) + '">' + esc(y) + "</a>" : '<span class="badge badge-year">' + esc(y) + "</span>";
      }).join("") + "</div></div>";
    }

    h += '<div class="grid-2 section-gap">';
    h += '<section class="card"><h2>Key points</h2>' + (list(t.points).length
      ? '<ul class="points">' + list(t.points).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>"
      : '<p class="muted">No key points listed.</p>') + "</section>";
    h += '<section class="card"><h2>Pitfalls that lose marks</h2>' + (list(t.pitfalls).length
      ? '<ul class="pitfalls">' + list(t.pitfalls).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>"
      : '<p class="muted">None listed.</p>') + "</section>";
    h += "</div>";

    if (list(t.code).length) {
      h += '<section class="card section-gap"><h2>Code templates</h2>' +
        list(t.code).map(function (c) { return codeBlock(c.code, c.lang, c.title); }).join("") + "</section>";
    }

    h += '<section class="card section-gap"><div class="card-head"><h2>Past-paper questions</h2><span class="muted tiny mono">' + qs.length + "</span></div>";
    if (!qs.length) h += '<p class="muted">No tagged past-paper questions for this topic.</p>';
    else {
      h += '<ul class="qlink-list">' + qs.map(function (x) {
        return '<li><a href="' + qHref(x.paper, x.q) + '"><span class="ql-ref">' + esc(paperLabel(x.paper)) + " · " + esc(x.q.num) + '</span><span class="ql-text">' + esc(x.q.asked || "") +
          '</span><span class="badge badge-marks">' + esc(x.q.marks || 0) + "</span></a></li>";
      }).join("") + "</ul>";
    }
    h += "</section>";

    h += '<section class="card section-gap"><div class="card-head"><h2>Drills</h2><span class="muted tiny mono">' + ds.length + "</span></div>";
    if (!ds.length) h += '<p class="muted">No drills for this topic yet.</p>';
    else {
      const res = load("drills", {}) || {};
      h += '<ul class="qlink-list">' + ds.map(function (d) {
        const r = res[d.id];
        return '<li><a href="#/drills?d=' + enc(d.id) + '"><span class="ql-ref">' + esc(TYPE_LABEL[d.type] || d.type || "") +
          (r ? ' <span class="result-dot ' + r + '" title="' + r + '"></span>' : "") + '</span><span class="ql-text">' + esc(firstLine(d.prompt)) + "</span></a></li>";
      }).join("") + "</ul>" +
        '<div class="btn-row" style="margin-top:12px"><a class="btn btn-primary" href="#/drills?topic=' + enc(t.id) + '">' + ICON.zap + "Drill this topic (" + ds.length + ")</a></div>";
    }
    h += "</section>";

    // prev / next by the same ordering as the topic list
    const ordered = TOPICS.slice().sort(function (a, b) {
      return (Number(b.priority) || 0) - (Number(a.priority) || 0) || sectionRank(a.section) - sectionRank(b.section) || String(a.title).localeCompare(String(b.title));
    });
    const i = ordered.indexOf(t);
    const prev = ordered[i - 1], next = ordered[i + 1];
    h += '<nav class="pager" aria-label="More topics">' +
      (prev ? '<a class="pager-link" href="#/topics/' + enc(prev.id) + '"><span class="muted tiny">← Previous</span><strong>' + esc(prev.title) + "</strong></a>" : "<span></span>") +
      (next ? '<a class="pager-link next" href="#/topics/' + enc(next.id) + '"><span class="muted tiny">Next →</span><strong>' + esc(next.title) + "</strong></a>" : "<span></span>") +
      "</nav>";

    return {
      html: h,
      title: t.title,
      after: function () {
        const b = document.getElementById("toggle-revised");
        b.addEventListener("click", function () {
          const set = loadSet("revised");
          const on = !set.has(t.id);
          if (on) set.add(t.id); else set.delete(t.id);
          saveSet("revised", set);
          b.setAttribute("aria-pressed", String(on));
          b.querySelector("span").textContent = on ? "Revised" : "Mark as revised";
          toast(on ? "Marked as revised" : "Unmarked");
        });
      }
    };
  }
  function firstLine(s) {
    const str = String(s || "");
    const l = str.split("\n")[0];
    return l.length > 140 ? l.slice(0, 137) + "…" : l;
  }

  /* ---------------- Past papers ---------------- */
  function papersTabs(active) {
    return '<nav class="tabs no-print" aria-label="Past papers views"><a href="#/papers"' + (active === "list" ? ' aria-current="page"' : "") + ">Papers</a>" +
      '<a href="#/heatmap"' + (active === "heat" ? ' aria-current="page"' : "") + ">Tag heatmap</a></nav>";
  }
  function sectionMarks(p, name) {
    let m = 0;
    list(p.sections).forEach(function (s) { if (norm(s.name) === norm(name)) m += sum(list(s.questions), function (q) { return q.marks; }); });
    return m;
  }
  function viewPapers() {
    let h = '<div class="page-head"><div class="eyebrow">Practise</div><h1>Past papers</h1>' +
      "<p>Every question summarised in plain words. Try it yourself first, then reveal the approach and a model answer.</p></div>";
    h += papersTabs("list") + missingNotice(["data/papers.js"]);
    if (!sortedPapers.length) return { html: h + emptyHtml("No papers loaded yet", " They come from data/papers.js.") };
    h += '<div class="paper-grid">';
    sortedPapers.forEach(function (p) {
      const nq = sum(list(p.sections), function (s) { return list(s.questions).length; });
      const sql = sectionMarks(p, "SQL"), oop = sectionMarks(p, "OOP");
      h += '<a class="paper-card" href="#/papers/' + enc(p.id) + '"><div class="pc-top"><span class="paper-year">' + esc(p.year || "") + '</span><span class="paper-session">' + esc(p.session || "") + "</span></div>" +
        "<p>" + esc(p.scenario || "") + "</p>" +
        '<div class="paper-stats"><span class="badge badge-marks">' + esc(p.total || "?") + " marks</span>" +
        '<span class="tag">' + plural(nq, "question") + "</span>" +
        "</div>" +
        (sql || oop ? '<div class="split" aria-hidden="true"><span class="split-sql" style="flex:' + sql + '"></span><span class="split-oop" style="flex:' + oop + '"></span></div>' +
          '<div class="split-legend"><span><i class="split-sql"></i>SQL ' + sql + '</span><span><i class="split-oop"></i>OOP ' + oop + "</span></div>" : "") +
        "</a>";
    });
    return { html: h + "</div>" };
  }

  function viewPaper(id, params) {
    const p = paperById.get(id);
    if (!p) return notFound("That paper isn't in the data.", "#/papers", "All papers");
    const sections = list(p.sections);
    let h = '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/papers">Past papers</a> / ' + esc(paperLabel(p)) + "</nav>";
    h += '<div class="page-head paper-head"><div class="eyebrow">' + esc(p.session || "") + " " + esc(p.year || "") + "</div><h1>" + esc(paperLabel(p)) + "</h1>" +
      "<p>" + esc(p.scenario || "") + "</p></div>";
    h += '<div class="paper-toolbar no-print"><div class="chips">' +
      '<span class="badge badge-marks">' + esc(p.total || "?") + " marks</span>" +
      sections.map(function (s, i) {
        return '<a class="chip" href="#sec-' + i + '" data-jump="sec-' + i + '">' + esc(sectionName(s, i)) + ' <span class="count">' + sum(list(s.questions), function (q) { return q.marks; }) + "</span></a>";
      }).join("") +
      '</div><button type="button" class="btn btn-sm" id="toggle-all" aria-pressed="false">Reveal all answers</button></div>' +
      '<p class="try-first">Cover the answer, give it a real go (write the query or the method), then reveal. That\'s how it sticks.</p>';

    if (!sections.length) h += emptyHtml("No questions in this paper yet", "");
    sections.forEach(function (s, si) {
      const qs = list(s.questions);
      const isSql = norm(s.name) === "sql";
      h += '<section class="section-block" id="sec-' + si + '" aria-labelledby="sec-h-' + si + '"><div class="section-title"><h2 id="sec-h-' + si + '">' + esc(sectionName(s, si)) + "</h2>" +
        '<span class="badge badge-year">' + plural(qs.length, "question") + '</span><span class="badge badge-marks">' + sum(qs, function (q) { return q.marks; }) + " marks</span></div>";
      h += '<div class="stack">';
      qs.forEach(function (q) {
        const base = "r" + (++revealSeq);
        const lang = langOf(q.solution && q.solution.lang, isSql ? "sql" : "java");
        h += '<article class="card question" id="' + qId(q.num) + '" aria-labelledby="' + base + '-h">' +
          '<div class="q-head"><span class="q-num" id="' + base + '-h">' + esc(q.num) + '</span><span class="badge badge-marks">' + esc(q.marks || 0) + " mark" + (Number(q.marks) === 1 ? "" : "s") + "</span></div>" +
          '<div class="q-tags">' + list(q.tags).map(tagHtml).join("") + "</div>" +
          '<p class="q-asked">' + esc(q.asked || "") + "</p>" +
          '<div class="reveal-row">' +
          (q.approach ? revealBtn("Approach", base + "-a") : "") +
          (q.solution && q.solution.code ? revealBtn("Model answer", base + "-s") : "") +
          (list(q.pitfalls).length ? revealBtn("Mark-losers (" + list(q.pitfalls).length + ")", base + "-p") : "") +
          "</div>" +
          (q.approach ? '<div class="reveal-panel" id="' + base + '-a" hidden><h4>Approach</h4><p>' + esc(q.approach) + "</p></div>" : "") +
          (q.solution && q.solution.code ? '<div class="reveal-panel" id="' + base + '-s" hidden><h4>Model answer · own solution</h4>' + codeBlock(q.solution.code, lang, "Q" + q.num) + "</div>" : "") +
          (list(q.pitfalls).length ? '<div class="reveal-panel" id="' + base + '-p" hidden><h4>Where marks get lost</h4><ul class="pitfalls">' + list(q.pitfalls).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" : "") +
          "</article>";
      });
      if (!qs.length) h += emptyHtml("No questions in this section", "");
      h += "</div></section>";
    });

    // other papers
    const others = sortedPapers.filter(function (x) { return x !== p; });
    if (others.length) {
      h += '<div class="section-gap no-print"><div class="filter-label">Other papers</div><div class="chips">' +
        others.map(function (x) { return '<a class="chip" href="#/papers/' + enc(x.id) + '">' + esc(paperLabel(x)) + "</a>"; }).join("") + "</div></div>";
    }

    return {
      html: h,
      title: paperLabel(p),
      after: function (view) {
        const tog = document.getElementById("toggle-all");
        tog.addEventListener("click", function () {
          const open = tog.getAttribute("aria-pressed") !== "true";
          tog.setAttribute("aria-pressed", String(open));
          tog.textContent = open ? "Hide all answers" : "Reveal all answers";
          view.querySelectorAll("[data-reveal]").forEach(function (b) { setReveal(b, open); });
        });
        if (params.q) {
          const el = document.getElementById(qId(params.q));
          if (el) {
            setTimeout(function () {
              const bar = document.querySelector(".topbar");
              const offset = (bar ? bar.getBoundingClientRect().height : 56) + 12;
              window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset));
              el.classList.add("flash");
            }, 0);
            return true; // handled scroll
          }
        }
      }
    };
  }
  function sectionName(s, i) {
    const n = s.name || "";
    const letter = String.fromCharCode(65 + i);
    if (norm(n) === "sql") return "Section " + letter + " · SQL";
    if (norm(n) === "oop") return "Section " + letter + " · Java OOP";
    return "Section " + letter + (n ? " · " + n : "");
  }
  function tagHtml(tag) {
    const t = resolveTag(tag);
    if (t) return '<a class="tag tag-topic" href="#/topics/' + enc(t.id) + '" title="Topic: ' + esc(t.title) + '">' + esc(t.title) + "</a>";
    return '<span class="tag">' + esc(tag) + "</span>";
  }

  /* Heatmap: topic × year */
  const heatFilter = { scope: "all", metric: "q" };
  function viewHeatmap() {
    let h = '<div class="page-head"><div class="eyebrow">Spot the pattern</div><h1>What gets examined</h1>' +
      "<p>Each cell counts the questions (or marks) on that topic in that year's paper(s). Darker = more. Rows at the top come up every year: hit those hardest tonight.</p></div>";
    h += papersTabs("heat") + missingNotice(["data/papers.js", "data/topics.js"]);

    const years = new Set();
    sortedPapers.forEach(function (p) { if (p.year) years.add(Number(p.year)); });
    TOPICS.forEach(function (t) { list(t.years).forEach(function (y) { if (y) years.add(Number(y)); }); });
    const cols = Array.from(years).sort(function (a, b) { return a - b; });
    if (!cols.length) return { html: h + emptyHtml("Nothing to chart yet", " Needs papers or topic years.") };

    const rows = new Map();
    function row(key, init) { if (!rows.has(key)) rows.set(key, init); return rows.get(key); }
    TOPICS.forEach(function (t) {
      row("t:" + t.id, { label: t.title, href: "#/topics/" + enc(t.id), topic: t, java: t.section !== "SQL", cells: {}, sqlHits: 0, javaHits: 0 });
    });
    QUESTIONS.forEach(function (x) {
      const seen = new Set();
      list(x.q.tags).forEach(function (tag) {
        const t = resolveTag(tag);
        const key = t ? "t:" + t.id : "g:" + norm(tag);
        if (seen.has(key)) return;
        seen.add(key);
        const r = row(key, { label: String(tag), href: null, topic: null, java: false, cells: {}, sqlHits: 0, javaHits: 0 });
        if (norm(x.section.name) === "sql") r.sqlHits++; else r.javaHits++;
        const y = Number(x.paper.year);
        const c = r.cells[y] || (r.cells[y] = { n: 0, marks: 0, refs: [] });
        c.n++; c.marks += Number(x.q.marks) || 0; c.refs.push(x);
      });
    });
    rows.forEach(function (r) { if (!r.topic) r.java = r.javaHits > r.sqlHits; });

    let all = Array.from(rows.values());
    if (heatFilter.scope === "sql") all = all.filter(function (r) { return !r.java; });
    if (heatFilter.scope === "java") all = all.filter(function (r) { return r.java; });
    if (heatFilter.scope === "topics") all = all.filter(function (r) { return r.topic; });
    all.forEach(function (r) {
      r.qTotal = Object.keys(r.cells).reduce(function (a, k) { return a + r.cells[k].n; }, 0);
      r.mTotal = Object.keys(r.cells).reduce(function (a, k) { return a + r.cells[k].marks; }, 0);
      const ys = new Set(Object.keys(r.cells).map(Number));
      if (r.topic) list(r.topic.years).forEach(function (y) { ys.add(Number(y)); });
      r.yearCount = ys.size;
    });
    all = all.filter(function (r) { return r.qTotal || r.yearCount; })
      .sort(function (a, b) { return b.yearCount - a.yearCount || (heatFilter.metric === "m" ? b.mTotal - a.mTotal : b.qTotal - a.qTotal) || a.label.localeCompare(b.label); });

    h += '<div class="chips no-print" role="group" aria-label="Rows to show" style="margin-bottom:12px">' +
      heatChip("all", "Everything") + heatChip("topics", "Topics only") + heatChip("sql", "SQL") + heatChip("java", "Java") +
      '<span class="chip-sep" aria-hidden="true"></span>' + metricChip("q", "Count questions") + metricChip("m", "Count marks") + "</div>";
    const val = function (c) { return heatFilter.metric === "m" ? c.marks : c.n; };
    let maxV = 1;
    all.forEach(function (r) { Object.keys(r.cells).forEach(function (k) { maxV = Math.max(maxV, val(r.cells[k])); }); });
    if (!all.length) return { html: h + emptyHtml("No rows for this filter", "") };

    h += '<div class="heat-legend"><span><span class="sw" style="background:var(--surface-2);border:1px solid var(--line)"></span>not asked</span>' +
      '<span class="ramp"><span>fewer ' + (heatFilter.metric === "m" ? "marks" : "questions") + '</span><span class="sw h1"></span><span class="sw h2"></span><span class="sw h3"></span><span class="sw h4"></span><span>more (max ' + maxV + ")</span></span>" +
      '<span><b style="color:var(--accent)">•</b> examined (per topic notes, paper not loaded)</span></div>';

    h += '<div class="heat-wrap" tabindex="0" role="region" aria-label="Tag frequency heatmap, scrolls sideways"><table class="heat"><caption class="sr-only">' + (heatFilter.metric === "m" ? "Marks" : "Number of questions") + ' per topic per year in past papers</caption><thead><tr><th scope="col">Topic / tag</th>' +
      cols.map(function (y) { return '<th scope="col">' + y + "</th>"; }).join("") + '<th scope="col" title="Years examined">Yrs</th></tr></thead><tbody>';
    all.forEach(function (r) {
      h += '<tr><th scope="row">' + (r.href ? '<a href="' + r.href + '">' + esc(r.label) + "</a>" : '<span class="muted">' + esc(r.label) + "</span>") + "</th>";
      cols.forEach(function (y) {
        const c = r.cells[y];
        if (c) {
          const v = val(c);
          const lvl = Math.max(1, Math.min(4, Math.ceil((v / maxV) * 4)));
          const first = c.refs[0];
          const tip = y + ": " + plural(c.n, "question") + ", " + c.marks + " marks (" + c.refs.map(function (x) { return x.paper.session + " " + x.q.num; }).join(", ") + ")";
          h += '<td class="h' + lvl + '" title="' + esc(tip) + '"><a class="heat-link" href="' + qHref(first.paper, first.q) + '" aria-label="' + esc(r.label + ", " + tip) + '">' + v + "</a></td>";
        } else if (r.topic && list(r.topic.years).map(Number).indexOf(y) >= 0) {
          h += '<td class="dot" title="' + y + ': examined (no loaded question tagged)"><span aria-hidden="true">•</span><span class="sr-only">examined</span></td>';
        } else {
          h += '<td><span class="sr-only">none</span></td>';
        }
      });
      h += '<td class="total">' + r.yearCount + "</td></tr>";
    });
    h += "</tbody></table></div>";
    h += '<p class="muted tiny" style="margin-top:10px">Tap a number to jump to that question. Grey rows are raw tags that aren\'t a topic page.</p>';
    return { html: h, title: "Tag heatmap" };
  }
  function metricChip(val, label) {
    return '<button type="button" class="chip" data-metric="' + val + '" aria-pressed="' + (heatFilter.metric === val) + '">' + esc(label) + "</button>";
  }
  function heatChip(val, label) {
    return '<button type="button" class="chip" data-heat="' + val + '" aria-pressed="' + (heatFilter.scope === val) + '">' + esc(label) + "</button>";
  }

  /* ---------------- Drills ---------------- */
  const drill = { topic: "all", type: "all", mode: "all", deck: [], i: 0, session: {}, revealed: false, picked: null, single: null };
  function drillResults() { return load("drills", {}) || {}; }
  function buildDeck() {
    const res = drillResults();
    let ds = DRILLS.filter(function (d) {
      if (drill.single) return d.id === drill.single;
      if (drill.topic !== "all" && d.topic !== drill.topic) return false;
      if (drill.type !== "all" && d.type !== drill.type) return false;
      if (drill.mode === "missed" && res[d.id] !== "missed") return false;
      if (drill.mode === "new" && res[d.id]) return false;
      return true;
    });
    drill.deck = ds.map(function (d) { return d.id; });
    drill.i = 0; drill.session = {}; drill.revealed = false; drill.picked = null;
  }
  function viewDrills(params) {
    drill.single = params.d || null;
    if (params.topic) { drill.topic = params.topic; drill.type = "all"; drill.mode = "all"; }
    if (params.missed) { drill.mode = "missed"; }
    buildDeck();

    const res = drillResults();
    const topicsWithDrills = TOPICS.filter(function (t) { return drillsForTopic(t.id).length; });
    const nMissed = DRILLS.filter(function (d) { return res[d.id] === "missed"; }).length;
    const nNew = DRILLS.filter(function (d) { return !res[d.id]; }).length;

    let h = '<div class="page-head compact-m"><div class="eyebrow">Active recall</div><h1>Drills</h1>' +
      "<p>Answer in your head (or on paper) first, then reveal and be honest. Missed ones come back for another round.</p></div>";
    h += missingNotice(["data/drills.js"]);
    if (!DRILLS.length) return { html: h + emptyHtml("No drills loaded yet", " They come from data/drills.js.") };

    if (drill.single) {
      h += '<div class="notice" role="note"><span>Showing one drill.</span> <a href="#/drills">Show all drills →</a></div>';
    } else {
      h += '<div class="drill-filters no-print"><div class="grid" style="gap:10px">' +
        '<div><label class="filter-label" for="drill-topic">Topic</label><select class="field" id="drill-topic"><option value="all">All topics (' + DRILLS.length + ")</option>" +
        topicsWithDrills.map(function (t) { return '<option value="' + esc(t.id) + '"' + (drill.topic === t.id ? " selected" : "") + ">" + esc(t.title) + " (" + drillsForTopic(t.id).length + ")</option>"; }).join("") +
        "</select></div>" +
        '<div class="filter-row"><div><div class="filter-label" id="dl-type">Type</div><div class="chips" role="group" aria-labelledby="dl-type">' +
        dchip("type", "all", "All") + DRILL_TYPES.filter(function (ty) { return DRILLS.some(function (d) { return d.type === ty; }); }).map(function (ty) { return dchip("type", ty, TYPE_LABEL[ty]); }).join("") + "</div></div>" +
        '<div><div class="filter-label" id="dl-mode">Which</div><div class="chips" role="group" aria-labelledby="dl-mode">' +
        dchip("mode", "all", "All") + dchip("mode", "missed", "Missed before", nMissed) + dchip("mode", "new", "Not tried", nNew) + "</div></div></div>" +
        '</div><div class="btn-row"><button type="button" class="btn btn-sm" id="drill-shuffle">' + ICON.shuffle + "Shuffle</button>" +
        '<button type="button" class="btn btn-sm btn-ghost" id="drill-reset">Reset saved results</button></div></div>';
    }
    h += '<div class="drill-shell" id="drill-stage"></div>';
    return {
      html: h,
      after: function () {
        renderDrillStage(false);
        const sel = document.getElementById("drill-topic");
        if (sel) sel.addEventListener("change", function () { drill.topic = sel.value; buildDeck(); renderDrillStage(false); });
        const sh = document.getElementById("drill-shuffle");
        if (sh) sh.addEventListener("click", function () {
          for (let i = drill.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = drill.deck[i]; drill.deck[i] = drill.deck[j]; drill.deck[j] = tmp;
          }
          drill.i = 0; drill.session = {}; drill.revealed = false; drill.picked = null;
          renderDrillStage(false);
          toast("Deck shuffled");
        });
        const rs = document.getElementById("drill-reset");
        if (rs) rs.addEventListener("click", function () {
          if (!window.confirm("Clear your saved got/missed results for all drills?")) return;
          save("drills", {});
          route();
          toast("Drill results cleared");
        });
      }
    };
  }
  function dchip(group, val, label, count) {
    return '<button type="button" class="chip" data-df="' + group + '" data-val="' + esc(val) + '" aria-pressed="' + (drill[group] === val) + '">' + esc(label) +
      (count != null ? ' <span class="count">' + count + "</span>" : "") + "</button>";
  }
  function currentDrill() {
    const id = drill.deck[drill.i];
    return DRILLS.find(function (d) { return d.id === id; }) || null;
  }
  function mcqCorrectIndex(d) {
    const opts = list(d.options);
    let idx = opts.findIndex(function (o) { return norm(o) === norm(d.answer); });
    if (idx < 0 && /^[a-h]$/i.test(String(d.answer || "").trim())) idx = String(d.answer).trim().toUpperCase().charCodeAt(0) - 65;
    if (idx < 0 && /^\d+$/.test(String(d.answer || "").trim())) idx = Number(d.answer) - 1;
    return idx >= 0 && idx < opts.length ? idx : -1;
  }
  function promptHtml(d) {
    const text = String(d.prompt || "");
    const split = text.indexOf("\n\n");
    if (split > 0 && (d.type === "predict" || d.type === "java" || d.type === "sql")) {
      const rest = text.slice(split + 2);
      if (/[;{}()=]/.test(rest)) {
        return '<p class="fc-prompt" id="fc-prompt">' + esc(text.slice(0, split)) + "</p>" + codeBlock(rest, d.type === "sql" ? "sql" : "java", "");
      }
    }
    return '<p class="fc-prompt" id="fc-prompt">' + esc(text) + "</p>";
  }
  function renderDrillStage(focus) {
    const el = document.getElementById("drill-stage");
    if (!el) return;
    document.querySelectorAll("[data-df]").forEach(function (b) { b.setAttribute("aria-pressed", String(drill[b.getAttribute("data-df")] === b.getAttribute("data-val"))); });
    const saved = drillResults();
    const cMissed = document.querySelector('[data-df="mode"][data-val="missed"] .count');
    const cNew = document.querySelector('[data-df="mode"][data-val="new"] .count');
    if (cMissed) cMissed.textContent = DRILLS.filter(function (x) { return saved[x.id] === "missed"; }).length;
    if (cNew) cNew.textContent = DRILLS.filter(function (x) { return !saved[x.id]; }).length;
    const total = drill.deck.length;
    const got = Object.keys(drill.session).filter(function (k) { return drill.session[k] === "got"; }).length;
    const missedN = Object.keys(drill.session).length - got;

    if (!total) {
      el.innerHTML = emptyHtml(drill.mode === "missed" ? "Nothing missed. Nice." : "No drills match these filters", drill.mode === "missed" ? " Every drill you've tried is marked as got it." : " Try another topic or type.");
      return;
    }
    if (drill.i >= total) {
      const missedIds = drill.deck.filter(function (id) { return drill.session[id] === "missed"; });
      let h = '<section class="flashcard summary" aria-labelledby="sum-h"><div class="fc-top"><span class="fc-type">Round done</span></div>' +
        '<h2 id="sum-h" tabindex="-1" class="score-big">' + got + "<span class=\"muted\">/" + total + "</span></h2>" +
        '<p class="muted">' + pct(got, total) + "% nailed this round." + (missedIds.length ? " Re-drill the ones you missed while they're fresh." : " Clean sweep, move on to another topic.") + "</p>";
      if (missedIds.length) {
        h += '<div><div class="filter-label">Missed</div><ul class="qlink-list">' + missedIds.map(function (id) {
          const d = DRILLS.find(function (x) { return x.id === id; });
          const t = d && topicById.get(d.topic);
          return '<li><a href="#/drills?d=' + enc(id) + '"><span class="ql-ref">' + esc(t ? t.title : (d && d.topic) || "") + '</span><span class="ql-text">' + esc(firstLine(d && d.prompt)) + "</span></a></li>";
        }).join("") + "</ul></div>";
      }
      h += '<div class="fc-actions">' + (missedIds.length ? '<button type="button" class="btn btn-primary" data-dact="redrill">Re-drill missed (' + missedIds.length + ")</button>" : "") +
        '<button type="button" class="btn" data-dact="restart">Restart this deck</button></div></section>';
      el.innerHTML = h;
      hydrateCode(el);
      if (focus) { const hd = document.getElementById("sum-h"); if (hd) hd.focus(); }
      return;
    }

    const d = currentDrill();
    const t = d && topicById.get(d.topic);
    const prev = drillResults()[d.id];
    let h = '<div class="drill-bar"><span class="drill-count">' + (drill.i + 1) + " / " + total + "</span>" +
      '<div class="meter" role="progressbar" aria-label="Deck progress" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + drill.i + '"><span style="width:' + pct(drill.i, total) + '%"></span></div>' +
      '<span class="drill-count"><span style="color:var(--good)">✓ ' + got + '</span> &nbsp;<span style="color:var(--bad)">✗ ' + missedN + "</span></span></div>";
    h += '<section class="flashcard" aria-labelledby="fc-prompt">' +
      '<div class="fc-top"><span class="fc-type">' + esc(TYPE_LABEL[d.type] || d.type || "Drill") + "</span>" +
      (t ? '<a class="tag tag-topic" href="#/topics/' + enc(t.id) + '">' + esc(t.title) + "</a>" : d.topic ? '<span class="tag">' + esc(d.topic) + "</span>" : "") +
      (prev ? '<span class="tag" title="Last time"><span class="result-dot ' + prev + '"></span>&nbsp;last: ' + (prev === "got" ? "got it" : "missed") + "</span>" : "") +
      "</div>" + promptHtml(d);

    if (d.type === "mcq" && list(d.options).length) {
      const ci = mcqCorrectIndex(d);
      h += '<div class="options" role="group" aria-label="Options">' + list(d.options).map(function (o, i) {
        let cls = "";
        if (drill.picked != null) { if (i === ci) cls = " correct"; else if (i === drill.picked) cls = " wrong"; }
        return '<button type="button" class="option' + cls + '" data-opt="' + i + '"' + (drill.picked != null ? " disabled" : "") + '><span class="opt-key">' + String.fromCharCode(65 + i) + "</span><span>" + esc(o) + "</span></button>";
      }).join("") + "</div>";
      if (drill.picked != null) {
        const right = drill.picked === ci;
        h += '<div class="fc-answer" role="status"><p class="feedback ' + (right ? "good" : "bad") + '">' + (right ? ICON.check + "Correct" : ICON.x + "Not quite. Answer: " + esc(ci >= 0 ? list(d.options)[ci] : d.answer)) + "</p>" +
          (d.explain ? "<p>" + esc(d.explain) + "</p>" : "") + "</div>" +
          '<div class="fc-actions"><button type="button" class="btn btn-primary" data-dact="next" id="fc-next">Next ' + ICON.arrow + "</button></div>";
      }
    } else {
      if (!drill.revealed) {
        h += '<div class="fc-actions"><button type="button" class="btn btn-primary" data-dact="reveal" aria-expanded="false" aria-controls="fc-answer">Reveal answer</button></div>';
      } else {
        const ans = String(d.answer || "");
        const lang = d.type === "sql" ? "sql" : d.type === "java" ? "java" : "";
        h += '<div class="fc-answer" id="fc-answer"><h4>Model answer</h4>' +
          (lang ? codeBlock(ans, lang, "") : '<pre class="plain">' + esc(ans) + "</pre>") +
          (d.explain ? '<p style="margin-top:10px">' + esc(d.explain) + "</p>" : "") + "</div>" +
          '<div class="fc-actions"><button type="button" class="btn btn-good" data-dact="got" id="fc-got">' + ICON.check + 'Got it</button><button type="button" class="btn btn-bad" data-dact="missed">' + ICON.x + "Missed it</button></div>";
      }
    }
    h += "</section>";
    h += '<p class="kbd-hints no-print"><kbd>Space</kbd> reveal · <kbd>G</kbd> got it · <kbd>M</kbd> missed · <kbd>A</kbd>–<kbd>D</kbd> pick option · <kbd>N</kbd> next</p>';
    el.innerHTML = h;
    hydrateCode(el);
    if (focus) {
      const target = el.querySelector("#fc-next, #fc-got, [data-dact='reveal'], .option:not([disabled])");
      if (target) target.focus({ preventScroll: true });
    }
  }
  function drillAction(act, arg) {
    const d = currentDrill();
    if (act === "reveal" && d) { drill.revealed = true; renderDrillStage(true); return; }
    if ((act === "got" || act === "missed") && d && drill.revealed) { record(d, act); advance(); return; }
    if (act === "pick" && d && drill.picked == null) {
      const n = list(d.options).length;
      if (arg < 0 || arg >= n) return;
      drill.picked = arg;
      record(d, arg === mcqCorrectIndex(d) ? "got" : "missed");
      renderDrillStage(true);
      return;
    }
    if (act === "next" && d && drill.picked != null) { advance(); return; }
    if (act === "redrill") {
      drill.deck = drill.deck.filter(function (id) { return drill.session[id] === "missed"; });
      drill.i = 0; drill.session = {}; drill.revealed = false; drill.picked = null;
      renderDrillStage(true); return;
    }
    if (act === "restart") { drill.i = 0; drill.session = {}; drill.revealed = false; drill.picked = null; renderDrillStage(true); }
  }
  function record(d, result) {
    drill.session[d.id] = result;
    const res = drillResults();
    res[d.id] = result;
    save("drills", res);
  }
  function advance() {
    drill.i++; drill.revealed = false; drill.picked = null;
    renderDrillStage(true);
  }

  /* ---------------- Cheat sheets ---------------- */
  function viewCheat() {
    const dialects = list(PLAN.sqlDialects);
    const sqlTopics = TOPICS.filter(function (t) { return t.section === "SQL" && list(t.code).length; })
      .sort(function (a, b) { return (Number(b.priority) || 0) - (Number(a.priority) || 0); });
    let h = '<div class="print-only"><strong>IEB IT Paper 1 · cheat sheet</strong></div>';
    h += '<div class="page-head topic-header"><div><div class="eyebrow no-print">Quick reference</div><h1>Cheat sheets</h1>' +
      "<p>SQL dialect differences and the Java patterns you'll write tomorrow, on one page. Print it or keep it open.</p></div>" +
      '<button type="button" class="btn no-print" id="print-btn">' + ICON.print + "Print</button></div>";
    h += missingNotice(["data/plan.js", "data/topics.js"]);
    h += '<nav class="chips no-print" aria-label="Jump to" style="margin-bottom:8px"><a class="chip" href="#cs-dialects" data-jump="cs-dialects">SQL dialects</a>' +
      '<a class="chip" href="#cs-sql" data-jump="cs-sql">SQL templates</a><a class="chip" href="#cs-java" data-jump="cs-java">Java OOP</a></nav>';

    h += '<section class="section-block" id="cs-dialects" aria-labelledby="cs-d-h"><div class="section-title"><h2 id="cs-d-h">SQL: Access vs MySQL vs JavaDB</h2></div>';
    if (!dialects.length) h += emptyHtml("No dialect table yet", " Comes from data/plan.js (sqlDialects).");
    else {
      h += '<div class="table-wrap" tabindex="0" role="region" aria-label="SQL dialect table"><table class="dialect"><thead><tr><th scope="col">Feature</th><th scope="col">Access</th><th scope="col">MySQL</th><th scope="col">JavaDB</th></tr></thead><tbody>' +
        dialects.map(function (r) {
          return '<tr><th scope="row">' + esc(r.feature) + "</th><td>" + cellCode(r.access) + "</td><td>" + cellCode(r.mysql) + "</td><td>" + cellCode(r.javadb) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
    h += "</section>";

    h += '<section class="section-block" id="cs-sql" aria-labelledby="cs-s-h"><div class="section-title"><h2 id="cs-s-h">SQL templates</h2></div>';
    if (!sqlTopics.length) h += emptyHtml("No SQL templates yet", "");
    else h += '<div class="cheat-grid">' + sqlTopics.map(cheatItem).join("") + "</div>";
    h += "</section>";

    h += '<section class="section-block" id="cs-java" aria-labelledby="cs-j-h"><div class="section-title"><h2 id="cs-j-h">Java OOP cheat sheet</h2></div>';
    let any = false;
    JAVA_SECTIONS.forEach(function (sec) {
      const ts = TOPICS.filter(function (t) { return t.section === sec && list(t.code).length; })
        .sort(function (a, b) { return (Number(b.priority) || 0) - (Number(a.priority) || 0); });
      if (!ts.length) return;
      any = true;
      h += '<h3 class="cheat-sub">' + esc(sec) + '</h3><div class="cheat-grid">' + ts.map(cheatItem).join("") + "</div>";
    });
    if (!any) h += emptyHtml("No Java templates yet", " Built from OOP / Files & Arrays / Algorithms / Dates & Strings topics.");
    h += "</section>";
    return {
      html: h,
      title: "Cheat sheets",
      after: function () {
        const pb = document.getElementById("print-btn");
        pb.addEventListener("click", function () { window.print(); });
      }
    };
  }
  function cellCode(v) { return v == null || v === "" ? '<span class="muted">—</span>' : "<code>" + esc(v) + "</code>"; }
  function cheatItem(t) {
    return '<article class="card cheat-item"><h3><a href="#/topics/' + enc(t.id) + '">' + esc(t.title) + "</a>" + prioHtml(t.priority) + "</h3>" +
      list(t.code).map(function (c) { return codeBlock(c.code, c.lang, c.title); }).join("") +
      (list(t.pitfalls).length ? '<p class="cheat-pit"><strong>Watch:</strong> ' + list(t.pitfalls).slice(0, 2).map(esc).join(" · ") + "</p>" : "") +
      "</article>";
  }

  /* ---------------- Exam day ---------------- */
  function viewExam() {
    const items = list(PLAN.checklist);
    const done = loadSet("check");
    const resources = list(PLAN.resources);
    const technique = TOPICS.filter(function (t) { return t.section === "Exam technique"; });
    let h = '<div class="page-head"><div class="eyebrow">Tomorrow</div><h1>Exam day</h1><p>' + esc(examLabel()) + ". Tick these off before you leave.</p></div>";
    h += missingNotice(["data/plan.js"]);
    if (PLAN.examNote) h += '<div class="callout" style="margin-bottom:18px"><strong>Remember:</strong> ' + esc(PLAN.examNote) + "</div>";
    h += '<div class="grid-2">';
    h += '<section class="card" aria-labelledby="cl-h"><div class="card-head"><h2 id="cl-h">Checklist</h2><span class="muted tiny mono" id="cl-count">' +
      items.filter(function (x, i) { return done.has(i + "|" + x); }).length + "/" + items.length + "</span></div>";
    if (!items.length) h += emptyHtml("No checklist yet", " Comes from data/plan.js.");
    else {
      h += '<ul class="checklist">' + items.map(function (x, i) {
        const k = i + "|" + x;
        return '<li><label class="check"><input type="checkbox" data-check="' + esc(k) + '"' + (done.has(k) ? " checked" : "") + '><span class="check-body"><span class="check-text">' + esc(x) + "</span></span></label></li>";
      }).join("") + "</ul>" +
        '<div class="btn-row" style="margin-top:10px"><button type="button" class="btn btn-sm btn-ghost" id="cl-reset">Untick all</button></div>';
    }
    h += "</section>";

    h += '<div class="stack">';
    if (technique.length) {
      h += '<section class="card" aria-labelledby="tech-h"><h2 id="tech-h">Exam technique</h2><ul class="topic-mini">' + technique.map(function (t) {
        return '<li><a href="#/topics/' + enc(t.id) + '"><span class="tm-title">' + esc(t.title) + '</span><span class="muted" aria-hidden="true">→</span></a></li>';
      }).join("") + "</ul></section>";
    }
    h += '<section class="card" aria-labelledby="res-h"><h2 id="res-h">Resources</h2>';
    if (!resources.length) h += '<p class="muted">No resources listed.</p>';
    else {
      h += '<ul class="resource-list">' + resources.map(function (r) {
        const u = safeUrl(r.url);
        const inner = "<strong>" + esc(r.title || r.url) + "</strong>" + (r.why ? "<span>" + esc(r.why) + "</span>" : "") + (u ? '<span class="url">' + esc(u.replace(/^https?:\/\//, "")) + "</span>" : "");
        return "<li>" + (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>" : '<div class="resource-static">' + inner + "</div>") + "</li>";
      }).join("") + "</ul>";
    }
    h += "</section></div></div>";
    return {
      html: h,
      title: "Exam day",
      after: function (view) {
        const r = document.getElementById("cl-reset");
        if (r) r.addEventListener("click", function () {
          save("check", []);
          view.querySelectorAll("input[data-check]").forEach(function (i) { i.checked = false; });
          updateChecklistCount();
        });
      }
    };
  }
  function updateChecklistCount() {
    const el = document.getElementById("cl-count");
    if (!el) return;
    const boxes = document.querySelectorAll("input[data-check]");
    el.textContent = Array.from(boxes).filter(function (b) { return b.checked; }).length + "/" + boxes.length;
  }

  function notFound(msg, href, label) {
    return { html: '<div class="page-head"><h1>Not found</h1><p>' + esc(msg) + '</p></div><a class="btn" href="' + href + '">' + ICON.back + esc(label) + "</a>", title: "Not found" };
  }

  /* ======================================================================
     ROUTER
     ====================================================================== */
  function parseHash() {
    const raw = (location.hash || "").replace(/^#\/?/, "");
    const qi = raw.indexOf("?");
    const path = (qi >= 0 ? raw.slice(0, qi) : raw).split("/").filter(Boolean).map(function (s) {
      try { return decodeURIComponent(s); } catch (e) { return s; }
    });
    const params = {};
    if (qi >= 0) {
      raw.slice(qi + 1).split("&").forEach(function (kv) {
        if (!kv) return;
        const i = kv.indexOf("=");
        const k = i >= 0 ? kv.slice(0, i) : kv;
        let v = i >= 0 ? kv.slice(i + 1) : "1";
        try { v = decodeURIComponent(v.replace(/\+/g, " ")); } catch (e) { /* keep raw */ }
        params[k] = v;
      });
    }
    return { path: path, params: params };
  }
  let firstRender = true;
  let lastRouteKey = "";
  function route() {
    const r = parseHash();
    const p = r.path;
    // In-page anchor links (e.g. "#sec-1") are not routes: handled by the jump handler.
    const nonRoute = (location.hash || "").length > 1 && location.hash.charAt(1) !== "/";
    if (nonRoute && !firstRender) return;
    let nav = "home", out;
    const head = nonRoute ? "" : (p[0] || "");
    try {
      if (!head) out = viewHome();
      else if (head === "topics" && p[1]) { nav = "topics"; out = viewTopic(p[1]); }
      else if (head === "topics") { nav = "topics"; out = viewTopics(); }
      else if (head === "papers" && p[1]) { nav = "papers"; out = viewPaper(p[1], r.params); }
      else if (head === "papers") { nav = "papers"; out = viewPapers(); }
      else if (head === "heatmap") { nav = "papers"; out = viewHeatmap(); }
      else if (head === "drills") { nav = "drills"; out = viewDrills(r.params); }
      else if (head === "cheat") { nav = "cheat"; out = viewCheat(); }
      else if (head === "exam") { nav = "exam"; out = viewExam(); }
      else out = notFound("There's no page at that address.", "#/", "Home");
    } catch (err) {
      console.error(err);
      out = { html: '<div class="page-head"><h1>Something went wrong</h1><p>This view hit an error, probably from unexpected data. Other pages should still work.</p></div><a class="btn" href="#/">Home</a>' };
    }

    const view = document.getElementById("view");
    view.innerHTML = out.html;
    hydrateCode(view);
    if (p.join("/") !== lastRouteKey) {
      view.classList.remove("view-in");
      void view.offsetWidth; // restart the enter animation
      view.classList.add("view-in");
    }
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === nav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    const titles = { topics: "Topics", papers: "Past papers", drills: "Drills", cheat: "Cheat sheets", exam: "Exam day" };
    document.title = out.title ? out.title + " · " + BASE_TITLE : nav === "home" ? BASE_TITLE : (titles[nav] || "") + " · " + BASE_TITLE;

    let handledScroll = false;
    if (out.after) {
      try { handledScroll = out.after(view) === true; } catch (err) { console.error(err); }
    }
    const key = p.join("/");
    if (!handledScroll && key !== lastRouteKey) window.scrollTo(0, 0);
    if (!firstRender && key !== lastRouteKey) {
      const main = document.getElementById("main");
      main.focus({ preventScroll: true });
    }
    lastRouteKey = key;
    firstRender = false;
    tick();
  }

  /* ======================================================================
     GLOBAL SEARCH
     ====================================================================== */
  let searchIndex = null;
  function buildSearchIndex() {
    const idx = [];
    TOPICS.forEach(function (t) {
      idx.push({
        kind: "Topic", title: t.title || t.id, sub: (t.section ? t.section + " · " : "") + (t.summary || ""), href: "#/topics/" + enc(t.id),
        hay: norm([t.title, t.id, t.section, t.summary].concat(list(t.points), list(t.pitfalls), list(t.years)).join(" ")), boost: Number(t.priority) || 0
      });
    });
    QUESTIONS.forEach(function (x) {
      const tagNames = list(x.q.tags).map(function (tg) { const r = resolveTag(tg); return r ? r.title + " " + tg : tg; });
      idx.push({
        kind: "Q", title: paperLabel(x.paper) + " · Q" + x.q.num + " (" + (x.q.marks || 0) + ")", sub: x.q.asked || "", href: qHref(x.paper, x.q),
        hay: norm([x.paper.year, x.paper.session, x.paper.scenario, x.section.name, "q" + x.q.num, x.q.num, x.q.asked, x.q.approach].concat(tagNames).join(" ")), boost: 0
      });
    });
    DRILLS.forEach(function (d) {
      const t = topicById.get(d.topic);
      idx.push({
        kind: "Drill", title: firstLine(d.prompt), sub: (TYPE_LABEL[d.type] || d.type || "") + (t ? " · " + t.title : ""), href: "#/drills?d=" + enc(d.id),
        hay: norm([d.prompt, d.answer, d.explain, d.type, d.topic, t && t.title].concat(list(d.options)).join(" ")), boost: 0
      });
    });
    return idx;
  }
  function highlight(text, terms) {
    let out = esc(text);
    terms.forEach(function (t) {
      const et = esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!et) return;
      out = out.replace(new RegExp("(" + et + ")(?![^<]*>)", "gi"), "<mark>$1</mark>");
    });
    return out;
  }
  let searchActive = -1;
  function runSearch(q) {
    const box = document.getElementById("search-results");
    const input = document.getElementById("search-input");
    if (!searchIndex) searchIndex = buildSearchIndex();
    const terms = norm(q).split(/\s+/).filter(Boolean);
    searchActive = -1;
    input.removeAttribute("aria-activedescendant");
    if (!terms.length) {
      box.innerHTML = '<div class="search-empty">Type to search ' + plural(TOPICS.length, "topic") + ", " + plural(QUESTIONS.length, "question") + " and " + plural(DRILLS.length, "drill") + ".</div>";
      input.setAttribute("aria-expanded", "false");
      return;
    }
    const scored = [];
    searchIndex.forEach(function (e) {
      if (!terms.every(function (t) { return e.hay.indexOf(t) >= 0; })) return;
      const tl = norm(e.title);
      let s = e.boost;
      terms.forEach(function (t) { if (tl.indexOf(t) >= 0) s += 5; if (tl.indexOf(t) === 0) s += 3; });
      scored.push({ e: e, s: s });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    const groups = [["Topic", "Topics", 6], ["Q", "Past-paper questions", 8], ["Drill", "Drills", 6]];
    let h = "", n = 0;
    groups.forEach(function (g) {
      const items = scored.filter(function (x) { return x.e.kind === g[0]; }).slice(0, g[2]);
      if (!items.length) return;
      h += '<div class="sr-group" role="presentation">' + g[1] + "</div>";
      items.forEach(function (x) {
        h += '<a class="sr-item" role="option" id="sr-' + n + '" aria-selected="false" href="' + x.e.href + '" tabindex="-1">' +
          '<span class="sr-kind">' + (x.e.kind === "Q" ? "Paper" : x.e.kind) + '</span><span class="sr-main"><span class="sr-title">' + highlight(x.e.title, terms) +
          '</span><span class="sr-sub">' + highlight(x.e.sub, terms) + "</span></span></a>";
        n++;
      });
    });
    box.innerHTML = n ? h : '<div class="search-empty">No results for “' + esc(q) + "”.</div>";
    input.setAttribute("aria-expanded", n ? "true" : "false");
    if (n) setActive(0);
  }
  function setActive(i) {
    const items = document.querySelectorAll("#search-results .sr-item");
    if (!items.length) return;
    searchActive = (i + items.length) % items.length;
    items.forEach(function (el, k) { el.setAttribute("aria-selected", String(k === searchActive)); });
    const cur = items[searchActive];
    document.getElementById("search-input").setAttribute("aria-activedescendant", cur.id);
    cur.scrollIntoView({ block: "nearest" });
  }
  function openSearch() {
    const dlg = document.getElementById("search-dialog");
    const input = document.getElementById("search-input");
    if (dlg.open) { input.focus(); return; }
    try { dlg.showModal(); } catch (e) { dlg.setAttribute("open", ""); }
    runSearch(input.value);
    input.focus();
    input.select();
  }
  function closeSearch() {
    const dlg = document.getElementById("search-dialog");
    if (!dlg.open) return;
    try { dlg.close(); } catch (e) { dlg.removeAttribute("open"); }
  }

  /* ======================================================================
     THEME
     ====================================================================== */
  function effectiveTheme() {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncThemeButton() {
    const b = document.getElementById("theme-toggle");
    if (b) b.setAttribute("aria-label", effectiveTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
  function toggleTheme() {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { window.localStorage.setItem("p1:theme", next); } catch (e) { /* ignore */ }
    syncThemeButton();
  }

  /* ======================================================================
     EVENTS
     ====================================================================== */
  function isTyping(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }
  function init() {
    try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) { /* ignore */ }
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    syncThemeButton();
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", syncThemeButton);
    }

    // Search dialog
    const input = document.getElementById("search-input");
    const dlg = document.getElementById("search-dialog");
    document.getElementById("search-open").addEventListener("click", openSearch);
    document.getElementById("search-close").addEventListener("click", closeSearch);
    input.addEventListener("input", function () { runSearch(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(searchActive + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(searchActive - 1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        const items = document.querySelectorAll("#search-results .sr-item");
        const cur = items[searchActive >= 0 ? searchActive : 0];
        if (cur) { closeSearch(); goTo(cur.getAttribute("href")); }
      }
    });
    document.getElementById("search-results").addEventListener("click", function (e) {
      const a = e.target.closest(".sr-item");
      if (!a) return;
      e.preventDefault();
      closeSearch();
      goTo(a.getAttribute("href"));
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeSearch(); }); // backdrop click

    // Delegated clicks inside the view
    const view = document.getElementById("view");
    view.addEventListener("click", function (e) {
      const rb = e.target.closest("[data-reveal]");
      if (rb) { setReveal(rb, rb.getAttribute("aria-expanded") !== "true"); return; }
      const tf = e.target.closest("[data-tf]");
      if (tf) {
        topicFilter[tf.getAttribute("data-tf")] = tf.getAttribute("data-val");
        view.querySelectorAll('[data-tf="' + tf.getAttribute("data-tf") + '"]').forEach(function (b) { b.setAttribute("aria-pressed", String(b === tf)); });
        renderTopicResults();
        return;
      }
      const hc = e.target.closest("[data-heat]");
      if (hc) { heatFilter.scope = hc.getAttribute("data-heat"); route(); const again = view.querySelector('[data-heat="' + heatFilter.scope + '"]'); if (again) again.focus(); return; }
      const mc = e.target.closest("[data-metric]");
      if (mc) { heatFilter.metric = mc.getAttribute("data-metric"); route(); const again = view.querySelector('[data-metric="' + heatFilter.metric + '"]'); if (again) again.focus(); return; }
      const df = e.target.closest("[data-df]");
      if (df) { drill[df.getAttribute("data-df")] = df.getAttribute("data-val"); buildDeck(); renderDrillStage(false); return; }
      const opt = e.target.closest("[data-opt]");
      if (opt) { drillAction("pick", Number(opt.getAttribute("data-opt"))); return; }
      const da = e.target.closest("[data-dact]");
      if (da) { drillAction(da.getAttribute("data-dact")); return; }
      const jump = e.target.closest("[data-jump]");
      if (jump) {
        e.preventDefault();
        const target = document.getElementById(jump.getAttribute("data-jump"));
        if (target) { target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }); }
      }
    });
    view.addEventListener("change", function (e) {
      const t = e.target;
      if (t.matches("input[data-plan]")) {
        const set = loadSet("plan");
        if (t.checked) set.add(t.getAttribute("data-plan")); else set.delete(t.getAttribute("data-plan"));
        saveSet("plan", set);
        const li = t.closest("li");
        if (li) li.classList.toggle("done", t.checked);
        const boxes = view.querySelectorAll("input[data-plan]");
        const c = document.getElementById("plan-count");
        if (c) c.textContent = Array.from(boxes).filter(function (b) { return b.checked; }).length + "/" + boxes.length + " done";
        refreshProgress();
      } else if (t.matches("input[data-check]")) {
        const set = loadSet("check");
        if (t.checked) set.add(t.getAttribute("data-check")); else set.delete(t.getAttribute("data-check"));
        saveSet("check", set);
        updateChecklistCount();
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", function (e) {
      if (e.defaultPrevented) return;
      const typing = isTyping(document.activeElement);
      if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K"))) {
        e.preventDefault();
        openSearch();
        return;
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey || dlg.open) return;
      if (!document.getElementById("drill-stage")) return;
      const k = e.key.toLowerCase();
      const ae = document.activeElement;
      const onControl = ae && (ae.tagName === "BUTTON" || ae.tagName === "A");
      if (k === " " && !onControl) { e.preventDefault(); drillAction("reveal"); }
      else if (k === "g") drillAction("got");
      else if (k === "m") drillAction("missed");
      else if (k === "n") drillAction("next");
      else if (/^[a-h]$/.test(k) && currentDrill() && currentDrill().type === "mcq") drillAction("pick", k.charCodeAt(0) - 97);
    });

    window.addEventListener("hashchange", route);
    route();
    setInterval(tick, 1000);
  }
  function goTo(href) {
    if (location.hash === href) route(); else location.hash = href;
  }
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

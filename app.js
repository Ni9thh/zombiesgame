/*
 * ZOMBIES DEV PLAN · APP
 * Draws the page from data.js and saves your progress in this browser (localStorage).
 * Use "Back up" on the page to save a .json copy of your progress, and "Restore" to load one.
 */
(function () {
  "use strict";

  var D = window.PLAN_DATA;
  var SCOPE = window.SCOPE_CATEGORIES;
  var TOTAL_WEEKS = D.totalWeeks || 36; // recalculated from the phases on every draw
  var MAX_WEEKS = 520;
  var LS_KEY = "zombies-plan-local-v1";
  var UI_KEY = LS_KEY + "-ui";
  var STATUS = ["To do", "Doing", "Done"];

  // ---------- state ----------
  // The plan's structure always comes from data.js. Saved progress (statuses, your own tasks,
  // the scope sheet, start date) is layered on top, matched by id.
  function merge(def, saved) {
    var st = {
      startDate: (saved && saved.startDate) || def.startDate,
      scope: (saved && saved.scope) || { locked: 0, items: {} },
      customSchedule: saved && saved.customSchedule ? 1 : 0, // 1 = you changed the weeks on the page
      pages: (saved && saved.pages) || {}, // what you've written on each task's page, by task id
      phases: []
    };
    if (!st.scope.items) st.scope.items = {};
    var oldPhases = {};
    ((saved && saved.phases) || []).forEach(function (p) { oldPhases[p.id] = p; });
    def.phases.forEach(function (p) {
      var op = oldPhases[p.id], oldTasks = {};
      ((op && op.tasks) || []).forEach(function (t) { oldTasks[t.id] = t; });
      var tasks = p.tasks.map(function (t) {
        return { id: t.id, t: t.t, n: t.n || "", c: t.c ? 1 : 0, s: oldTasks[t.id] ? oldTasks[t.id].s : 0 };
      });
      ((op && op.tasks) || []).forEach(function (t) { if (t.u) tasks.push(t); }); // tasks added on the page
      var wk = (st.customSchedule && op && Array.isArray(op.weeks)) ? op.weeks : p.weeks;
      st.phases.push({ id: p.id, name: p.name, weeks: [wk[0], wk[1]], goal: p.goal, milestone: p.milestone, tasks: tasks });
    });
    SCOPE.forEach(function (c) { if (!Array.isArray(st.scope.items[c.k])) st.scope.items[c.k] = []; });
    return st;
  }

  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch (e) {}
  var state = merge(D, saved);

  var ui = { filter: "all", coreOnly: false, closed: {}, scopeClosed: false };
  try { var u = JSON.parse(localStorage.getItem(UI_KEY) || "null"); if (u) ui = Object.assign(ui, u); } catch (e) {}
  var saveMsg = "";

  // ---------- publishing ----------
  // Visitors read published.json from the live (main) branch. You edit in your browser as usual.
  // Publish commits your drafts to the plan-draft branch. Merge that into main to put it live.
  // Each publish is a commit, so Versions can restore any earlier one.
  var GH = { owner: "ni9thh", repo: "zombiesgame", file: "published.json", branch: "plan-draft", base: "main" };
  var TOKEN_KEY = "zombies-plan-gh-token";
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
  function isOwner() { return !!token(); }
  function gh(path, opts) {
    opts = opts || {};
    return fetch("https://api.github.com/repos/" + GH.owner + "/" + GH.repo + path, {
      method: opts.method || "GET",
      headers: { "Accept": "application/vnd.github+json", "Authorization": "Bearer " + token(), "Content-Type": "application/json" },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      if (r.status === 404) return { status: 404, data: null };
      if (!r.ok) throw new Error("GitHub returned " + r.status);
      return r.json().then(function (d) { return { status: r.status, data: d }; });
    });
  }
  function b64enc(s) { return btoa(unescape(encodeURIComponent(s))); }
  function b64dec(s) { return decodeURIComponent(escape(atob(s.replace(/\n/g, "")))); }
  function ensureBranch() {
    return gh("/git/ref/heads/" + GH.branch).then(function (r) {
      if (r.status !== 404) return;
      return gh("/git/ref/heads/" + GH.base).then(function (b) {
        return gh("/git/refs", { method: "POST", body: { ref: "refs/heads/" + GH.branch, sha: b.data.object.sha } });
      });
    });
  }
  function publishDrafts() {
    if (!isOwner()) return;
    var note = prompt("A short note for this version (optional):", "Update plan");
    if (note === null) return;
    setSave("Publishing…");
    var content = JSON.stringify({ version: new Date().toISOString(), note: note, pages: state.pages }, null, 2) + "\n";
    ensureBranch()
      .then(function () { return gh("/contents/" + GH.file + "?ref=" + GH.branch); })
      .then(function (cur) {
        return gh("/contents/" + GH.file, { method: "PUT", body: {
          message: "Publish plan: " + (note || "update"),
          content: b64enc(content),
          branch: GH.branch,
          sha: cur.data ? cur.data.sha : undefined
        } });
      })
      .then(function () { setSave("Published to the " + GH.branch + " branch. Merge it into main to make it live."); })
      .catch(function (e) { setSave("Publish failed: " + e.message); });
  }
  function restoreVersion() {
    if (!isOwner()) return;
    gh("/commits?sha=" + GH.branch + "&path=" + GH.file + "&per_page=20").then(function (r) {
      var list = r.data || [];
      if (!list.length) { setSave("No published versions yet"); return; }
      var lines = list.map(function (c, i) {
        return (i + 1) + ". " + c.commit.message.split("\n")[0] + " (" + c.commit.author.date.slice(0, 10) + ")";
      }).join("\n");
      var n = parseInt(prompt("Restore which version? Type its number. It loads into your drafts; Publish makes it live.\n\n" + lines, "1"), 10);
      if (!(n >= 1 && n <= list.length)) return;
      return gh("/contents/" + GH.file + "?ref=" + list[n - 1].sha).then(function (f) {
        var data = JSON.parse(b64dec(f.data.content));
        state.pages = data.pages || {};
        changed();
        setSave("Version " + n + " loaded into your drafts. Publish to make it live.");
      });
    }).catch(function (e) { setSave("Couldn't load versions: " + e.message); });
  }
  function setToken() {
    var t = prompt("Paste a GitHub fine-grained token that can edit the contents of ni9thh/zombiesgame. It is stored only in this browser.", "");
    if (t && t.trim()) { try { localStorage.setItem(TOKEN_KEY, t.trim()); } catch (e) {} render(); }
  }
  function forgetToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    render();
  }
  // Visitors see the published copy. The owner keeps working from their own drafts.
  function applyPublished(p) {
    if (!isOwner()) state.pages = (p && p.pages) || {};
    render();
  }
  function loadPublished() {
    return fetch(GH.file + "?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  // ---------- helpers ----------
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function addDays(iso, d) { var t = new Date(iso + "T12:00:00"); if (isNaN(t)) return null; t.setDate(t.getDate() + d); return t; }
  function fmt(d) { return d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""; }
  function counts(tasks) { var d = 0, p = 0; tasks.forEach(function (t) { if (t.s === 2) d++; else if (t.s === 1) p++; }); return { d: d, p: p, n: tasks.length }; }
  function saveUI() { try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (e) {} }
  function totalWeeks() { return Math.max.apply(null, state.phases.map(function (p) { return p.weeks[1]; }).concat([1])); }
  function clampInt(v, lo, hi) { v = Math.round(Number(v)); if (!isFinite(v)) return null; return Math.min(hi, Math.max(lo, v)); }
  function weeksLabel(n) { return n + (n === 1 ? " week" : " weeks"); }

  // ---------- schedule ----------
  // Change one phase. When "move later phases" is on, any phase that started after this one
  // used to end slides by the same amount, so the chain stays connected.
  function setPhaseWeeks(p, start, len) {
    var oldEnd = p.weeks[1];
    var newEnd = Math.min(MAX_WEEKS, start + len - 1);
    var delta = newEnd - oldEnd;
    if (ui.ripple !== false && delta) {
      state.phases.forEach(function (q) {
        if (q !== p && q.weeks[0] > oldEnd) {
          q.weeks = [clampInt(q.weeks[0] + delta, 1, MAX_WEEKS), clampInt(q.weeks[1] + delta, 1, MAX_WEEKS)];
        }
      });
    }
    p.weeks = [start, newEnd];
    state.customSchedule = 1;
  }
  // Stretch or squeeze every phase so the whole plan ends on week `target`.
  function fitTo(target) {
    var f = target / totalWeeks();
    state.phases.forEach(function (p) {
      var s = Math.max(1, Math.round((p.weeks[0] - 1) * f) + 1);
      var e = Math.max(s, Math.round(p.weeks[1] * f));
      p.weeks = [s, Math.min(e, MAX_WEEKS)];
    });
    state.customSchedule = 1;
  }

  function scheduleHTML() {
    var tw = totalWeeks();
    var h = '<details class="sched" id="schedule"' + (ui.schedOpen ? " open" : "") + '><summary><span class="eyebrow">Schedule</span>'
      + '<span class="sched-sum">' + weeksLabel(tw) + (state.customSchedule ? " · your schedule" : " · default") + '<span class="chev" aria-hidden="true">›</span></span></summary>'
      + '<div class="sched-body">'
      + '<div class="sched-fit"><label for="fit-weeks">Whole plan takes</label>'
      + '<input type="number" id="fit-weeks" min="' + state.phases.length + '" max="' + MAX_WEEKS + '" value="' + tw + '"> <span>weeks</span>'
      + '<button class="tool" data-fit="1">Fit phases to this</button>'
      + '<span class="sched-quick">'
      + [["0.5", "½×"], ["0.75", "¾×"], ["1.5", "1½×"], ["2", "2×"]].map(function (q) { return '<button class="tool" data-scale="' + q[0] + '" title="Make every phase ' + q[1] + ' as long">' + q[1] + "</button>"; }).join("")
      + "</span></div>"
      + '<div class="sched-table-wrap"><table class="sched-table"><thead><tr><th>Phase</th><th>Starts week</th><th>Lasts</th><th>Ends week</th><th>Dates</th></tr></thead><tbody>';
    state.phases.forEach(function (p, i) {
      var len = p.weeks[1] - p.weeks[0] + 1;
      var ps = addDays(state.startDate, (p.weeks[0] - 1) * 7), pe = addDays(state.startDate, p.weeks[1] * 7 - 1);
      h += "<tr><td>" + (i + 1) + ". " + esc(p.name) + "</td>"
        + '<td><input type="number" class="sched-in" id="sched-' + esc(p.id) + '-start" data-sched="' + esc(p.id) + ':start" min="1" max="' + MAX_WEEKS + '" value="' + p.weeks[0] + '" aria-label="' + esc(p.name) + ' starts week"></td>'
        + '<td><input type="number" class="sched-in" id="sched-' + esc(p.id) + '-len" data-sched="' + esc(p.id) + ':len" min="1" max="' + MAX_WEEKS + '" value="' + len + '" aria-label="' + esc(p.name) + ' length in weeks"> <span class="sched-unit">wk</span></td>'
        + '<td class="num">' + p.weeks[1] + "</td>"
        + '<td class="num">' + (ps ? fmt(ps) + " – " + fmt(pe) : "") + "</td></tr>";
    });
    h += "</tbody></table></div>"
      + '<div class="sched-foot"><label class="sched-check" for="ripple"><input type="checkbox" id="ripple"' + (ui.ripple !== false ? " checked" : "") + "> Move later phases when a phase gets longer or shorter</label>"
      + (state.customSchedule ? '<button class="tool" data-sched-reset="1">Back to default schedule</button>' : "") + "</div>"
      + "</div></details>";
    return h;
  }

  // ---------- scope sheet ----------
  function scopeHTML() {
    var locked = !!state.scope.locked, v1 = 0, later = 0;
    SCOPE.forEach(function (c) { state.scope.items[c.k].forEach(function (it) { if (it.later) later++; else v1++; }); });
    var h = '<li class="scope-li"><details class="scope" id="scope-sheet"' + (ui.scopeClosed ? "" : " open") + "><summary>"
      + '<span><span class="eyebrow">Scope sheet' + (locked ? " · Locked" : "") + '</span><h3>What\'s in v1<span class="chev" aria-hidden="true">›</span></h3></span>'
      + '<span class="sc-total">' + v1 + " in v1<br>" + later + " later</span></summary><div class=\"scope-body\">"
      + '<div class="scope-bar"><p>List everything your first release will have. Click a status to track building it. When the list feels right, lock it.</p>'
      + '<button class="lockbtn" data-lock="1" aria-pressed="' + locked + '">' + (locked ? "Unlock scope" : "Lock scope") + "</button></div>"
      + (locked ? '<p class="lock-note">Scope is locked. New entries go to Later. Unlock only if you\'re swapping something out, not adding.</p>' : "");
    SCOPE.forEach(function (c) {
      var items = state.scope.items[c.k];
      var now = items.filter(function (i) { return !i.later; }), lat = items.filter(function (i) { return i.later; });
      var built = now.filter(function (i) { return i.s === 2; }).length;
      h += '<div class="sc-cat"><div class="sc-cat-head"><b>' + esc(c.name) + "</b><span>" + now.length + " in v1"
        + (now.length ? " · " + built + " built" : "") + (lat.length ? " · " + lat.length + " later" : "") + "</span></div>";
      if (!items.length) h += '<div class="sc-empty">Nothing yet. Add your first ' + esc(c.one) + ".</div>";
      now.forEach(function (it) { h += rowHTML(c, it, locked); });
      if (lat.length) { h += '<div class="sc-sub">Later</div>'; lat.forEach(function (it) { h += rowHTML(c, it, locked); }); }
      h += '<button class="sc-add" data-sc-add="' + c.k + '">+ Add ' + esc(c.one) + (locked ? " to Later" : "") + "</button></div>";
    });
    return h + "</div></details></li>";
  }

  function rowHTML(c, it, locked) {
    var ref = c.k + ":" + it.id;
    var h = '<div class="sc-row' + (it.later ? " later" : "") + '"><button class="status s' + it.s + '" data-sc-status="' + ref
      + '" aria-label="Status: ' + STATUS[it.s] + '. Click to change.">' + STATUS[it.s] + '</button><div class="sc-fields">';
    c.f.forEach(function (f) {
      var val = (it.v && it.v[f[0]]) || "", id = "sc-" + it.id + "-" + f[0], style = "flex:" + f[3] + " 1 " + (f[3] * 56) + "px";
      if (Array.isArray(f[2])) {
        var opts = f[2].slice();
        if (val && opts.indexOf(val) < 0) opts.push(val); // keep a value even if its choice was removed from data.js
        h += '<select class="sc-in" id="' + id + '" data-sc="' + ref + ":" + f[0] + '" aria-label="' + esc(f[1]) + '" style="' + style + '"><option value="">' + esc(f[1]) + "…</option>"
          + opts.map(function (o) { return "<option" + (o === val ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>";
      } else {
        h += '<input type="text" class="sc-in" id="' + id + '" data-sc="' + ref + ":" + f[0] + '" value="' + esc(val) + '" placeholder="' + esc(f[2])
          + '" aria-label="' + esc(f[1]) + '" maxlength="300" style="' + style + '">';
      }
    });
    var blockMove = locked && it.later;
    return h + '</div><div class="sc-actions"><button class="sc-move" data-sc-move="' + ref + '"'
      + (blockMove ? ' disabled title="Unlock scope to move this into v1"' : "") + ">" + (it.later ? "Move to v1" : "Move to later") + "</button>"
      + '<button class="del" data-sc-del="' + ref + '" aria-label="Delete">×</button></div></div>';
  }

  function findItem(ref) {
    var a = ref.split(":"), list = state.scope.items[a[0]] || [];
    return { list: list, it: list.find(function (x) { return x.id === a[1]; }), field: a[2] };
  }
  function findTask(ref) {
    var a = ref.split(":"), p = state.phases.find(function (x) { return x.id === a[0]; });
    return { p: p, t: p && p.tasks.find(function (x) { return x.id === a[1]; }) };
  }

  // ---------- page ----------
  // ---------- task pages ----------
  // A task's page lives at index.html#task-<id>, so Back/Forward and bookmarks work.
  var TEMPLATES = window.PAGE_TEMPLATES || {};
  function routeTask() {
    var m = /^#task-(.+)$/.exec(location.hash || "");
    if (!m) return null;
    var id = decodeURIComponent(m[1]);
    for (var i = 0; i < state.phases.length; i++) {
      var p = state.phases[i], t = p.tasks.find(function (x) { return x.id === id; });
      if (t) return { p: p, t: t, i: i };
    }
    return null;
  }
  function pageData(id) {
    var pg = state.pages[id];
    if (!pg) pg = state.pages[id] = { sections: {}, custom: [] };
    if (!pg.sections) pg.sections = {};
    if (!pg.custom) pg.custom = [];
    return pg;
  }
  function templateFor(id) { return TEMPLATES[id] || TEMPLATES["default"] || { sections: [{ k: "notes", h: "Notes", hint: "" }] }; }
  function hasContent(id) {
    var pg = state.pages[id]; if (!pg) return false;
    var tpl = templateFor(id), any = false;
    tpl.sections.forEach(function (s) {
      var v = pg.sections && pg.sections[s.k];
      if (v != null && v.trim() && v !== (s.text || "")) any = true;
    });
    return any || (pg.custom || []).some(function (c) { return (c.text || "").trim() || (c.title || "").trim(); });
  }
  function sectionValue(pg, s) { return pg.sections[s.k] != null ? pg.sections[s.k] : (s.text || ""); }

  function renderTaskPage(r) {
    var p = r.p, t = r.t, tpl = templateFor(t.id), pg = state.pages[t.id] || { sections: {}, custom: [] };
    var RO = isOwner() ? "" : " readonly";
    if (!pg.sections) pg.sections = {};
    var idx = p.tasks.indexOf(t), prev = p.tasks[idx - 1], next = p.tasks[idx + 1];
    var h = '<div class="wrap page"><nav class="crumbs"><a class="back" href="#plan">← Back to plan</a>'
      + '<span class="save" id="save-status">' + esc(saveMsg || "Saves as you type") + "</span></nav>"
      + '<header class="pg-head"><div class="eyebrow">Phase ' + (r.i + 1) + " · " + esc(p.name) + " · Weeks " + p.weeks[0] + "–" + p.weeks[1] + "</div>"
      + "<h1>" + esc(t.t) + "</h1>"
      + (t.n ? '<p class="lede">' + esc(t.n) + "</p>" : "")
      + '<div class="pg-meta"><button class="status s' + t.s + '" data-task="' + esc(p.id + ":" + t.id) + '" aria-label="Status: ' + STATUS[t.s] + '. Click to change.">' + STATUS[t.s] + "</button>"
      + '<span class="tag' + (t.c ? " core" : "") + '">' + (t.c ? "Core" : "Nice to have") + "</span></div>"
      + (tpl.intro ? '<p class="pg-intro">' + esc(tpl.intro) + "</p>" : "")
      + "</header>";

    if (t.id === "a2") h += '<ul class="tasks pg-scope">' + scopeHTML() + "</ul>";

    h += '<div class="pg-sections">';
    tpl.sections.forEach(function (s) {
      var id = "pg-" + t.id + "-" + s.k;
      h += '<section class="pg-sec"><label for="' + esc(id) + '"><h2>' + esc(s.h) + "</h2></label>"
        + '<textarea class="pg-text" id="' + esc(id) + '" data-pg="' + esc(t.id) + ":" + esc(s.k) + '" placeholder="' + esc(s.hint || "") + '"' + RO + ' rows="3">' + esc(sectionValue(pg, s)) + "</textarea></section>";
    });
    (pg.custom || []).forEach(function (c) {
      h += '<section class="pg-sec custom"><div class="pg-sec-head"><input type="text" class="pg-title" id="pgt-' + esc(c.id) + '" data-pg-title="' + esc(t.id) + ":" + esc(c.id)
        + '" value="' + esc(c.title || "") + '"' + RO + ' placeholder="Section heading" aria-label="Section heading" maxlength="120">'
        + (isOwner() ? '<button class="del" data-pg-del="' + esc(t.id) + ":" + esc(c.id) + '" aria-label="Delete section">×</button>' : "") + "</div>"
        + '<textarea class="pg-text" id="pgc-' + esc(c.id) + '" data-pg-custom="' + esc(t.id) + ":" + esc(c.id) + '" placeholder="Write here…"' + RO + ' rows="3">' + esc(c.text || "") + "</textarea></section>";
    });
    h += (isOwner() ? '<button class="sc-add" data-pg-add="' + esc(t.id) + '">+ Add section</button>' : "") + "</div>";

    h += '<nav class="pg-nav">'
      + (prev ? '<a href="#task-' + encodeURIComponent(prev.id) + '"><span class="eyebrow">Previous</span>' + esc(prev.t) + "</a>" : "<span></span>")
      + (next ? '<a class="next" href="#task-' + encodeURIComponent(next.id) + '"><span class="eyebrow">Next</span>' + esc(next.t) + "</a>" : "<span></span>")
      + "</nav></div>";

    document.title = t.t + " · " + (D.title || "Zombies Dev Plan");
    var focusId = document.activeElement && document.activeElement.id;
    document.getElementById("app").innerHTML = h;
    Array.prototype.forEach.call(document.querySelectorAll(".pg-text"), autoGrow);
    if (focusId) { var f = document.getElementById(focusId); if (f) f.focus(); }
  }
  function autoGrow(el) { el.style.height = "auto"; el.style.height = (el.scrollHeight + 2) + "px"; }

  var typeTimer = null;
  function savedSoon() {
    setSave("Saving…");
    clearTimeout(typeTimer);
    typeTimer = setTimeout(function () { changed(true); }, 400);
  }

  function render() {
    var r = routeTask();
    if (r) { ui.lastTask = r.t.id; return renderTaskPage(r); }
    document.title = D.title || "Zombies Dev Plan";
    TOTAL_WEEKS = totalWeeks();
    var all = [].concat.apply([], state.phases.map(function (p) { return p.tasks; }));
    var tc = counts(all), n = Math.max(tc.n, 1);
    var cur = state.phases.find(function (p) { return p.tasks.some(function (t) { return t.s !== 2; }); });
    var curIdx = cur ? state.phases.indexOf(cur) : -1;
    var today = new Date(); today.setHours(12, 0, 0, 0);
    var start = addDays(state.startDate, 0);
    var weekNow = start ? Math.floor((today - start) / 864e5 / 7) + 1 : null;
    var end = addDays(state.startDate, TOTAL_WEEKS * 7 - 1);

    var h = '<div class="wrap"><header class="top"><div><div class="eyebrow">' + esc(D.subtitle || "") + "</div>"
      + "<h1>" + esc(D.title || "Zombies Dev Plan") + "</h1>"
      + '<p class="lede">The phases in the order they should happen. Click a task\'s status to move it from To do → Doing → Done. The default weeks assume a solo dev or small team at roughly 15 to 20 hours a week. Open Schedule below the timeline to set your own.</p></div>'
      + '<div class="stats">'
      + '<div class="stat red"><b>' + Math.round(tc.d / n * 100) + "%</b><span>Complete</span></div>"
      + '<div class="stat"><b>' + tc.d + "/" + tc.n + "</b><span>Tasks done</span></div>"
      + '<div class="stat"><b>' + tc.p + "</b><span>In progress</span></div>"
      + '<div class="stat"><b>' + (cur ? curIdx + 1 : "✓") + "</b><span>" + (cur ? "Phase: " + esc(cur.name) : "All phases done") + "</span></div>"
      + '<div class="stat"><b>' + (weekNow == null ? "–" : weekNow < 1 ? "0" : Math.min(weekNow, TOTAL_WEEKS)) + "</b><span>Week of " + TOTAL_WEEKS + "</span></div>"
      + "</div>"
      + '<div class="bar" aria-hidden="true"><i class="d" style="width:' + (tc.d / n * 100) + '%"></i><i class="p" style="width:' + (tc.p / n * 100) + '%"></i></div>'
      + '<div class="controls"><div class="chips" role="group" aria-label="Filter tasks">'
      + [["all", "All"], ["0", "To do"], ["1", "Doing"], ["2", "Done"]].map(function (f) {
          return '<button class="chip" data-filter="' + f[0] + '" aria-pressed="' + (ui.filter === f[0]) + '">' + f[1] + "</button>";
        }).join("")
      + '<button class="chip" data-core="1" aria-pressed="' + ui.coreOnly + '">Core only</button></div>'
      + '<label class="start" for="start-date">Start date <input id="start-date" type="date" value="' + esc(state.startDate || "") + '"></label>'
      + '<div class="tools"><button class="tool" data-export="1" title="Save a .json copy of your progress">Back up</button>'
      + '<button class="tool" data-import="1" title="Load a .json backup">Restore</button>'
      + '<button class="tool" data-reset="1" title="Clear all progress in this browser">Reset</button>'
      + (isOwner()
          ? '<button class="tool" data-publish="1" title="Commit your drafts to the plan-draft branch">Publish</button>'
            + '<button class="tool" data-versions="1" title="Load an earlier published version into your drafts">Versions</button>'
            + '<button class="tool" data-forget="1" title="Remove the saved GitHub token from this browser">Forget token</button>'
          : '<button class="tool" data-owner="1" title="Enter the GitHub token to publish changes">Owner sign-in</button>')
      + "</div>"
      + '<span class="save" id="save-status">' + esc(saveMsg || "Progress saves in this browser") + "</span></div></header>";

    // timeline
    var mid = function (f) { return Math.round(TOTAL_WEEKS * f); };
    h += '<section aria-label="Timeline"><div class="eyebrow" style="margin-bottom:8px">Timeline · ' + fmt(start) + " to " + fmt(end) + '</div><div class="tl"><div class="tl-inner">';
    state.phases.forEach(function (p, i) {
      var c = counts(p.tasks);
      var left = (p.weeks[0] - 1) / TOTAL_WEEKS * 100, width = (p.weeks[1] - p.weeks[0] + 1) / TOTAL_WEEKS * 100;
      h += '<div class="tl-name">' + (i + 1) + ". " + esc(p.name) + '</div><div class="tl-track" style="--wk:' + TOTAL_WEEKS + '"><div class="tl-bar' + (i === curIdx ? " cur" : "")
        + '" style="left:' + left + "%;width:" + width + '%" title="Weeks ' + p.weeks[0] + "–" + p.weeks[1] + '"><i style="width:' + (c.d / Math.max(c.n, 1) * 100) + '%"></i></div>'
        + (weekNow && weekNow >= 1 && weekNow <= TOTAL_WEEKS ? '<div class="tl-today" style="left:' + ((weekNow - 0.5) / TOTAL_WEEKS * 100) + '%"></div>' : "") + "</div>";
    });
    h += '<div class="tl-axis"><span>Wk 1</span><span>Wk ' + mid(.25) + "</span><span>Wk " + mid(.5) + "</span><span>Wk " + mid(.75) + "</span><span>Wk " + TOTAL_WEEKS + "</span></div></div></div>" + scheduleHTML() + "</section>";

    // phases
    var scopeShown = false;
    state.phases.forEach(function (p, i) {
      var c = counts(p.tasks);
      var ps = addDays(state.startDate, (p.weeks[0] - 1) * 7), pe = addDays(state.startDate, p.weeks[1] * 7 - 1);
      var shown = p.tasks.filter(function (t) { return (ui.filter === "all" || String(t.s) === ui.filter) && (!ui.coreOnly || t.c); });
      h += '<details class="phase" data-phase="' + esc(p.id) + '"' + (ui.closed[p.id] ? "" : " open") + "><summary>"
        + '<span class="rnd" aria-hidden="true">' + (i + 1) + "</span>"
        + '<span class="ph-head"><span class="ph-meta">Weeks ' + p.weeks[0] + "–" + p.weeks[1] + (ps ? " · " + fmt(ps) + " to " + fmt(pe) : "") + "</span><h2>" + esc(p.name)
        + '<span class="chev" aria-hidden="true">›</span></h2></span>'
        + '<span class="ph-count' + (c.d === c.n && c.n ? " full" : "") + '">' + c.d + "/" + c.n + "</span></summary>"
        + '<div class="ph-body"><p class="goal">' + esc(p.goal || "") + '</p><div class="ms"><b>Milestone</b>' + esc(p.milestone || "") + '</div><ul class="tasks">';
      shown.forEach(function (t) {
        var ref = esc(p.id + ":" + t.id);
        h += '<li class="task' + (t.s === 2 ? " done" : "") + '" id="row-' + esc(t.id) + '"><button class="status s' + t.s + '" data-task="' + ref + '" aria-label="Status: ' + STATUS[t.s] + '. Click to change.">' + STATUS[t.s] + "</button>"
          + '<div class="t-text"><div class="t-title">' + esc(t.t) + "</div>" + (t.n ? '<div class="t-note">' + esc(t.n) + "</div>" : "") + "</div>"
          + '<div class="tag' + (t.c ? " core" : "") + '">' + (t.c ? "Core" : "Nice to have")
          + '<a class="pg-link' + (hasContent(t.id) ? " has" : "") + '" href="#task-' + encodeURIComponent(t.id) + '" title="Open this task\'s page">Page →</a>'
          + (t.u ? '<button class="del" data-del="' + ref + '" aria-label="Delete task">×</button>' : "") + "</div></li>";
        if (t.id === "a2") { h += scopeHTML(); scopeShown = true; }
      });
      if (!shown.length) h += '<li class="empty">No tasks match this filter.</li>';
      if (i === 0 && !scopeShown) h += scopeHTML();
      h += '</ul><form class="add" data-add="' + esc(p.id) + '"><input type="text" id="add-' + esc(p.id) + '" placeholder="Add a task to ' + esc(p.name) + '…" aria-label="New task for ' + esc(p.name) + '" maxlength="200">'
        + '<select id="add-type-' + esc(p.id) + '" aria-label="Priority"><option value="1">Core</option><option value="0">Nice to have</option></select><button type="submit">Add</button></form></div></details>';
    });

    if (D.rules && D.rules.length) {
      h += '<section class="rules"><h2 style="font-size:22px">Rules that keep it on track</h2><ol>'
        + D.rules.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ol></section>";
    }
    h += "</div>";

    var focusId = document.activeElement && document.activeElement.id;
    document.getElementById("app").innerHTML = h;
    if (focusId) { var f = document.getElementById(focusId); if (f) f.focus(); }
  }

  // ---------- saving ----------
  function setSave(msg) { saveMsg = msg; var el = document.getElementById("save-status"); if (el) el.textContent = msg; }
  function changed(skipRender) {
    var ok = true;
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { ok = false; }
    if (!skipRender) render();
    setSave(ok ? "Saved " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Couldn't save. Use Back up to keep a copy.");
  }
  function commitField(el) {
    if (!el || !el.dataset || !el.dataset.sc) return false;
    var r = findItem(el.dataset.sc); if (!r.it) return false;
    r.it.v = r.it.v || {};
    if ((r.it.v[r.field] || "") === el.value) return false;
    r.it.v[r.field] = el.value; return true;
  }

  function exportData() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "zombies-plan-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    setSave("Backup downloaded");
  }
  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.phases)) throw new Error("not a plan backup");
        state = merge(D, data);
        changed();
        setSave("Backup restored");
      } catch (e) { setSave("That file isn't a plan backup"); }
    };
    reader.readAsText(file);
  }

  // ---------- events ----------
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var ds = b.dataset, r;
    if (ds.task) { r = findTask(ds.task); if (r.t) { r.t.s = (r.t.s + 1) % 3; changed(); } }
    else if (ds.del) { r = findTask(ds.del); if (r.p) { r.p.tasks = r.p.tasks.filter(function (t) { return t !== r.t; }); changed(); } }
    else if (ds.filter) { ui.filter = ds.filter; saveUI(); render(); }
    else if (ds.core) { ui.coreOnly = !ui.coreOnly; saveUI(); render(); }
    else if (ds.lock) { state.scope.locked = state.scope.locked ? 0 : 1; changed(); }
    else if (ds.scStatus) { r = findItem(ds.scStatus); if (r.it) { r.it.s = (r.it.s + 1) % 3; changed(); } }
    else if (ds.scMove) { r = findItem(ds.scMove); if (r.it && !(state.scope.locked && r.it.later)) { r.it.later = r.it.later ? 0 : 1; changed(); } }
    else if (ds.scDel) { r = findItem(ds.scDel); if (r.it) { r.list.splice(r.list.indexOf(r.it), 1); changed(); } }
    else if (ds.scAdd) {
      var list = state.scope.items[ds.scAdd]; if (!list) return;
      var nid = "s" + Date.now().toString(36);
      list.push({ id: nid, v: {}, s: 0, later: state.scope.locked ? 1 : 0 });
      changed();
      var nf = document.getElementById("sc-" + nid + "-name"); if (nf) nf.focus();
    }
    else if (ds.fit) {
      var target = clampInt(document.getElementById("fit-weeks").value, state.phases.length, MAX_WEEKS);
      if (target) { fitTo(target); changed(); }
    }
    else if (ds.scale) {
      var t2 = clampInt(totalWeeks() * Number(ds.scale), state.phases.length, MAX_WEEKS);
      fitTo(t2); changed();
    }
    else if (ds.schedReset) {
      var defs = {}; D.phases.forEach(function (p) { defs[p.id] = p.weeks; });
      state.phases.forEach(function (p) { if (defs[p.id]) p.weeks = [defs[p.id][0], defs[p.id][1]]; });
      state.customSchedule = 0; changed();
    }
    else if (ds.pgAdd) {
      var pgA = pageData(ds.pgAdd), cid = "c" + Date.now().toString(36);
      pgA.custom.push({ id: cid, title: "", text: "" });
      changed();
      var ti = document.getElementById("pgt-" + cid); if (ti) ti.focus();
    }
    else if (ds.pgDel) {
      var pd = ds.pgDel.split(":"), pgD = pageData(pd[0]);
      pgD.custom = pgD.custom.filter(function (c) { return c.id !== pd[1]; });
      changed();
    }
    else if (ds.export) { exportData(); }
    else if (ds.publish) { publishDrafts(); }
    else if (ds.versions) { restoreVersion(); }
    else if (ds.forget) { forgetToken(); }
    else if (ds.owner) { setToken(); }
    else if (ds.import) { document.getElementById("import-file").click(); }
    else if (ds.reset) {
      if (confirm("Clear all progress, added tasks and the scope sheet in this browser? Back up first if you might want it.")) {
        try { localStorage.removeItem(LS_KEY); } catch (err) {}
        state = merge(D, null); render(); setSave("Progress cleared");
      }
    }
  });

  document.addEventListener("change", function (e) {
    var el = e.target;
    if (el.id === "start-date" && el.value) { state.startDate = el.value; changed(); return; }
    if (el.id === "import-file") { if (el.files[0]) importData(el.files[0]); el.value = ""; return; }
    if (el.id === "ripple") { ui.ripple = el.checked; saveUI(); return; }
    if (el.dataset && el.dataset.sched) {
      var a = el.dataset.sched.split(":");
      var p = state.phases.find(function (x) { return x.id === a[0]; }); if (!p) return;
      var v = clampInt(el.value, 1, MAX_WEEKS);
      if (v == null) { render(); return; }
      var len = p.weeks[1] - p.weeks[0] + 1;
      if (a[1] === "start") setPhaseWeeks(p, v, len); else setPhaseWeeks(p, p.weeks[0], v);
      changed();
      return;
    }
    if (el.dataset && el.dataset.sc) { if (commitField(el)) changed(true); } // no redraw, so a click elsewhere still lands
  });

  document.addEventListener("keydown", function (e) {
    var el = e.target;
    if (e.key === "Enter" && el.classList && el.classList.contains("sc-in") && el.tagName === "INPUT") { e.preventDefault(); el.blur(); }
    if (e.key === "Enter" && el.classList && el.classList.contains("sched-in")) { e.preventDefault(); el.blur(); }
    if (e.key === "Enter" && el.id === "fit-weeks") { e.preventDefault(); var fb = document.querySelector("[data-fit]"); if (fb) fb.click(); }
  });

  document.addEventListener("submit", function (e) {
    var f = e.target; if (!f.dataset.add) return; e.preventDefault();
    var p = state.phases.find(function (x) { return x.id === f.dataset.add; });
    var input = f.querySelector("input"), sel = f.querySelector("select");
    var txt = input.value.trim(); if (!txt || !p) return;
    p.tasks.push({ id: "u" + Date.now().toString(36), t: txt, n: "", c: Number(sel.value), s: 0, u: 1 });
    changed();
    var again = document.getElementById("add-" + p.id); if (again) again.focus();
  });

  document.addEventListener("toggle", function (e) {
    var d = e.target;
    if (d.id === "scope-sheet") { ui.scopeClosed = !d.open; saveUI(); return; }
    if (d.id === "schedule") { ui.schedOpen = d.open; saveUI(); return; }
    if (!d.dataset || !d.dataset.phase) return;
    if (d.open) delete ui.closed[d.dataset.phase]; else ui.closed[d.dataset.phase] = 1;
    saveUI();
  }, true);

  // Page text saves as you type (no redraw, so the cursor stays put).
  document.addEventListener("input", function (e) {
    var el = e.target, ds = el.dataset || {}, a;
    if (ds.pg) { a = ds.pg.split(":"); pageData(a[0]).sections[a[1]] = el.value; autoGrow(el); savedSoon(); }
    else if (ds.pgCustom || ds.pgTitle) {
      a = (ds.pgCustom || ds.pgTitle).split(":");
      var c = pageData(a[0]).custom.find(function (x) { return x.id === a[1]; }); if (!c) return;
      if (ds.pgCustom) { c.text = el.value; autoGrow(el); } else c.title = el.value;
      savedSoon();
    }
  });

  // Moving between the plan and task pages.
  window.addEventListener("hashchange", function () {
    var onPage = !!routeTask();
    render();
    if (onPage) { window.scrollTo(0, 0); return; }
    var row = ui.lastTask && document.getElementById("row-" + ui.lastTask);
    if (row) row.scrollIntoView({ block: "center" });
  });
  window.addEventListener("resize", function () { Array.prototype.forEach.call(document.querySelectorAll(".pg-text"), autoGrow); });

  // Save a half-typed scope field if the tab is closed or hidden.
  window.addEventListener("pagehide", function () { if (commitField(document.activeElement)) changed(true); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden" && commitField(document.activeElement)) changed(true); });

  render();
  loadPublished().then(applyPublished);
})();

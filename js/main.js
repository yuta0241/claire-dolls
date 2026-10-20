const esc = s => (s == null ? "" : String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//.test(u||"") ? u : "";
const fmt = d => d.replaceAll("-", ".");

document.getElementById("news-list").innerHTML = NEWS.length
  ? NEWS.map(n => `<li><time>${fmt(n.date)}</time><span class="badge ${n.sample?'sample':''}">${esc(n.type)}</span><span class="body">${esc(n.text)}</span></li>`).join("")
  : `<li class="empty">お知らせはまだありません</li>`;

/* ---------- スケジュール表示 ---------- */
const WD = ["日","月","火","水","木","金","土"];
const todayJST = () => new Date(Date.now() + 9*3600*1000).toISOString().slice(0,10);
const utcOf = d => { const [y,m,dd] = d.split("-").map(Number); return Date.UTC(y, m-1, dd); };
const wdOf = d => new Date(utcOf(d)).getUTCDay();
const daysTo = d => Math.round((utcOf(d) - utcOf(todayJST())) / 86400000);
const hm = t => { const m = (t||"").match(/(\d{1,2}):(\d{2})/); return m ? (+m[1])*60 + (+m[2]) : null; };
const splitRange = r => { const p = (r||"").replace(/[~〜～－–]/g,"-").split("-").map(x => x.trim()); return [p[0]||"", p[1]||""]; };
const rangeText = r => { const [a,b] = splitRange(r); return a ? (b ? `${a}〜${b}` : a) : ""; };
const partStart = e => (e.parts && e.parts[0]) ? splitRange(e.parts[0].time)[0] : "";
const sortKey = e => e.date + String(hm(splitRange(e.live)[0]) ?? hm(e.start) ?? hm(e.open) ?? hm(partStart(e)) ?? 0).padStart(4,"0");

function priceChips(str){
  return (str||"").split("/").map(t => t.trim()).filter(Boolean).map(t => {
    const m = t.match(/^(.*?)([+＋]?[\d,]+円)$/);
    if (!m) return `<span class="chip"><b>${esc(t)}</b></span>`;
    const amt = m[2].replace("＋","+").replace(/[\d,]+/, n => Number(n.replace(/,/g,"")).toLocaleString("ja-JP"));
    return `<span class="chip">${m[1] ? `<i>${esc(m[1])}</i>` : ""}<b>${esc(amt)}</b></span>`;
  }).join("");
}
function gcalUrl(e){
  const pad = n => String(n).padStart(2,"0");
  const stamp = min => { min = Math.min(min, 24*60-1); return `${e.date.replaceAll("-","")}T${pad(Math.floor(min/60))}${pad(min%60)}00`; };
  const [l1,l2] = splitRange(e.live), [m1,m2] = splitRange(e.meet);
  const pe = (e.parts && e.parts.length) ? hm(splitRange(e.parts.at(-1).time)[1]) : null;
  const s0 = hm(l1) ?? hm(e.start) ?? hm(e.open) ?? hm(partStart(e)) ?? 12*60;
  let t0 = pe ?? hm(m2) ?? hm(l2) ?? s0 + 120; if (t0 <= s0) t0 = s0 + 120;
  const details = [e.perk && `特典：${e.perk}`, e.price && `チケット：${e.price}`, e.ticket].filter(Boolean).join("\n");
  const q = new URLSearchParams({action:"TEMPLATE", text:`Claire♡Dolls ${e.name}`, dates:`${stamp(s0)}/${stamp(t0)}`, ctz:"Asia/Tokyo", location:[e.venue, e.address].filter(Boolean).join(" "), details});
  return "https://calendar.google.com/calendar/render?" + q.toString();
}
function mapUrl(e){ return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([e.venue, e.address].filter(Boolean).join(" ")); }

const schState = {month:null, showPast:false, majorOnly:false, open:new Set(), view:"cal", sel:null};

const KIND = {live:"", cheki:"チェキ会", event:"イベント"};
const memberOf = n => MEMBERS.find(m => m.name.replace(/\s/g,"") === (n||"").replace(/\s/g,""));
function memberChips(list){
  if (!list || !list.length) return "";
  return `<div class="mem-row"><span class="mem-label">出演</span>${list.map(n => {
    const m = memberOf(n), short = (n.split(/\s+/)[1] || n);
    return `<span class="mem-chip" style="--mc:${m ? m.color : "#a4a8d6"}"><i></i>${esc(short)}</span>`;
  }).join("")}${list.length < 5 ? `<span class="mem-only">のみ</span>` : ""}</div>`;
}
const X_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>';
const postUrl = v => { v = (v||"").trim(); if (!v) return ""; if (/^https?:\/\//.test(v)) return v; return /^\d+$/.test(v) ? `https://x.com/ClaireDolls2024/status/${v}` : ""; };
const postLink = e => { const u = postUrl(e.post); return u ? `<a class="ev-post" href="${esc(u)}" target="_blank" rel="noopener" aria-label="告知ポストをXで見る" title="告知ポストをXで見る">${X_ICON}<span>告知</span></a>` : ""; };
function evCard(e, id, isNext){
  const kind = e.kind || "live";
  const slots = (e.parts && e.parts.length)
    ? e.parts.map(p => `<span class="slot part"><b>${esc(p.label)}</b>${esc(rangeText(p.time))}${p.note ? `<em>${esc(p.note)}</em>` : ""}</span>`).join("")
    : (e.live || e.meet)
    ? (e.live ? `<span class="slot live"><b>LIVE</b>${esc(rangeText(e.live))}</span>` : "") + (e.meet ? `<span class="slot meet"><b>特典会</b>${esc(rangeText(e.meet))}</span>` : "")
    : (kind === "live" ? `<span class="slot tbd">出演時間は後日発表</span>` : "");
  const open = schState.open.has(id);
  const ticket = safeUrl(e.ticket)
    ? `<a class="ev-ticket" href="${esc(e.ticket)}" target="_blank" rel="noopener">${kind === "live" ? "チケット" : "詳細・申込"} ↗</a>`
    : (kind === "live" && e.date >= todayJST() ? `<span class="ev-ticket off">チケット情報は後日</span>` : "");
  const row = (dt, dd) => dd ? `<dt>${dt}</dt><dd>${dd}</dd>` : "";
  const detail = `
    <dl>
      ${row("開場・開演", (e.open || e.start) ? `開場 ${esc(e.open||"-")} ／ 開演 ${esc(e.start||"-")}` : "")}
      ${row(kind === "live" ? "チケット代" : "参加費", priceChips(e.price))}
      ${row("出演", e.members && e.members.length ? esc(e.members.map(n => n.replace(/\s/g,"")).join("、")) + (e.members.length < 5 ? "（指定メンバーのみ）" : "") : "")}
      ${row("特典", esc(e.perk))}
      ${row("会場", e.venue ? `${esc(e.venue)}${e.address ? `<br><small>${esc(e.address)}</small>` : ""}` : "")}
      ${row("メモ", esc(e.note))}
      ${row("タグ", esc(e.tag))}
    </dl>
    <div class="ev-links">
      <a class="mini" href="${esc(gcalUrl(e))}" target="_blank" rel="noopener">Googleカレンダーに追加</a>
      ${e.venue ? `<a class="mini" href="${esc(mapUrl(e))}" target="_blank" rel="noopener">地図を開く</a>` : ""}
    </div>`;
  return `
  <article class="ev${isNext ? " next" : ""}${e.major ? " major" : ""} k-${kind}">
    ${e.major ? `<span class="ev-major">★ 重要LIVE</span>` : ""}
    ${isNext ? `<span class="ev-next">NEXT${daysTo(e.date) > 1 ? ` ・ あと${daysTo(e.date)}日` : ""}</span>` : ""}
    <div class="ev-meta">${KIND[kind] ? `<span class="kind-badge ${kind}">${KIND[kind]}</span>` : ""}${e.start ? `<span class="ev-start">開演 ${esc(e.start)}</span>` : ""}${e.venue ? `<span>${esc(e.venue)}</span>` : ""}</div>
    <h4 class="ev-name">${esc(e.name)}</h4>
    ${memberChips(e.members)}
    ${slots ? `<div class="slots">${slots}</div>` : ""}
    ${e.note ? `<p class="ev-note">${esc(e.note)}</p>` : ""}
    <div class="ev-actions">
      ${ticket}
      ${postLink(e)}
      <button type="button" class="ev-more" data-id="${id}" aria-expanded="${open}" aria-controls="d-${id}">詳細</button>
    </div>
    <div class="ev-detail" id="d-${id}" ${open ? "" : "hidden"}>${detail}</div>
  </article>`;
}

const viewToggle = () => `<div class="view-toggle" role="group" aria-label="表示の切り替え"><button type="button" data-view="cal" aria-pressed="${schState.view==="cal"}">カレンダー</button><button type="button" data-view="list" aria-pressed="${schState.view==="list"}">リスト</button></div>`;
const monthTabs = (months, mLabel) => `<div class="tabs" role="group" aria-label="月を選ぶ">${months.map(m => `<button type="button" class="tab" data-m="${m}" aria-pressed="${m === schState.month}">${mLabel(m)}</button>`).join("")}</div>`;

function renderCal(all, inMonth, months, mLabel, nextEv, today){
  const byDate = {};
  inMonth.forEach(e => (byDate[e.date] = byDate[e.date] || []).push(e));
  const dates = Object.keys(byDate);
  if (!schState.sel || !byDate[schState.sel]) {
    schState.sel = byDate[today] ? today : (dates.find(d => d >= today) || dates[0] || null);
  }
  document.getElementById("sch-tools").innerHTML = monthTabs(months, mLabel) + `<div class="tools-right">${viewToggle()}</div>`;
  const [y, m] = schState.month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m-1, 1)).getUTCDay();
  const len = new Date(Date.UTC(y, m, 0)).getUTCDate();
  let cells = "";
  for (let i = 0; i < first; i++) cells += `<span class="cal-day blank"></span>`;
  for (let d = 1; d <= len; d++) {
    const ds = `${schState.month}-${String(d).padStart(2,"0")}`, evs = byDate[ds] || [], wd = (first + d - 1) % 7;
    const cls = ["cal-day", wd===6?"sat":wd===0?"sun":"", evs.length?"has":"none", ds<today?"past":"", ds===today?"today":"", ds===schState.sel?"sel":""].filter(Boolean).join(" ");
    const marks = evs.length ? `<span class="cal-marks" aria-hidden="true">${evs.map(e => e.major ? "<b>★</b>" : `<i class="k-${e.kind||"live"}"></i>`).join("")}</span>` : `<span class="cal-marks"></span>`;
    const label = `${m}月${d}日 ${evs.length ? `予定${evs.length}件${evs.some(e=>e.major)?"（重要LIVEあり）":""}` : "予定なし"}`;
    cells += evs.length
      ? `<button type="button" class="${cls}" data-day="${ds}" aria-pressed="${ds===schState.sel}" aria-label="${label}"><span class="n">${d}</span>${marks}</button>`
      : `<span class="${cls}"><span class="n">${d}</span>${marks}</span>`;
  }
  const head = ["日","月","火","水","木","金","土"].map((w,i) => `<span class="${i===0?"sun":i===6?"sat":""}">${w}</span>`).join("");
  const cal = `<div class="cal"><div class="cal-wd">${head}</div><div class="cal-grid">${cells}</div>
    <p class="cal-legend"><span><i></i>ライブ</span><span><i class="k-cheki"></i>チェキ会</span><span><i class="k-event"></i>イベント</span><span><b>★</b>重要LIVE</span></p></div>`;
  let detail;
  if (!dates.length) detail = `<p class="sch-empty">この月の予定はまだありません</p>`;
  else {
    const items = byDate[schState.sel], wd = wdOf(schState.sel), [, mm, dd] = schState.sel.split("-");
    detail = `<div class="day${schState.sel < today ? " past" : ""}">
      <div class="day-head"><span class="day-date">${+mm}.${dd}</span><span class="day-wd${wd===6?" sat":wd===0?" sun":""}">${WD[wd]}</span>
      ${items.length > 1 ? `<span class="day-n">この日は${items.length}本</span>` : ""}</div>
      <div class="day-events">${items.map(e => evCard(e, e._id, nextEv && e._id === nextEv._id)).join("")}</div></div>`;
  }
  document.getElementById("sch-list").innerHTML = cal + (dates.length ? `<p class="cal-hint">印のある日をタップすると、その日の予定が下に表示されます</p>` : "") + detail;
}

function renderSchedule(){
  const today = todayJST();
  const all = SCHEDULE.map((e,i) => ({...e, _id:"e"+i})).sort((a,b) => sortKey(a).localeCompare(sortKey(b)));
  const nextEv = all.find(e => e.date >= today);
  const months = [...new Set(all.map(e => e.date.slice(0,7)))];
  if (!schState.month) schState.month = (nextEv ? nextEv.date : (all.at(-1)||{date:today}).date).slice(0,7);
  const years = new Set(months.map(m => m.slice(0,4)));
  const mLabel = m => years.size > 1 ? `${m.slice(0,4)}.${m.slice(5)}` : `${+m.slice(5)}月`;

  const inMonth = all.filter(e => e.date.startsWith(schState.month));
  if (schState.view === "cal") return renderCal(all, inMonth, months, mLabel, nextEv, today);
  const pastN = inMonth.filter(e => e.date < today).length;
  const hasMajor = inMonth.some(e => e.major);
  const shown = inMonth.filter(e => (schState.showPast || e.date >= today) && (!schState.majorOnly || e.major));

  document.getElementById("sch-tools").innerHTML =
    `<div class="tabs" role="group" aria-label="月を選ぶ">${months.map(m => `<button type="button" class="tab" data-m="${m}" aria-pressed="${m === schState.month}">${mLabel(m)}</button>`).join("")}</div>` +
    `<div class="tools-right">` + viewToggle() +
      (hasMajor ? `<button type="button" class="major-toggle" data-major="1" aria-pressed="${schState.majorOnly}">★ 重要LIVEだけ</button>` : "") +
      (pastN ? `<button type="button" class="past-toggle" data-past="1">${schState.showPast ? "過去のライブを隠す" : `過去のライブ ${pastN}件を表示`}</button>` : "") +
    `</div>`;

  if (!shown.length) {
    document.getElementById("sch-list").innerHTML = `<p class="sch-empty">${schState.majorOnly ? "この月の重要LIVEはありません" : inMonth.length ? "この月の残りの予定はありません" : "この月の予定はまだありません"}</p>`;
    return;
  }
  const groups = [];
  shown.forEach(e => { const g = groups.at(-1); if (g && g.date === e.date) g.items.push(e); else groups.push({date:e.date, items:[e]}); });
  document.getElementById("sch-list").innerHTML = groups.map(g => {
    const wd = wdOf(g.date), [, mm, dd] = g.date.split("-");
    const flag = g.date === today ? `<span class="day-flag">TODAY</span>` : (daysTo(g.date) === 1 ? `<span class="day-flag">明日</span>` : "");
    return `<div class="day${g.date < today ? " past" : ""}">
      <div class="day-head">
        <span class="day-date">${+mm}.${dd}</span>
        <span class="day-wd${wd === 6 ? " sat" : wd === 0 ? " sun" : ""}">${WD[wd]}</span>${flag}
        ${g.items.length > 1 ? `<span class="day-n">この日は${g.items.length}本</span>` : ""}
      </div>
      <div class="day-events">${g.items.map(e => evCard(e, e._id, nextEv && e._id === nextEv._id)).join("")}</div>
    </div>`;
  }).join("");
}
document.getElementById("schedule").addEventListener("click", ev => {
  const t = ev.target.closest("button"); if (!t) return;
  if (t.dataset.view) { schState.view = t.dataset.view; renderSchedule(); }
  else if (t.dataset.day) { schState.sel = t.dataset.day; renderSchedule(); }
  else if (t.dataset.m) { schState.month = t.dataset.m; schState.showPast = false; schState.sel = null; renderSchedule(); }
  else if (t.dataset.major) { schState.majorOnly = !schState.majorOnly; renderSchedule(); }
  else if (t.dataset.past) { schState.showPast = !schState.showPast; renderSchedule(); }
  else if (t.classList.contains("ev-more")) {
    const id = t.dataset.id, box = document.getElementById("d-" + id), open = box.hidden;
    box.hidden = !open; t.setAttribute("aria-expanded", open);
    open ? schState.open.add(id) : schState.open.delete(id);
  }
});
renderSchedule();

document.getElementById("member-list").innerHTML = MEMBERS.map((m,i) => `
  <button type="button" class="member" data-i="${i}" style="--mc:${m.color}" aria-haspopup="dialog" aria-label="${esc(m.name)}のプロフィールを見る">
    <span class="photo">${m.photo?`<img src="${m.photo}" alt="" loading="lazy" width="720" height="960">`:`<svg class="ico" aria-hidden="true"><use href="#bow"/></svg>`}</span>
    <span class="info">
      <span class="name">${esc(m.name)}</span>
      <span class="read">${esc(m.read)}</span>
      <span class="color"><i></i>${esc(m.colorName)}</span><br>
      <span class="more">PROFILE ›</span>
    </span>
  </button>`).join("");

/* ---------- プロフィール表示 ---------- */
const root = document.documentElement;
const dlg = document.getElementById("profile");
const sheet = document.getElementById("sheet");
const $ = id => document.getElementById(id);
let cur = 0;

function fillProfile(i){
  cur = (i + MEMBERS.length) % MEMBERS.length;
  const m = MEMBERS[cur];
  dlg.style.setProperty("--mc", m.color);
  const img = $("p-img");
  if (m.photo) { img.src = m.photo; img.alt = m.name; img.hidden = false; } else { img.hidden = true; }
  $("p-colorname").textContent = m.colorName;
  $("p-name").textContent = m.name;
  $("p-read").textContent = m.read;
  const fact = (label, v) => `<div class="fact"><dt>${label}</dt><dd class="${v?'':'off'}">${v?esc(v):'準備中'}</dd></div>`;
  const FACTS = [["誕生日","birthday"], ["血液型","blood"], ["趣味","hobby"], ["特技","skill"]];
  $("p-facts").innerHTML = FACTS.filter(([, k]) => !m.hide.includes(k)).map(([label, k]) => fact(label, m[k])).join("");
  const c = $("p-comment"); c.textContent = m.comment || "準備中"; c.className = m.comment ? "" : "off";
  const SNS = {
  x:         {label:"X",         icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
              url: id => `https://x.com/${encodeURIComponent(id)}`},
  instagram: {label:"Instagram", icon:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
              url: id => `https://www.instagram.com/${encodeURIComponent(id)}/`},
};
const snsUrl = (kind, v) => {
  v = (v || "").trim();
  if (!v) return "";
  if (/^https?:\/\//.test(v)) return v;
  return SNS[kind].url(v.replace(/^@/, ""));
};
const social = (kind, v) => {
  const u = snsUrl(kind, v), {label, icon} = SNS[kind];
  return u
    ? `<a class="soc ${kind}" href="${esc(u)}" target="_blank" rel="noopener" aria-label="${label}を開く" title="${label}">${icon}</a>`
    : `<span class="soc off" aria-label="${label}（準備中）" title="${label}（準備中）">${icon}</span>`;
};
$("p-links").innerHTML = `<span class="follow">FOLLOW</span>` + social("x", m.x) + social("instagram", m.instagram);
  $("p-body").scrollTop = 0;
}
function openProfile(i){
  fillProfile(i);
  root.classList.add("lock");
  if (!dlg.open) dlg.showModal();
}
function closeProfile(){
  if (!dlg.open || dlg.classList.contains("closing")) return;
  dlg.classList.add("closing");
  let done = false;
  const finish = () => { if (done) return; done = true; dlg.classList.remove("closing"); sheet.style.transform = ""; sheet.style.transition = ""; dlg.close(); };
  sheet.addEventListener("animationend", finish, {once:true});
  setTimeout(finish, 400);
}
document.getElementById("member-list").addEventListener("click", e => {
  const b = e.target.closest(".member"); if (b) openProfile(+b.dataset.i);
});
$("p-close").addEventListener("click", closeProfile);
$("p-prev").addEventListener("click", () => fillProfile(cur - 1));
$("p-next").addEventListener("click", () => fillProfile(cur + 1));
dlg.addEventListener("click", e => { if (e.target === dlg) closeProfile(); });       // 背景タップで閉じる
dlg.addEventListener("cancel", e => { e.preventDefault(); closeProfile(); });         // Escキー
dlg.addEventListener("close", () => root.classList.remove("lock"));
dlg.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") fillProfile(cur - 1);
  if (e.key === "ArrowRight") fillProfile(cur + 1);
});

/* スマホ：上のつまみ部分を下へドラッグして閉じる */
(() => {
  const grab = $("grab"); let y0 = null, dy = 0;
  grab.addEventListener("pointerdown", e => { y0 = e.clientY; dy = 0; grab.setPointerCapture(e.pointerId); sheet.style.transition = "none"; });
  grab.addEventListener("pointermove", e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
  const end = () => {
    if (y0 === null) return; y0 = null;
    if (dy > 90) closeProfile();
    else { sheet.style.transition = "transform .2s"; sheet.style.transform = ""; }
  };
  grab.addEventListener("pointerup", end); grab.addEventListener("pointercancel", end);
})();

function svcBlock(head, list, allUrl){
  const ok = (list || []).filter(l => safeUrl(l.url));
  if (!ok.length && !safeUrl(allUrl)) return `<p class="rel-listen">${head}</p><div class="rel-links"><span class="rel-none">配信リンクは準備中</span></div>`;
  return `<p class="rel-listen">${head}</p>${ok.length ? `<div class="svc-grid">${ok.map(l => `<a class="svc" href="${esc(l.url)}" target="_blank" rel="noopener" aria-label="${esc(l.label)}で開く"><img src="${ICONS[l.icon] || ""}" alt="" width="56" height="56" loading="lazy"><span>${esc(l.label)}</span></a>`).join("")}</div>` : ""}${safeUrl(allUrl) ? `<a class="all-link" href="${esc(allUrl)}" target="_blank" rel="noopener">すべての配信先 <span aria-hidden="true">›</span></a>` : ""}`;
}
document.getElementById("music-list").innerHTML = MUSIC.map(r => `
  <article class="release">
    <div class="rel-cover">${r.cover ? `<img src="${r.cover}" alt="${esc(r.title)} ジャケット" loading="lazy" width="720" height="720">` : ""}</div>
    <div class="rel-body">
      <span class="rel-kind">${esc(r.type || "SINGLE")}${r.date ? ` ・ ${esc(r.date)}` : ""}</span>
      <h3 class="rel-title">${esc(r.title)}</h3>
      <p class="rel-artist">${esc(r.artist)}</p>
      <ol class="tracks">${(r.tracks || []).map((t, i) => `<li><span class="no">${i + 1}</span><span class="tt">${esc(t.t)}</span>${t.d ? `<span class="td">${esc(t.d)}</span>` : ""}</li>`).join("")}</ol>
      ${svcBlock("LISTEN ON", r.links, r.all)}
    </div>
  </article>`).join("");
document.getElementById("music-list").classList.toggle("one", MUSIC.length < 2);
document.getElementById("music-hint").hidden = MUSIC.length < 2;
document.getElementById("video-list").innerHTML = VIDEOS.length
  ? VIDEOS.map(v => `<div class="video"><div class="frame"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}" title="${esc(v.title)}" loading="lazy" allowfullscreen></iframe></div><p>${esc(v.title)}</p></div>`).join("")
  : `<div class="card video-empty"><p style="margin:0 0 12px">動画はここに並びます。</p><a class="btn line" href="https://www.youtube.com/@ClaireDolls" target="_blank" rel="noopener">YouTubeチャンネルへ</a></div>`;

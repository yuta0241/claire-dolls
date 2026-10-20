/* Xタイムラインが読み込めなかったときは、案内文に切り替える */
(() => {
  const card = document.getElementById("tl-card"), fb = document.getElementById("tl-fallback");
  const hasTL = () => !!card.querySelector("iframe");
  const fail = () => { if (!hasTL()) { card.classList.add("failed"); fb.hidden = false; } };
  new MutationObserver(() => { if (hasTL()) { card.classList.remove("failed"); fb.hidden = true; } })
    .observe(card, {childList:true, subtree:true});
  setTimeout(fail, 6000);
  window.__tlFail = fail;
})();

(() => {
  const C = window.GAME_CONFIG;
  const $ = (id) => document.getElementById(id);
  const isEdit = new URLSearchParams(location.search).has("edit");

  const panels = [...document.querySelectorAll(".panel")];
  const imgOriginal = $("img-original");
  const imgModified = $("img-modified");

  const state = {
    levelIndex: 0, // C.levels 기준 실제 레벨 번호
    order: [],     // 이번 판의 레벨 진행 순서
    step: 0,       // order 안에서 현재 위치
    found: new Set(),
    running: false,
    deadline: 0,
    limit: 0,
    raf: 0,
  };

  // ---------- 공통 ----------
  const level = () => C.levels[state.levelIndex];
  // 패널 → "a"(원본) / "b"(틀린 그림)
  const sideOf = (panel) => (panel.dataset.side === "original" ? "a" : "b");
  // 위치가 다른 틀린 곳은 { a: {x,y}, b: {x,y} } 로 각각 지정, 아니면 { x, y } 공통
  const posOf = (d, side) => d[side] ?? d;
  const radiusOf = (d, side) => posOf(d, side).r ?? d.r ?? level().hitRadius ?? C.hitRadius;

  function loadImages(lv) {
    const load = (img, src) =>
      new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => {
          alert(`이미지를 불러오지 못했습니다: ${src}`);
          resolve();
        };
        img.src = src;
      });
    return Promise.all([load(imgOriginal, lv.original), load(imgModified, lv.modified)]);
  }

  function clearMarkers() {
    panels.forEach((p) => (p.querySelector(".markers").innerHTML = ""));
  }

  function addMarker(d, cls, label) {
    panels.forEach((p) => {
      const side = sideOf(p);
      const pos = posOf(d, side);
      const m = document.createElement("div");
      m.className = `marker ${cls}`;
      m.style.left = `${pos.x}%`;
      m.style.top = `${pos.y}%`;
      m.style.width = `${radiusOf(d, side) * 2}%`;
      if (label !== undefined) m.textContent = label;
      p.querySelector(".markers").appendChild(m);
    });
  }

  // 클릭 위치를 이미지 대비 % 좌표로 변환
  function toPercent(e, panel) {
    const rect = panel.querySelector("img").getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      ratio: rect.height / rect.width,
    };
  }

  // ---------- 게임 ----------
  function makeOrder() {
    const order = C.levels.map((_, i) => i);
    if (C.shuffle) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    return order;
  }

  async function startLevel(step) {
    state.step = step;
    state.levelIndex = state.order[step];
    state.found = new Set();
    state.running = false;
    cancelAnimationFrame(state.raf);
    clearMarkers();
    hideOverlays();

    const lv = level();
    $("level-label").textContent = `${step + 1} / ${state.order.length} 단계 · ${lv.name ?? ""}`;
    $("found").textContent = 0;
    $("total").textContent = lv.differences.length;
    state.limit = lv.timeLimit ?? C.timeLimit;
    renderTime(state.limit);

    await loadImages(lv);
    state.deadline = performance.now() + state.limit * 1000;
    state.running = true;
    state.lastSec = Math.ceil(state.limit);
    SFX.startBgm();
    SFX.play("start");
    tick();
  }

  function tick() {
    if (!state.running) return;
    const left = Math.max(0, (state.deadline - performance.now()) / 1000);
    renderTime(left);
    // 남은 10초부터 1초마다 째깍, 5초부터는 심장 박동 추가
    const sec = Math.ceil(left);
    if (sec !== state.lastSec) {
      state.lastSec = sec;
      if (sec > 0 && sec <= 10) SFX.play("tick", sec <= 5);
    }
    if (left <= 0) return timeUp();
    state.raf = requestAnimationFrame(tick);
  }

  function renderTime(left) {
    const danger = left <= Math.min(10, state.limit / 3);
    $("time-text").textContent = left.toFixed(1);
    $("time-text").parentElement.classList.toggle("danger", danger);
    const fill = $("timebar-fill");
    fill.style.width = `${(left / state.limit) * 100}%`;
    fill.classList.toggle("danger", danger);
  }

  function handleClick(e, panel) {
    if (!state.running) return;
    const p = toPercent(e, panel);
    const lv = level();

    const side = sideOf(panel);
    const inside = (d) => {
      const pos = posOf(d, side);
      const dx = p.x - pos.x;
      const dy = (p.y - pos.y) * p.ratio; // 세로 %를 가로 기준으로 환산
      return Math.hypot(dx, dy) <= radiusOf(d, side);
    };
    const hit = lv.differences.findIndex((d, idx) => !state.found.has(idx) && inside(d));
    // 이미 찾은 곳을 다시 누르면 무시 (패널티 없음)
    if (hit < 0 && lv.differences.some((d, idx) => state.found.has(idx) && inside(d))) return;

    if (hit >= 0) {
      state.found.add(hit);
      addMarker(lv.differences[hit], "");
      $("found").textContent = state.found.size;
      SFX.play("correct");
      if (state.found.size === lv.differences.length) levelClear();
    } else {
      addMarker({ x: p.x, y: p.y, r: 0 }, "wrong");
      panel.classList.remove("shake");
      void panel.offsetWidth;
      panel.classList.add("shake");
      SFX.play("wrong");
      if (C.wrongClickPenalty) state.deadline -= C.wrongClickPenalty * 1000;
    }
  }

  function levelClear() {
    state.running = false;
    const isLast = state.step === state.order.length - 1;
    if (isLast) SFX.stopBgm();
    setTimeout(() => SFX.play(isLast ? "allClear" : "clear"), 250);
    showResult({
      emoji: isLast ? "🏆" : "🎃",
      title: isLast ? "모든 단계 클리어!" : "단계 클리어!",
      desc: `남은 시간 ${$("time-text").textContent}초`,
      next: !isLast,
    });
  }

  function timeUp() {
    state.running = false;
    const lv = level();
    lv.differences.forEach((d, idx) => {
      if (!state.found.has(idx)) addMarker(d, "missed");
    });

    const js = $("jumpscare");
    $("ghost-img").src = C.ghostImage;
    js.classList.remove("hidden");
    SFX.stopBgm();
    SFX.play("scream");

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      js.classList.add("hidden");
      showResult({
        emoji: "👻",
        title: "시간 초과...",
        desc: `${lv.differences.length}개 중 ${state.found.size}개를 찾았어요.<br>빨간 점선이 못 찾은 곳이에요.`,
        next: false,
      });
    };
    setTimeout(finish, C.ghostDuration ?? 2500);
  }

  function showResult({ emoji, title, desc, next }) {
    $("result-emoji").textContent = emoji;
    $("result-title").textContent = title;
    $("result-desc").innerHTML = desc;
    $("btn-next").classList.toggle("hidden", !next);
    $("btn-retry").classList.toggle("hidden", next);
    $("screen-result").classList.remove("hidden");
  }

  function hideOverlays() {
    $("screen-start").classList.add("hidden");
    $("screen-result").classList.add("hidden");
    $("jumpscare").classList.add("hidden");
  }

  // ---------- 편집 모드 ----------
  function initEditor() {
    hideOverlays();
    $("editor").classList.remove("hidden");
    $("hud").querySelector(".stats").classList.add("hidden");
    $("timebar").classList.add("hidden");

    const select = $("edit-level");
    C.levels.forEach((lv, i) => select.add(new Option(`${i + 1}. ${lv.name ?? ""}`, i)));

    let points = [];
    const render = () => {
      clearMarkers();
      points.forEach((d, i) => addMarker(d, "edit", i + 1));
      panels.forEach((p) =>
        p.querySelectorAll(".marker.edit").forEach((m, i) =>
          m.addEventListener("click", (e) => {
            e.stopPropagation();
            points.splice(i, 1);
            render();
          })
        )
      );
      const fmt = (p) => `x: ${p.x}, y: ${p.y}${p.r !== undefined ? `, r: ${p.r}` : ""}`;
      $("edit-output").value =
        "differences: [\n" +
        points
          .map((d) =>
            d.a || d.b
              ? `  { a: { ${fmt(posOf(d, "a"))} }, b: { ${fmt(posOf(d, "b"))} }${d.r !== undefined ? `, r: ${d.r}` : ""} },`
              : `  { ${fmt(d)} },`
          )
          .join("\n") +
        "\n],";
    };

    const open = async (i) => {
      state.levelIndex = i;
      points = level().differences.map((d) => ({ ...d }));
      await loadImages(level());
      render();
    };

    select.onchange = () => open(+select.value);
    panels.forEach((panel) =>
      panel.addEventListener("click", (e) => {
        const p = toPercent(e, panel);
        const pos = { x: +p.x.toFixed(1), y: +p.y.toFixed(1) };
        const last = points[points.length - 1];
        if (e.shiftKey && last) {
          // Shift+클릭: 마지막 항목의 이 패널 쪽 위치만 따로 지정 (물체가 이동한 경우)
          const side = sideOf(panel);
          const other = side === "a" ? "b" : "a";
          const { r } = last;
          const otherPos = posOf(last, other);
          points[points.length - 1] = {
            [side]: pos,
            [other]: { x: otherPos.x, y: otherPos.y },
            ...(r !== undefined && { r }),
          };
        } else {
          points.push(pos);
        }
        render();
      })
    );
    $("edit-copy").onclick = () => {
      navigator.clipboard?.writeText($("edit-output").value);
      $("edit-output").select();
    };
    $("edit-clear").onclick = () => { points = []; render(); };
    open(0);
  }

  // ---------- 시작 ----------
  document.title = C.title;
  $("title").textContent = C.title;
  $("start-title").textContent = C.title;
  $("start-time").textContent = C.timeLimit;

  if (isEdit) {
    initEditor();
    return;
  }

  panels.forEach((panel) => panel.addEventListener("click", (e) => handleClick(e, panel)));
  $("btn-start").onclick = () => {
    SFX.unlock();
    state.order = makeOrder();
    startLevel(0);
  };
  $("btn-next").onclick = () => startLevel(state.step + 1);
  $("btn-retry").onclick = () => startLevel(state.step);
  $("btn-home").onclick = () => {
    SFX.stopBgm();
    hideOverlays();
    clearMarkers();
    $("screen-start").classList.remove("hidden");
  };

  // 음소거 버튼
  const muteBtn = $("btn-mute");
  const renderMute = () => {
    muteBtn.textContent = SFX.isMuted() ? "🔇" : "🔊";
    muteBtn.title = SFX.isMuted() ? "소리 켜기" : "소리 끄기";
  };
  muteBtn.onclick = () => { SFX.toggleMute(); renderMute(); };
  renderMute();

  // 귀신 이미지 미리 로드
  new Image().src = C.ghostImage;
})();

(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const track = document.querySelector('.journey-scroll-track');
  const images = [...document.querySelectorAll('.scene-image')];
  const lastScene = images.length - 1;
  const panels = [...document.querySelectorAll('.scene-panel')];
  const bridge = document.querySelector('.scene-bridge');
  const shade = document.querySelector('.hero-shade');
  const atmosphere = document.querySelector('.scene-atmosphere');
  const status = document.getElementById('journey-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ready = images.map((_, index) => index === 0);
  const failed = images.map(() => false);
  const loading = images.map(() => false);
  let enabled = !reduced.matches;
  let progress = 0;
  let current = 0;
  let distance = 1;
  let sceneHeight = innerHeight;
  let blurRadius = innerWidth < 600 ? 3 : 5;
  let frame = 0;
  let previousTime = 0;
  const clamp = (n, max = 1) => Math.max(0, Math.min(max, n));
  const ease = n => n * n * n * (n * (n * 6 - 15) + 10);
  const phase = (n, from, to) => ease(clamp((n - from) / (to - from)));

  function showPanel(index, opacity) {
    const panel = panels[index];
    panel.style.opacity = opacity.toFixed(4);
    panel.inert = opacity < .98;
    panel.setAttribute('aria-hidden', String(opacity < .98));
    panel.dataset.active = String(opacity >= .98);
  }

  function draw() {
    // The same timeline renders in both directions; reversing a scroll does
    // not restart or finish an automatic animation.
    const missing = ready.findIndex(value => !value);
    const furthestReady = missing === -1 ? lastScene : missing - 1;
    const visual = enabled ? progress : Math.min(Math.round(progress), furthestReady);
    const from = Math.min(Math.floor(visual), lastScene - 1);
    const to = from + 1;
    const p = visual - from;
    const camera = phase(p, .07, .90);
    const arrival = phase(p, .28, .73);
    const incomingCamera = phase(p, .20, .90);
    const softness = arrival === 0 || arrival === 1 ? 0 : Math.sin(arrival * Math.PI) ** 2;
    const scaleOut = (from === 0 ? 1.025 : 1.14) * Math.exp(camera * .78);
    const scaleIn = 1.025 + .115 * incomingCamera;
    images.forEach((image, index) => {
      image.style.zIndex = index === to ? '2' : index === from ? '1' : '0';
      image.style.opacity = index === from ? '1' : index === to ? arrival.toFixed(4) : '0';
      if (index === from) {
        image.style.transform = `translateY(${-camera * sceneHeight * .045}px) scale(${scaleOut})`;
        image.style.filter = `blur(${softness * blurRadius / scaleOut}px)`;
      } else if (index === to) {
        image.style.transform = `scale(${scaleIn})`;
        image.style.filter = `blur(${softness * blurRadius / scaleIn}px)`;
      }
      showPanel(index, index === from ? 1 - phase(p, .10, .29) : index === to ? phase(p, .77, .92) : 0);
    });
    bridge.style.opacity = softness * .2;
    const sunset = from === lastScene - 1 ? arrival : 0;
    shade.style.opacity = 1 - sunset * .78;
    atmosphere.style.opacity = 1 - sunset * .75;
    bridge.style.background = from === lastScene - 1
      ? 'radial-gradient(ellipse at 48% 65%,#f2cda6,#f2cda680 38%,transparent 76%)'
      : 'radial-gradient(ellipse at 48% 65%,#e3f3ed,#e3f3ed85 38%,transparent 76%)';
    const foreground = visual < 1 ? 1 - camera : 0;
    hero.style.setProperty('--foreground-opacity', foreground * .8);
    hero.style.setProperty('--flower-left-x', `${-(1 - foreground) * 210}px`);
    hero.style.setProperty('--flower-right-x', `${(1 - foreground) * 210}px`);
    current = arrival >= .5 ? to : from;
    root.dataset.scene = current;
    root.dataset.progress = progress.toFixed(4);
  }

  function tick(time) {
    frame = 0;
    if (document.hidden || document.querySelector('dialog[open]')) { previousTime = 0; return; }
    const requested = clamp(scrollY / distance * lastScene, lastScene);
    const missing = ready.findIndex(value => !value);
    const limit = missing === -1 ? lastScene : missing - 1 + .08;
    const target = Math.min(requested, limit);
    const blocked = requested > limit ? missing : -1;
    status.textContent = blocked < 0 ? '' : failed[blocked] ? 'That view couldn’t load. Please refresh to try again.' : 'Your little world is loading…';
    const delta = Math.min(48, previousTime ? time - previousTime : 16);
    previousTime = time;
    progress = enabled ? progress + (target - progress) * (1 - Math.exp(-delta / 145)) : target;
    if (Math.abs(target - progress) < .00008) progress = target;
    draw();
    if (progress !== target) schedule();
    else previousTime = 0;
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function measure() {
    distance = Math.max(1, track.offsetHeight - innerHeight);
    sceneHeight = hero.clientHeight;
    blurRadius = innerWidth < 600 ? 3 : 5;
    schedule();
  }

  async function prepare(index, retry = false) {
    if (ready[index] || loading[index]) return;
    const image = images[index];
    loading[index] = true;
    failed[index] = false;
    if (retry && image.complete && !image.naturalWidth) image.src = image.getAttribute('src').split('?')[0] + '?retry=' + Date.now();
    const loaded = image.complete ? Boolean(image.naturalWidth) : await new Promise(resolve => {
      const finish = () => {
        clearTimeout(timer);
        image.removeEventListener('load', finish);
        image.removeEventListener('error', finish);
        resolve(Boolean(image.naturalWidth));
      };
      const timer = setTimeout(finish, 10000);
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
    });
    if (loaded) { try { await image.decode(); } catch {} }
    ready[index] = loaded;
    failed[index] = !loaded;
    loading[index] = false;
    schedule();
  }
  function goTo(index) {
    if (document.querySelector('dialog[open]')) return;
    const target = clamp(index, lastScene);
    for (let i = 1; i <= target; i++) prepare(i, true);
    window.scrollTo({ top: target / lastScene * distance, behavior: enabled ? 'smooth' : 'instant' });
    schedule();
  }
  function updateMotion() {
    root.classList.toggle('motion-paused', !enabled);
    schedule();
  }
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.go))));
  reduced.addEventListener('change', () => { enabled = !reduced.matches; updateMotion(); });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
    else schedule();
  });
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', schedule));
  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(Math.floor(progress + .08) + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(Math.ceil(progress - .08) - 1); }
  });
  // Native wheel, trackpad, swipe, Page Down, and arrow-key scrolling are
  // intentionally left intact. Only the fixed artwork responds to scrollY.
  measure();
  draw();
  updateMotion();
  for (let index = 1; index <= lastScene; index++) prepare(index);
})();

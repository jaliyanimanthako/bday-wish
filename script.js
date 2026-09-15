const content = window.BIRTHDAY_CONTENT;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-name]').forEach(el => { el.textContent = content.name; });
document.title = `Happy birthday, ${content.name} ♡`;
const letterContent = document.getElementById('letter-content');
function renderLetter() {
  letterContent.replaceChildren();
  content.letter.forEach(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    letterContent.append(paragraph);
  });
  const signoff = document.getElementById('letter-signoff');
  signoff.textContent = content.signoff;
}
renderLetter();

const icons = {
  sun: '<circle cx="24" cy="24" r="10"/><path d="M24 3v5m0 32v5M3 24h5m32 0h5M9 9l4 4m22 22 4 4M9 39l4-4m22-22 4-4"/>',
  heart: '<use href="#heart"/>'
};
content.reasons.forEach((reason, index) => {
  const card = document.createElement('article');
  card.className = 'note-card';
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${reason.title}. ${reason.text} ${reason.note}. Reveal another note.`);
  card.setAttribute('aria-describedby', 'notes-gesture-hint');
  const icon = ['sun', 'heart'].includes(reason.icon) ? reason.icon : 'heart';
  card.innerHTML = `<svg class="reason-icon ${icon}" viewBox="0 0 ${icon === 'sun' ? 48 : icon === 'heart' ? 24 : 80} ${icon === 'sun' ? 48 : icon === 'heart' ? 24 : 80}" aria-hidden="true">${icons[icon]}</svg><span class="reason-number">${String(index + 1).padStart(2, '0')}</span><h3></h3><p></p><span class="handwritten"></span>`;
  card.querySelector('h3').textContent = reason.title;
  card.querySelector('p').textContent = reason.text;
  card.querySelector('.handwritten').textContent = reason.note;
  document.getElementById('reason-cards').append(card);
});

const reasonCards = [...document.querySelectorAll('.note-card')];
const notesEnvelope = document.getElementById('notes-envelope');
const notesOpen = document.getElementById('notes-open');
const notesControls = document.getElementById('notes-controls');
let notesExpanded = false;
let reasonPage = 0;
let noteAnimation;
let shufflingNotes = false;
function renderReason() {
  reasonCards.forEach((card, index) => {
    const offset = (index - reasonPage + reasonCards.length) % reasonCards.length;
    card.style.setProperty('--stack-position', Math.min(offset, 2));
    card.classList.toggle('note-active', offset === 0);
    card.classList.toggle('note-deferred', offset > 2);
    card.setAttribute('aria-hidden', String(!notesExpanded || offset !== 0));
    card.tabIndex = notesExpanded && offset === 0 ? 0 : -1;
  });
  document.getElementById('reason-page').textContent = `${reasonPage + 1} / ${reasonCards.length}`;
}
function setNotesExpanded(expanded) {
  noteAnimation?.cancel();
  notesExpanded = expanded;
  notesEnvelope.classList.toggle('is-open', expanded);
  notesOpen.setAttribute('aria-expanded', String(expanded));
  notesOpen.hidden = expanded;
  notesControls.hidden = !expanded;
  renderReason();
  (expanded ? reasonCards[reasonPage] : notesOpen).focus({ preventScroll: true });
}
async function shuffleNotes(direction = 1) {
  if (!notesExpanded || shufflingNotes) return;
  shufflingNotes = true;
  const card = reasonCards[reasonPage];
  const restoreFocus = document.activeElement === card;
  try {
    if (!reducedMotion.matches) {
      noteAnimation = card.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${direction * 115}px, -18px) rotate(${direction * 13}deg)`, opacity: 0 }
      ], { duration: 280, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
      await noteAnimation.finished;
    }
    if (!notesExpanded) return;
    reasonPage = (reasonPage + 1) % reasonCards.length;
    renderReason();
    noteAnimation?.cancel();
    if (restoreFocus) reasonCards[reasonPage].focus({ preventScroll: true });
  } catch {
    // Tucking the cards away cancels a shuffle in progress.
  } finally {
    noteAnimation = undefined;
    shufflingNotes = false;
  }
}
notesOpen.addEventListener('click', () => setNotesExpanded(true));
document.getElementById('notes-close').addEventListener('click', () => setNotesExpanded(false));
reasonCards.forEach(card => {
  let gesture;
  let ignoreClick = false;
  card.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || !card.classList.contains('note-active')) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    ignoreClick = false;
    card.setPointerCapture(event.pointerId);
  });
  card.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = undefined;
    ignoreClick = Math.abs(dx) > 10 || Math.abs(dy) > 10;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) shuffleNotes(Math.sign(dx));
  });
  card.addEventListener('pointercancel', () => { gesture = undefined; ignoreClick = true; });
  card.addEventListener('click', event => {
    if ((!ignoreClick || event.detail === 0) && card.classList.contains('note-active')) shuffleNotes();
    ignoreClick = false;
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) shuffleNotes();
    }
  });
});
renderReason();
document.querySelectorAll('[data-dialog]').forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.getElementById(button.dataset.dialog);
    if (modal.id === 'wish-dialog') resetWish();
    modal.showModal();
    document.body.classList.add('modal-open');
  });
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(modal => {
  modal.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
  });
  if (modal.id !== 'letter-dialog') modal.addEventListener('click', event => {
    const bounds = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) modal.close();
  });
});

const dialog = document.getElementById('letter-dialog');
document.getElementById('open-letter').addEventListener('click', () => {
  dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.scrollTop = 0;
  document.querySelector('.letter-reading').scrollTop = 0;
});
document.getElementById('close-letter').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));

const wishButton = document.getElementById('wish-button');
const relightButton = document.getElementById('relight');
const wishDialog = document.getElementById('wish-dialog');
let confettiTimer;
let wishMessageIndex = 0;
const wishMessages = [
  'Wish made — may something beautiful find you. ♡',
  'The stars are keeping this one safe for you. ✨',
  'Another little hope sent into the sky. ♡',
  'May it arrive when your heart needs it most. ✨'
];
function resetWish() {
  document.getElementById('flame').classList.remove('out');
  wishButton.hidden = false;
  relightButton.hidden = true;
  document.getElementById('wish-status').textContent = 'This one’s just for you.';
  document.getElementById('confetti').replaceChildren();
  clearTimeout(confettiTimer);
}
wishDialog.addEventListener('close', resetWish);
wishButton.addEventListener('click', () => {
  document.getElementById('flame').classList.add('out');
  wishButton.hidden = true;
  relightButton.hidden = false;
  document.getElementById('wish-status').textContent = wishMessages[wishMessageIndex++ % wishMessages.length];
  relightButton.focus({ preventScroll: true });
  if (reducedMotion.matches || document.documentElement.classList.contains('motion-paused')) return;
  const confetti = document.getElementById('confetti');
  confetti.replaceChildren();
  clearTimeout(confettiTimer);
  const colors = ['#e6bc5e', '#9aaf82', '#fffae9', '#b7ced2', '#d9a499'];
  for (let i = 0; i < 65; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.setProperty('--left', `${Math.random() * 100}%`);
    piece.style.setProperty('--size', `${5 + Math.random() * 5}px`);
    piece.style.setProperty('--color', colors[i % colors.length]);
    piece.style.setProperty('--duration', `${3 + Math.random() * 3}s`);
    piece.style.setProperty('--delay', `${Math.random() * 1.3}s`);
    piece.style.setProperty('--sway', `${Math.random() * 220 - 110}px`);
    confetti.append(piece);
  }
  confettiTimer = setTimeout(() => confetti.replaceChildren(), 7500);
});
relightButton.addEventListener('click', () => {
  document.getElementById('flame').classList.remove('out');
  wishButton.hidden = false;
  relightButton.hidden = true;
  document.getElementById('wish-status').textContent = 'This one’s just for you.';
  document.getElementById('confetti').replaceChildren();
  clearTimeout(confettiTimer);
  wishButton.focus({ preventScroll: true });
});

// A quiet “Happy Birthday to You” music-box melody. Start on load when the browser permits it,
// then use the first visitor interaction as the autoplay fallback.
let audioContext;
let musicTimer;
let soundOn = false;
let soundWanted = true;
let noteIndex = 0;
const beatLength = 430;
const melody = [
  [392, .5], [392, .5], [440, 1], [392, 1], [523.25, 1], [493.88, 2], [0, .65],
  [392, .5], [392, .5], [440, 1], [392, 1], [587.33, 1], [523.25, 2], [0, .65],
  [392, .5], [392, .5], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440, 2], [0, .65],
  [698.46, .5], [698.46, .5], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 2], [0, 1.5]
];
const soundToggle = document.getElementById('sound-toggle');
function playNote(frequency, beats) {
  if (!audioContext || audioContext.state !== 'running') return;
  const now = audioContext.currentTime;
  const release = Math.max(.55, beats * beatLength / 1000 * 1.15);
  [1, 2].forEach((harmonic, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency * harmonic;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(index ? 0.012 : 0.045, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + release);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + release + .1);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}
function playNextNote() {
  if (!soundOn || !audioContext || audioContext.state !== 'running') return;
  const [frequency, beats] = melody[noteIndex++ % melody.length];
  if (frequency) playNote(frequency, beats);
  musicTimer = setTimeout(playNextNote, beats * beatLength);
}
function renderSound() {
  soundToggle.setAttribute('aria-pressed', String(soundOn));
  document.getElementById('sound-label').textContent = soundOn ? 'Sound on' : 'Sound off';
}
async function startSound() {
  const AudioConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioConstructor) throw new Error('Audio unavailable');
  audioContext ||= new AudioConstructor();
  await audioContext.resume();
  if (audioContext.state !== 'running') return false;
  if (!soundOn) {
    soundOn = true;
    noteIndex = 0;
    clearTimeout(musicTimer);
    playNextNote();
    renderSound();
  }
  return true;
}
async function stopSound() {
  clearTimeout(musicTimer);
  if (audioContext?.state === 'running') await audioContext.suspend();
  soundOn = false;
  renderSound();
}
function removeAutoplayFallback() {
  document.removeEventListener('pointerdown', startAfterInteraction, true);
  document.removeEventListener('keydown', startAfterInteraction, true);
}
async function startAfterInteraction(event) {
  if (!soundWanted || event.target.closest?.('#sound-toggle')) return;
  try {
    if (await startSound()) removeAutoplayFallback();
  } catch {
    soundWanted = false;
    document.getElementById('sound-label').textContent = 'Sound unavailable';
    removeAutoplayFallback();
  }
}
async function attemptAutoplay() {
  if (!soundWanted || document.hidden) return;
  try {
    if (await startSound()) removeAutoplayFallback();
  } catch {
    // Autoplay commonly requires a gesture; the listeners below retry then.
  }
}
soundToggle.addEventListener('click', async () => {
  soundToggle.disabled = true;
  try {
    if (soundOn) {
      soundWanted = false;
      await stopSound();
    } else {
      soundWanted = true;
      await startSound();
    }
  } catch {
    soundWanted = false;
    soundOn = false;
    clearTimeout(musicTimer);
    renderSound();
    document.getElementById('sound-label').textContent = 'Sound unavailable';
  } finally {
    soundToggle.disabled = false;
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && soundOn) {
    stopSound();
  } else if (!document.hidden && soundWanted) {
    attemptAutoplay();
  }
});
document.addEventListener('pointerdown', startAfterInteraction, true);
document.addEventListener('keydown', startAfterInteraction, true);
attemptAutoplay();

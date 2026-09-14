const content = window.BIRTHDAY_CONTENT;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-name]').forEach(el => { el.textContent = content.name; });
document.title = `Happy birthday, ${content.name} ♡`;
const letterContent = document.getElementById('letter-content');
const letterPages = [];
for (let i = 0; i < content.letter.length; i += 2) letterPages.push(content.letter.slice(i, i + 2));
if (!letterPages.length) letterPages.push([]);
let letterPage = 0;
function renderLetter() {
  letterContent.replaceChildren();
  letterPages[letterPage].forEach(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    letterContent.append(paragraph);
  });
  const signoff = document.getElementById('letter-signoff');
  signoff.textContent = content.signoff;
  signoff.hidden = letterPage !== letterPages.length - 1;
  document.getElementById('letter-page').textContent = `${letterPage + 1} / ${letterPages.length}`;
  document.getElementById('letter-prev').disabled = letterPage === 0;
  document.getElementById('letter-next').disabled = letterPage === letterPages.length - 1;
  document.querySelector('.letter-reading').scrollTop = 0;
}
document.getElementById('letter-prev').addEventListener('click', () => { if (letterPage > 0) { letterPage--; renderLetter(); } });
document.getElementById('letter-next').addEventListener('click', () => { if (letterPage < letterPages.length - 1) { letterPage++; renderLetter(); } });
renderLetter();

const icons = {
  sun: '<circle cx="24" cy="24" r="10"/><path d="M24 3v5m0 32v5M3 24h5m32 0h5M9 9l4 4m22 22 4 4M9 39l4-4m22-22 4-4"/>',
  heart: '<use href="#heart"/>',
  flower: '<use href="#daisy"/>'
};
content.reasons.forEach((reason, index) => {
  const card = document.createElement('article');
  card.className = 'reason-card';
  const icon = ['sun', 'heart', 'flower'].includes(reason.icon) ? reason.icon : 'flower';
  card.innerHTML = `<svg class="reason-icon ${icon}" viewBox="0 0 ${icon === 'sun' ? 48 : icon === 'heart' ? 24 : 80} ${icon === 'sun' ? 48 : icon === 'heart' ? 24 : 80}" aria-hidden="true">${icons[icon]}</svg><span class="reason-number">0${index + 1}</span><h3></h3><p></p><span class="handwritten"></span>`;
  card.querySelector('h3').textContent = reason.title;
  card.querySelector('p').textContent = reason.text;
  card.querySelector('.handwritten').textContent = reason.note;
  document.getElementById('reason-cards').append(card);
});

const reasonCards = [...document.querySelectorAll('.reason-card')];
let reasonPage = 0;
function renderReason() {
  reasonCards.forEach((card, index) => { card.hidden = index !== reasonPage; });
  document.getElementById('reason-page').textContent = `${reasonPage + 1} / ${reasonCards.length}`;
  document.getElementById('reason-prev').disabled = reasonPage === 0;
  document.getElementById('reason-next').disabled = reasonPage >= reasonCards.length - 1;
}
document.getElementById('reason-prev').addEventListener('click', () => { if (reasonPage > 0) { reasonPage--; renderReason(); } });
document.getElementById('reason-next').addEventListener('click', () => { if (reasonPage < reasonCards.length - 1) { reasonPage++; renderReason(); } });
renderReason();
document.querySelectorAll('[data-dialog]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.dialog).showModal();
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
  letterPage = 0;
  renderLetter();
  dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.scrollTop = 0;
});
document.getElementById('close-letter').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));

if (!reducedMotion.matches) {
  for (let i = 0; i < 12; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.setProperty('--left', `${Math.random() * 100}%`);
    petal.style.setProperty('--delay', `${-Math.random() * 25}s`);
    petal.style.setProperty('--duration', `${18 + Math.random() * 14}s`);
    document.getElementById('petals').append(petal);
  }
}

const wishButton = document.getElementById('wish-button');
const relightButton = document.getElementById('relight');
let confettiTimer;
wishButton.addEventListener('click', () => {
  document.getElementById('flame').classList.add('out');
  wishButton.hidden = true;
  relightButton.hidden = false;
  document.getElementById('wish-status').textContent = 'May your wish find its way to you. ♡';
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

// A quiet original music-box pattern. Audio only starts after an explicit click.
let audioContext;
let musicTimer;
let soundOn = false;
let noteIndex = 0;
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 880, 783.99, 659.25, 523.25, 587.33, 659.25, 523.25, 392, 440, 493.88];
const soundToggle = document.getElementById('sound-toggle');
function playNote() {
  if (!audioContext || audioContext.state !== 'running') return;
  const now = audioContext.currentTime;
  const frequency = melody[noteIndex++ % melody.length];
  [1, 2].forEach((harmonic, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency * harmonic;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(index ? 0.012 : 0.045, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 2.4);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}
function renderSound() {
  soundToggle.setAttribute('aria-pressed', String(soundOn));
  document.getElementById('sound-label').textContent = soundOn ? 'Sound on' : 'Sound off';
}
soundToggle.addEventListener('click', async () => {
  soundToggle.disabled = true;
  try {
    if (soundOn) {
      clearInterval(musicTimer);
      await audioContext.suspend();
      soundOn = false;
    } else {
      const AudioConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioConstructor) throw new Error('Audio unavailable');
      audioContext ||= new AudioConstructor();
      await audioContext.resume();
      soundOn = true;
      playNote();
      musicTimer = setInterval(playNote, 820);
    }
    renderSound();
  } catch {
    soundOn = false;
    clearInterval(musicTimer);
    renderSound();
    document.getElementById('sound-label').textContent = 'Sound unavailable';
  } finally {
    soundToggle.disabled = false;
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && soundOn) {
    clearInterval(musicTimer);
    audioContext.suspend();
    soundOn = false;
    renderSound();
  }
});

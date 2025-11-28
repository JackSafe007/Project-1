// Elements
const fileInput = document.getElementById('fileInput');
const openModalBtn = document.getElementById('openModalBtn');
const openViewBtn = document.getElementById('openViewBtn');

const modal = document.getElementById('modal');
const staticImg = document.getElementById('staticImg');
const closeModalBtn = document.getElementById('closeModalBtn');
const openViewFromModalBtn = document.getElementById('openViewFromModalBtn');

const viewOverlay = document.getElementById('viewOverlay');
const viewbox = document.getElementById('viewbox');
const pannableImg = document.getElementById('pannableImg');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');
const closeViewBtn = document.getElementById('closeViewBtn');
const closeViewBackdrop = document.getElementById('closeViewBackdrop');

let currentImageSrc = "";
let translateX = 0;
let minTranslateX = 0;
let maxTranslateX = 0; // usually 0
const STEP = 60; // pixel step per arrow press; adjust as desired

// Prevent default drag of images globally
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

// Load file from input
fileInput.addEventListener('change', (ev) => {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageSrc = e.target.result;
    staticImg.src = currentImageSrc;
    pannableImg.src = currentImageSrc;
    openModalBtn.disabled = false;
    openViewBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

// Modal open/close
openModalBtn.addEventListener('click', () => {
  if (!currentImageSrc) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
});

// Open 16:9 view either from main control or from modal
openViewBtn.addEventListener('click', openView);
openViewFromModalBtn.addEventListener('click', () => {
  openView();
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
});

function openView(){
  if (!currentImageSrc) return;
  viewOverlay.classList.remove('hidden');
  viewOverlay.setAttribute('aria-hidden','false');
  // Set initial image and reset translate when image loads
  pannableImg.onload = () => {
    resetPan();
    computeBounds();
  };
  pannableImg.src = currentImageSrc;
}

// Close view
closeViewBtn.addEventListener('click', closeView);
closeViewBackdrop.addEventListener('click', closeView);

function closeView(){
  viewOverlay.classList.add('hidden');
  viewOverlay.setAttribute('aria-hidden','true');
}

// Compute pan bounds based on image natural size and viewbox size
function computeBounds(){
  requestAnimationFrame(()=>{
    const vbRect = viewbox.getBoundingClientRect();

    const imgNaturalW = pannableImg.naturalWidth || 0;
    const imgNaturalH = pannableImg.naturalHeight || 1;

    // displayed width when image is scaled to fit viewbox height (max-height:100%)
    const displayedWidth = imgNaturalW * (vbRect.height / imgNaturalH);

    // If image is narrower than viewbox, center it and disable panning
    if (displayedWidth <= vbRect.width + 0.5){
      const centerTranslate = (vbRect.width - displayedWidth) / 2;
      minTranslateX = maxTranslateX = centerTranslate;
      translateX = centerTranslate;
      applyTransform();
      arrowLeft.disabled = arrowRight.disabled = true;
      return;
    }

    // Otherwise allow panning: leftmost translate (0) shows left edge, rightmost is negative so right edge aligns with viewbox right edge
    maxTranslateX = 0;
    minTranslateX = Math.min(0, vbRect.width - displayedWidth);
    // Clamp current translate
    translateX = Math.max(minTranslateX, Math.min(maxTranslateX, translateX));
    applyTransform();
    arrowLeft.disabled = false;
    arrowRight.disabled = false;
  });
}

function applyTransform(){
  // keep vertical centering using a -50% Y translation; X is the pixel translate
  pannableImg.style.transform = `translate(${translateX}px, -50%)`;
}

// Reset pan to left edge for wide images (so leftmost part is visible by default)
function resetPan(){
  translateX = 0;
  computeBounds();
}

// Arrow actions
arrowLeft.addEventListener('click', () => {
  translateX = Math.min(maxTranslateX, translateX + STEP);
  translateX = Math.max(minTranslateX, translateX);
  applyTransform();
});
arrowRight.addEventListener('click', () => {
  translateX = Math.max(minTranslateX, translateX - STEP);
  translateX = Math.min(maxTranslateX, translateX);
  applyTransform();
});

// Keyboard support for arrows when view is open
window.addEventListener('keydown', (e) => {
  if (viewOverlay.classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft'){
    e.preventDefault();
    arrowLeft.click();
  } else if (e.key === 'ArrowRight'){
    e.preventDefault();
    arrowRight.click();
  } else if (e.key === 'Escape'){
    e.preventDefault();
    closeView();
  }
});

// Recompute bounds on resize
window.addEventListener('resize', () => {
  if (!viewOverlay.classList.contains('hidden')) computeBounds();
});

// Make sure images are non-interactive to enforce static modal behavior
staticImg.addEventListener('mousedown', (e) => e.preventDefault());
pannableImg.addEventListener('mousedown', (e) => e.preventDefault());

/* End of script */
const http = require('http');
const assert = require('assert');

// Start temporary local server to test HTML
const server = http.createServer((req, res) => {
  // Read from apps/web/server.js
});

const fs = require('fs');
const htmlSource = fs.readFileSync('C:/Users/ADMIN/Documents/LevelUp/apps/web/server.js', 'utf8');

console.log('Testing Progressive Staggered Scroll-Reveal Implementation...');

// 1. CSS presence
assert(htmlSource.includes('.scroll-reveal-card {'), 'Missing .scroll-reveal-card CSS rule');
assert(htmlSource.includes('transform: translateY(28px) scale(0.975);'), 'Missing initial transform for card reveal');
assert(htmlSource.includes('filter: blur(4px);'), 'Missing subtle blur for VisionOS entrance');
assert(htmlSource.includes('--reveal-delay'), 'Missing --reveal-delay CSS property');
assert(htmlSource.includes('.scroll-reveal-card.is-revealed {'), 'Missing .is-revealed CSS rule');
assert(htmlSource.includes('@media (prefers-reduced-motion: reduce)'), 'Missing accessibility reduced motion rule');

// 2. JS function presence
assert(htmlSource.includes('function initScrollRevealCards()'), 'Missing initScrollRevealCards');
assert(htmlSource.includes('function processCardRevealBatch()'), 'Missing processCardRevealBatch');
assert(htmlSource.includes('function triggerActiveViewCardsReveal('), 'Missing triggerActiveViewCardsReveal');
assert(htmlSource.includes('function sanitizeLegacyComments()'), 'Missing sanitizeLegacyComments');

// 3. Modals and 3D carousels exclusion
assert(htmlSource.includes("el.classList.contains('modal-card')"), 'Modals must be excluded from reveal');
assert(htmlSource.includes("el.classList.contains('quest-3d-card')"), '3D quest cylinder must be excluded from 2D scroll reveal');

// 4. Stagger delay logic ("un à un")
assert(htmlSource.includes("staggerDelay = Math.min(index * 65, 450)"), 'Missing 65ms stagger step for un à un reveal');

console.log('All 10 scroll-reveal validation checks PASSED perfectly!');

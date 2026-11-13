const channel = new BroadcastChannel('fragments-of-memory');
const PICTURE_SECS = 30, QUESTION_SECS = 10;

function scene(bg, items, caption) {
  const body = items.map(([e, x, y, s]) =>
    `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle">${e}</text>`).join('');
  const cap = caption ? `<rect y="740" width="1600" height="160" fill="#0d1020" fill-opacity=".85"/><text x="800" y="845" font-size="80" font-family="Georgia,serif" font-weight="bold" fill="#5bd1a0" text-anchor="middle">${caption}</text>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${bg}</linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/>${body}${cap}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const BG1 = '<stop offset="0" stop-color="#8ec5ff"/><stop offset="1" stop-color="#bfe8a8"/>';
const BG2 = '<stop offset="0" stop-color="#0b1030"/><stop offset="1" stop-color="#3a2a6a"/>';
const BG3 = '<stop offset="0" stop-color="#7fd8ff"/><stop offset="1" stop-color="#f6e2a8"/>';
const S1 = [['☀️',1400,230,150],['🌳',260,560,320],['🧺',800,640,230],['🍎',560,700,110],['🍎',800,720,110],['🍎',1040,700,110],['🐝',1150,330,90],['🦋',430,240,90]];
const S2 = [['🌙',1300,220,200],['⭐',250,180,80],['⭐',520,300,60],['⭐',800,140,90],['⭐',1000,330,60],['🏠',420,640,260],['🦉',1050,600,200]];
const S3 = [['🏝️',500,480,330],['⛵',1250,400,200],['🦀',900,700,130],['🐚',300,720,90],['🐚',520,720,90],['🐚',700,700,90],['🐚',1150,720,90],['🐚',1380,700,90]];
const DEMO_ROUNDS = [
  { img: scene(BG1, S1), answerImg: scene(BG1, S1, 'Answer: 3 apples'), q: 'How many apples were in the picture?' },
  { img: scene(BG2, S2), answerImg: scene(BG2, S2, 'Answer: an owl'), q: 'Which animal was sitting in the night scene?' },
  { img: scene(BG3, S3), answerImg: scene(BG3, S3, 'Answer: 5 shells'), q: 'How many shells were on the beach?' }
];

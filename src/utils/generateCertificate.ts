import type { TestResult } from '../hooks/useTypingTest';

function getAwardTitle(wpm: number): string {
  if (wpm < 20) return 'Certified Keyboard Archaeologist';
  if (wpm < 40) return 'Licensed Hunt-and-Peck Artisan';
  if (wpm < 55) return 'Accredited Typist of Humble Achievement';
  if (wpm < 70) return 'Distinguished Speed-Presser of Keys';
  if (wpm < 90) return 'Grand Master of Rapid Finger Deployment';
  if (wpm < 110) return 'Supreme Overlord of Keyboard Domination';
  return 'Transcendent Deity of the Sacred Home Row';
}

function getComparison(wpm: number): string {
  if (wpm < 30) return 'slower than a sloth on sedatives — yet we celebrate you anyway';
  if (wpm < 50) return 'roughly as fast as someone discovering keyboards for the first time';
  if (wpm < 70) return 'moderately impressive, like finding your car keys on the first try';
  if (wpm < 90) return 'faster than the average office worker pretending to be productive';
  if (wpm < 110) return 'alarmingly fast, suggesting a concerning lack of outdoor activities';
  return 'dangerously fast — the keyboard fears you. Please seek help immediately';
}

function drawDivider(ctx: CanvasRenderingContext2D, cx: number, y: number) {
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, y);
  ctx.lineTo(cx - 22, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 22, y);
  ctx.lineTo(820, y);
  ctx.stroke();
  // Diamond
  ctx.fillStyle = '#c9a84c';
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-6, -6, 12, 12);
  ctx.restore();
}

function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const r = 56;
  // Fill
  ctx.fillStyle = 'rgba(122, 92, 16, 0.07)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Outer ring
  ctx.strokeStyle = '#7a5c10';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  // Inner ring
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r - 11, 0, Math.PI * 2);
  ctx.stroke();
  // Circular text
  const label = '• ORDER OF THE MECHANICAL KEYBOARD •';
  ctx.fillStyle = '#7a5c10';
  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < label.length; i++) {
    const angle = (i / label.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.fillText(label[i], 0, -(r - 15));
    ctx.restore();
  }
  ctx.restore();
  // Keyboard icon
  ctx.fillStyle = '#7a5c10';
  ctx.font = '26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('⌨', x, y + 9);
}

function drawSignature(ctx: CanvasRenderingContext2D, cx: number, lineY: number, curves: [number, number, number, number, number, number, number, number][]) {
  ctx.strokeStyle = '#2d1a08';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  curves.forEach(([x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(cx + x1, lineY + y1);
    ctx.bezierCurveTo(cx + cp1x, lineY + cp1y, cx + cp2x, lineY + cp2y, cx + x2, lineY + y2);
    ctx.stroke();
  });
}

export function generateCertificate(result: TestResult): void {
  const W = 900;
  const H = 640;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  const cx = W / 2;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#fef9ee');
  bg.addColorStop(1, '#f4e5c5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle dot texture
  ctx.fillStyle = 'rgba(139, 105, 20, 0.035)';
  for (let px = 0; px < W; px += 18) {
    for (let py = 0; py < H; py += 18) {
      ctx.beginPath();
      ctx.arc(px, py, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Diagonal watermark
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#5a3e1b';
  ctx.font = 'bold 88px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.translate(cx, H / 2 + 30);
  ctx.rotate(-Math.PI / 9);
  ctx.fillText('TYPETESTER', 0, 0);
  ctx.restore();

  // Borders
  ctx.strokeStyle = '#7a5c10';
  ctx.lineWidth = 5;
  ctx.strokeRect(13, 13, W - 26, H - 26);

  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(23, 23, W - 46, H - 46);

  ctx.strokeStyle = '#e8d48a';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // Corner diamonds
  [[13, 13], [W - 13, 13], [13, H - 13], [W - 13, H - 13]].forEach(([x, y]) => {
    ctx.fillStyle = '#7a5c10';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
  });

  // Top label
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7a5c10';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('✦  T Y P E T E S T E R   O F F I C I A L   D O C U M E N T  ✦', cx, 60);

  // Main title
  ctx.fillStyle = '#3a2510';
  ctx.font = 'bold 50px Georgia, serif';
  ctx.fillText('Certificate of Typing', cx, 122);

  ctx.fillStyle = '#7a5c10';
  ctx.font = 'bold 25px Georgia, serif';
  ctx.fillText('A C H I E V E M E N T', cx, 157);

  drawDivider(ctx, cx, 175);

  // Award title
  ctx.fillStyle = '#5a3e1b';
  ctx.font = 'italic 14px Georgia, serif';
  ctx.fillText('The Order of the Mechanical Keyboard hereby solemnly bestows the title of', cx, 202);

  ctx.fillStyle = '#2d1a08';
  ctx.font = 'bold italic 25px Georgia, serif';
  ctx.fillText(`"${getAwardTitle(result.wpm)}"`, cx, 235);

  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 250, 246);
  ctx.lineTo(cx + 250, 246);
  ctx.stroke();

  // Body
  ctx.fillStyle = '#5a3e1b';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('upon this worthy individual, who on this solemn day demonstrated a typing speed of', cx, 270);

  // Big WPM
  ctx.fillStyle = '#7a1515';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText(`${result.wpm} WPM`, cx, 345);

  ctx.fillStyle = '#5a3e1b';
  ctx.font = 'italic 13px Georgia, serif';
  ctx.fillText(getComparison(result.wpm), cx, 368);

  // Stats row
  const modeLabel = result.mode === 'words' ? `${result.duration}s`
    : result.mode === 'zen' ? 'zen'
    : `${result.mode}s`;

  const statsArr = [
    { label: 'RAW WPM', value: String(result.rawWpm) },
    { label: 'ACCURACY', value: `${result.accuracy}%` },
    { label: 'CONSISTENCY', value: `${result.consistency}%` },
    { label: 'MODE', value: modeLabel },
    { label: 'LANGUAGE', value: result.language.toUpperCase() },
  ];

  const colW = (W - 160) / statsArr.length;
  statsArr.forEach((s, i) => {
    const sx = 80 + i * colW + colW / 2;
    ctx.fillStyle = '#9a7320';
    ctx.font = '8.5px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.label, sx, 400);
    ctx.fillStyle = '#2d1a08';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText(s.value, sx, 422);
  });

  drawDivider(ctx, cx, 440);

  // Seal
  drawSeal(ctx, 152, 530);

  // Signature lines
  const sig1X = cx + 30;
  const sig2X = W - 160;
  const sigY = 510;

  ctx.strokeStyle = '#7a5c10';
  ctx.lineWidth = 0.8;
  [[sig1X, 115], [sig2X, 95]].forEach(([sx, half]) => {
    ctx.beginPath();
    ctx.moveTo(sx - half, sigY);
    ctx.lineTo(sx + half, sigY);
    ctx.stroke();
  });

  // Signatures (bezier squiggles)
  drawSignature(ctx, sig1X, sigY, [
    [-52, -7, -28, -26, 8, -10, 30, -22],
    [30, -22, 52, -36, 40, -3, 55, -2],
    [-22, -9, -10, -22, 12, -14, 20, -5],
  ]);
  drawSignature(ctx, sig2X, sigY, [
    [-48, -8, -20, -24, 12, -7, 32, -20],
    [32, -20, 52, -34, 42, -1, 50, -4],
    [-30, -5, -5, -20, 15, -12, 28, -8],
  ]);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#5a3e1b';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText('The Ghost of Home Row', sig1X, sigY + 16);
  ctx.fillStyle = '#9a7320';
  ctx.font = '8px "Courier New", monospace';
  ctx.fillText('CHIEF TYPING EXAMINER', sig1X, sigY + 30);

  ctx.fillStyle = '#5a3e1b';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText('Ctrl+Alt+Delete', sig2X, sigY + 16);
  ctx.fillStyle = '#9a7320';
  ctx.font = '8px "Courier New", monospace';
  ctx.fillText('SECRETARY OF KEYBOARD AFFAIRS', sig2X, sigY + 30);

  // Date
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillStyle = '#9a7320';
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(dateStr, cx - 20, 478);

  // Disclaimer
  ctx.fillStyle = 'rgba(90, 62, 27, 0.35)';
  ctx.font = '8px "Courier New", monospace';
  ctx.fillText('* This certificate carries no legal standing and was generated by a JavaScript function at an unreasonable hour.', cx, 610);

  // Download
  const link = document.createElement('a');
  link.download = `typing-certificate-${result.wpm}wpm.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

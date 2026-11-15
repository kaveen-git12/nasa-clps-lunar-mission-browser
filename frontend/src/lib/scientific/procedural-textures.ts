import * as THREE from "three";

/**
 * Creates a procedural Earth canvas texture with realistic continents, oceans, and ice caps.
 */
export function createEarthTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, "#08214d");
  oceanGrad.addColorStop(0.5, "#0b2b63");
  oceanGrad.addColorStop(1, "#08214d");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Continents approximate shapes (Africa, Eurasia, Americas, Australia, Antarctica)
  ctx.fillStyle = "#2d5a27"; // Vegetation / land green-brown

  // North America
  ctx.beginPath();
  ctx.ellipse(width * 0.22, height * 0.3, width * 0.12, height * 0.16, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // South America
  ctx.beginPath();
  ctx.ellipse(width * 0.3, height * 0.65, width * 0.08, height * 0.18, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Europe & Asia
  ctx.beginPath();
  ctx.ellipse(width * 0.62, height * 0.32, width * 0.18, height * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Africa
  ctx.beginPath();
  ctx.ellipse(width * 0.52, height * 0.52, width * 0.1, height * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Australia
  ctx.beginPath();
  ctx.ellipse(width * 0.82, height * 0.7, width * 0.06, height * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Polar ice caps
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height * 0.08); // North Pole ice
  ctx.fillRect(0, height * 0.92, width, height * 0.08); // Antarctica

  // Cloud bands
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  for (let i = 0; i < 8; i++) {
    const y = height * (0.15 + i * 0.1);
    ctx.beginPath();
    ctx.ellipse(width * 0.5, y, width * 0.5, height * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a procedural Moon canvas texture with highlands, dark lunar maria, and ray craters.
 */
export function createMoonTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Base lunar highlands gray
  ctx.fillStyle = "#8a8d91";
  ctx.fillRect(0, 0, width, height);

  // Fine regolith noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Dark Lunar Maria (Mare Imbrium, Oceanus Procellarum, Mare Tranquillitatis, etc.)
  const maria = [
    { x: 0.38, y: 0.35, rx: 0.14, ry: 0.12 }, // Oceanus Procellarum
    { x: 0.48, y: 0.32, rx: 0.09, ry: 0.08 }, // Mare Imbrium
    { x: 0.58, y: 0.38, rx: 0.08, ry: 0.07 }, // Mare Serenitatis
    { x: 0.64, y: 0.44, rx: 0.09, ry: 0.07 }, // Mare Tranquillitatis
    { x: 0.72, y: 0.38, rx: 0.06, ry: 0.07 }, // Mare Crisium
    { x: 0.56, y: 0.58, rx: 0.08, ry: 0.07 }, // Mare Nectaris
  ];

  ctx.fillStyle = "rgba(45, 48, 52, 0.75)";
  maria.forEach((m) => {
    ctx.beginPath();
    ctx.ellipse(width * m.x, height * m.y, width * m.rx, height * m.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // South Pole crater concentration (Tycho, Clavius, Shackleton)
  ctx.fillStyle = "rgba(220, 225, 230, 0.85)";
  // Tycho crater and rays
  const tychoX = width * 0.46;
  const tychoY = height * 0.74;
  ctx.beginPath();
  ctx.arc(tychoX, tychoY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Ray streaks
  ctx.strokeStyle = "rgba(240, 245, 255, 0.25)";
  ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += 0.3) {
    ctx.beginPath();
    ctx.moveTo(tychoX, tychoY);
    ctx.lineTo(tychoX + Math.cos(a) * 120, tychoY + Math.sin(a) * 120);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a glowing sun corona particle sprite texture.
 */
export function createSunCoronaTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.2, "rgba(255, 230, 130, 0.9)");
  grad.addColorStop(0.5, "rgba(255, 150, 40, 0.4)");
  grad.addColorStop(0.8, "rgba(255, 80, 0, 0.15)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

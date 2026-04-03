import * as THREE from 'three';
import gsap from 'gsap';

// --- Configuration ---
const CONFIG = {
  numItems: 800,
  itemWidth: 1.5, // Base width
  itemHeight: 9, // 1:6 aspect ratio
  radius: 60, // Base radius of the cylinder
  rings: 12,  // How many horizontal 'rings' of items
  radiusVariation: 25, // Depth variation
};

// --- Setup ---
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.012); // Ambient dark fog

// Enhanced camera setup to look from the center of the cylinder
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- Create Canvas Texture for Text ---
function createTextTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 768; // 1:6 ratio
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border (optional, for aesthetics)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width-4, canvas.height-4);

  // Text Style
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 50px "Futura PT", "Futura", "Trebuchet MS", sans-serif'; 
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '5px'; // HTML5 canvas supports letter-spacing natively in modern browsers

  // We want the text to read top-to-bottom or be rotated.
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 2); // Rotate text to run along the length of the 1:6 frame
  ctx.fillText(text, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter; // good quality
  return texture;
}

const textTexture = createTextTexture('KWON HYUK BIN');

// --- Instanced Mesh for 800 items (1:6 format) ---
const geometry = new THREE.PlaneGeometry(CONFIG.itemWidth, CONFIG.itemHeight);
const material = new THREE.MeshBasicMaterial({ 
  map: textTexture,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.95
});

const instancedMesh = new THREE.InstancedMesh(geometry, material, CONFIG.numItems);
scene.add(instancedMesh);

// --- Layout Logic (Cylindrical Distribution) ---
const dummy = new THREE.Object3D();
const itemsPerRing = Math.ceil(CONFIG.numItems / CONFIG.rings);

for (let i = 0; i < CONFIG.numItems; i++) {
  const ringIndex = Math.floor(i / itemsPerRing);
  const itemIndexInRing = i % itemsPerRing;
  
  // Arrange items in a full circle around the Y axis
  const angle = (itemIndexInRing / itemsPerRing) * Math.PI * 2;
  
  // Randomize radius to create a 'scattered' spatial feel
  const r = CONFIG.radius + (Math.random() - 0.5) * CONFIG.radiusVariation;
  
  // Vertical distribution
  const ySpacing = CONFIG.itemHeight * 1.8;
  const yOffset = (ringIndex - CONFIG.rings / 2) * ySpacing;
  const y = yOffset + (Math.random() - 0.5) * ySpacing * 0.5;

  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;

  dummy.position.set(x, y, z);
  
  // Plane normals face the camera origin
  dummy.lookAt(0, y, 0);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
  
  // Greyscale/Subtle color variations (Tinting the texture)
  const color = new THREE.Color();
  // Using higher lightness so the white text remains highly visible
  color.setHSL(0, 0, 0.6 + Math.random() * 0.4); 
  instancedMesh.setColorAt(i, color);
}

instancedMesh.instanceMatrix.needsUpdate = true;
if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

// --- Interaction / Navigation ---
let targetRotationX = 0;
let targetRotationY = 0;
let targetY = 0;
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Scroll to move up/down the cylinder
window.addEventListener('wheel', (e) => {
  targetY -= e.deltaY * 0.08;
  const maxHold = (CONFIG.rings * CONFIG.itemHeight * 1.8) / 2;
  targetY = Math.max(-maxHold, Math.min(maxHold, targetY));
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // Smoothly rotate the camera based on mouse (look around effect)
  camera.rotation.y += (-mouseX * Math.PI * 0.25 - camera.rotation.y) * 0.05;
  camera.rotation.x += (mouseY * Math.PI * 0.1 - camera.rotation.x) * 0.05;
  
  // Slowly rotate the entire gallery for atmospheric idle motion
  instancedMesh.rotation.y = time * 0.015;

  // Smooth vertical scroll
  camera.position.y += (targetY - camera.position.y) * 0.05;

  renderer.render(scene, camera);
}
animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Intro Sequence ---
const enterBtn = document.getElementById('enter-button');
const introScreen = document.getElementById('intro-screen');

enterBtn.addEventListener('click', () => {
  introScreen.style.opacity = '0';
  setTimeout(() => introScreen.remove(), 1000);
  
  // Ascend into the gallery
  gsap.from(camera.position, {
    y: -CONFIG.rings * CONFIG.itemHeight,
    duration: 4,
    ease: "power3.inOut"
  });
});

import * as THREE from 'three';
import {OrbitControls, ThreeMFLoader} from 'three/examples/jsm/Addons.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enablePan = false;
orbit.enableZoom = false;
orbit.minPolarAngle = 0.7;
orbit.maxPolarAngle = 0.7;
orbit.enableDamping = false;

const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
scene.add(directionalLight);

const grassTexture = new THREE.TextureLoader().load('./assets/GolfGrass.jpg');
const woodTexture = new THREE.TextureLoader().load('./assets/Wood.avif');
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  './assets/PixelSky.png',
  './assets/PixelSky.png',
  './assets/PixelSky.png',
  './assets/PixelSky.png',
  './assets/PixelSky.png',
  './assets/PixelSky.png'
]);

const ballGeometry = new THREE.SphereGeometry(0.5);
const ballMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(ball);

//new shape edit 
//boundary of the golf course
const floorMaterial = new THREE.MeshStandardMaterial({color: 0x00C400, map: grassTexture, side: THREE.DoubleSide});
const wallMaterial = new THREE.MeshStandardMaterial({color: 0x9A7B4F, map: woodTexture}); // A brown color

// L-shaped floor made of two parts
const floorGeometry1 = new THREE.BoxGeometry(10, 0.2, 20);
const floor1 = new THREE.Mesh(floorGeometry1, floorMaterial);
scene.add(floor1);

const floorGeometry2 = new THREE.BoxGeometry(10, 0.2, 10);
const floor2 = new THREE.Mesh(floorGeometry2, floorMaterial);
floor2.position.set(10, 0, -5); // Position it next to the first part
scene.add(floor2);

// Walls around the floor

// Array to hold our wall meshes for collision detection
const walls = [];

// Wall properties: [width, height, depth, x, y, z]
const wallProperties = [
    // Outer walls
    [10, 2, 1, 0, 1, 10.5],   // Back wall
    [1, 2, 20, -5.5, 1, 0],   // Left wall
    [21, 2, 1, 5, 1, -10.5],  // Bottom wall
    [1, 2, 10, 15.5, 1, -5],  // Right wall (bottom part)
    // Inner corner walls
    [1, 2, 10, 5.5, 1, 5],    // Inner wall (vertical part)
    [10, 2, 1, 10, 1, 0.5]     // Inner wall (horizontal part)
];

wallProperties.forEach(props => {
    const wallGeometry = new THREE.BoxGeometry(props[0], props[1], props[2]);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(props[3], props[4], props[5]);
    scene.add(wall);
    walls.push(wall); // Add to our array for collision checks
});

//other shapes required 
const holePosition = new THREE.Vector3(12, 0.1, -8); // Set the hole's location

// The Hole
const holeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const hole = new THREE.Mesh(holeGeometry, holeMaterial);
hole.position.copy(holePosition);
scene.add(hole);

// The Flag
const flagGroup = new THREE.Group();

const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
const poleMaterial = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });
const pole = new THREE.Mesh(poleGeometry, poleMaterial);
pole.position.set(0, 1.5, 0); // Position relative to the group
flagGroup.add(pole);

const flagGeometry = new THREE.PlaneGeometry(1, 0.75);
const flagMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000, side: THREE.DoubleSide });
const flag = new THREE.Mesh(flagGeometry, flagMaterial);
flag.position.set(0.5, 2.5, 0); // Position relative to the group
flagGroup.add(flag);

// Position the entire flag group at the hole's location
flagGroup.position.copy(holePosition);
scene.add(flagGroup);

ball.position.set(0, 0.5, 7);
ball.lookAt(0,0.5,0);
camera.position.set(-5, 10, -5);

//const axesHelper = new THREE.AxesHelper(3);
//scene.add(axesHelper);

renderer.setClearColor(0x87CEEB);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Power meter variables
let powerMeter = { isCharging: false, startTime: 0, maxPower: 0.5, minPower: 0.1 };
const powerMeterElement = document.createElement('div');
powerMeterElement.style.position = 'absolute';
powerMeterElement.style.bottom = '20px';
powerMeterElement.style.left = '50%';
powerMeterElement.style.transform = 'translateX(-50%)';
powerMeterElement.style.width = '200px';
powerMeterElement.style.height = '30px';
powerMeterElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
powerMeterElement.style.borderRadius = '15px';
powerMeterElement.style.overflow = 'hidden';
powerMeterElement.style.display = 'none';

document.body.appendChild(powerMeterElement);

const powerMeterFill = document.createElement('div');
powerMeterFill.style.height = '100%';
powerMeterFill.style.width = '0%';
powerMeterFill.style.backgroundColor = '#4CAF50';
powerMeterFill.style.transition = 'width 0.1s';
powerMeterElement.appendChild(powerMeterFill);

ball.name = "ball";

// Mouse down event
document.addEventListener('mousedown', onBallMouseDown);

// Mouse up event
document.addEventListener('mouseup', onMouseUp);

// Mouse leave event
document.addEventListener('mouseleave', onMouseUp);

function onBallMouseDown(e) {
  if (temp === 0) {
    // compute mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject(ball, false);

    if (intersects.length > 0) {
      e.stopPropagation();
      powerMeter.isCharging = true;
      powerMeter.startTime = Date.now();
      powerMeterElement.style.display = 'block';
      // disable orbit controls while charging to prevent accidental camera movement
      if (orbit) orbit.enabled = false;
      updatePowerMeter();
    }
  }
}

function onMouseUp(e) {
  if (powerMeter.isCharging) {
    powerMeter.isCharging = false;
    const holdTime = Date.now() - powerMeter.startTime;
    // Cap the hold time to 1 second for max power
    const power = Math.min(holdTime / 1000, 1) * (powerMeter.maxPower - powerMeter.minPower) + powerMeter.minPower;
    ballMove(power);
    powerMeterElement.style.display = 'none';
    powerMeterFill.style.width = '0%';
    // re-enable orbit controls after charging
    if (orbit) orbit.enabled = true;
  }
}

function updatePowerMeter() {
  if (!powerMeter.isCharging) return;
  
  const elapsed = Date.now() - powerMeter.startTime;
  const progress = Math.min(elapsed / 1000, 1); // Cap at 1 second for max power
  const power = progress * 100;
  
  // Change color based on power level
  if (progress < 0.5) {
    powerMeterFill.style.backgroundColor = '#4CAF50'; // Green
  } else if (progress < 0.8) {
    powerMeterFill.style.backgroundColor = '#FFC107'; // Yellow
  } else {
    powerMeterFill.style.backgroundColor = '#F44336'; // Red
  }
  
  powerMeterFill.style.width = `${power}%`;
  
  if (powerMeter.isCharging) {
    requestAnimationFrame(updatePowerMeter);
  }
}

let newpos = new THREE.Vector3();

let temp = 0;
let direction = new THREE.Vector3();
let speed = 0;
let friction = 0;
let strokeCount = 0; //for stroke counting

function ballMove(power) {
  temp = 1;
  ball.getWorldDirection(direction);
  speed = power; // Use the calculated power for speed
  friction = 0.01; // Increased friction for better control

  //for the strokes
  strokeCount++;
  document.getElementById('scorecard').innerText = `Strokes: ${strokeCount}`;
}

//collision detection and response
//collision detection and response
function checkCollisions() {
    const ballBoundingBox = new THREE.Box3().setFromObject(ball);

    for (const wall of walls) {
        const wallBoundingBox = new THREE.Box3().setFromObject(wall);

        if (ballBoundingBox.intersectsBox(wallBoundingBox)) {
            const ballCenter = new THREE.Vector3();
            ballBoundingBox.getCenter(ballCenter);

            const wallCenter = new THREE.Vector3();
            wallBoundingBox.getCenter(wallCenter);
            
            const wallSize = new THREE.Vector3();
            wallBoundingBox.getSize(wallSize);

            // Calculate how much the ball is overlapping with the wall on each axis
            const overlapX = (ball.geometry.parameters.radius + wallSize.x / 2) - Math.abs(ballCenter.x - wallCenter.x);
            const overlapZ = (ball.geometry.parameters.radius + wallSize.z / 2) - Math.abs(ballCenter.z - wallCenter.z);
            
            // Bounce the ball off the axis with the LEAST overlap, which is the side it hit.
            if (overlapX < overlapZ) {
                direction.x = -direction.x;
            } else {
                direction.z = -direction.z;
            }
            
            // A small push to prevent getting stuck in the wall
            const push = direction.clone().multiplyScalar(0.01);
            ball.position.add(push);

            return; // Exit after the first collision to prevent multiple bounces in one frame
        }
    }
}

function moveBall () {
  checkCollisions();
  const displacement = new THREE.Vector3();
  displacement.copy(direction).multiplyScalar(speed);
  displacement.add(ball.position);
  ball.position.copy(displacement);
  speed = speed - friction;
  //console.log(speed);
  if (speed <= 0) {
    speed = 0;
    temp = 0;
  }
}

function UpdateCamera() {
  const direction = new THREE.Vector3();
  ball.getWorldDirection(direction);
  const displacement = new THREE.Vector3();
  const offset = -5;
  displacement.copy(direction).multiplyScalar(offset);
  newpos = displacement.add(ball.position);
  newpos.y = 10;
  camera.position.copy(newpos);
}

function ballLookAt() {
  ball.lookAt(camera.position.x, 0.5, camera.position.z);
  ball.rotateY(Math.PI);
}

UpdateCamera();

function animate() {
  requestAnimationFrame(animate);
  orbit.target = ball.position;

  if (temp === 1) {
    moveBall();
    UpdateCamera();
  } else {
    ballLookAt();
  }

  // Add this win condition check
  const distanceToHole = ball.position.distanceTo(holePosition);
  if (distanceToHole < 0.9 && speed < 0.1) {
    speed = 0;
    ball.position.copy(hole.position);
    alert(`You finished in ${strokeCount} strokes!`);
    // Reset for the next level (or stop the game)
    ball.position.set(0, 0.5, 7); // Move ball back to start
    ball.lookAt(0,0.5,0);
    UpdateCamera();
    strokeCount = 0;
    document.getElementById('scorecard').innerText = `Strokes: ${strokeCount}`;
  }

  orbit.update();
  renderer.render(scene, camera);
}
animate();
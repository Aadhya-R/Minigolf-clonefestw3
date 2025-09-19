import * as THREE from 'three';
//import {Tween, Easing} from '@tweenjs/tween.js';
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

const ballGeometry = new THREE.SphereGeometry(0.5);
const ballMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(ball);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({color: 0x00C400, side: THREE.DoubleSide});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;

ball.position.set(0, 0.5, 0);
camera.position.set(-5, 10, -5);

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

renderer.setClearColor(0x87CEEB);

const raycaster = new THREE.Raycaster();
document.addEventListener('mousedown', onClick);

ball.name = "ball";

function onClick(e) {
  const coords = new THREE.Vector2(
    (e.clientX/window.innerWidth) * 2 - 1,
    -(e.clientY/window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(coords, camera);
  const intersections = raycaster.intersectObjects(scene.children, true);
  if (intersections.length > 0) {
    const selectedObject = intersections[0].object;
    if (selectedObject.name === "ball") {
      if (temp === 0) {
        ballMove(selectedObject);
      }
    }
  }
}

let newpos = new THREE.Vector3();
let moveTween = new Tween(ball.position)
    .to(newpos, 1000)

let temp = 0;
let direction = new THREE.Vector3();
let speed = 0;
let friction = 0;

function ballMove(ball) {
  temp = 1;
  ball.getWorldDirection(direction);
  speed = 0.5;
  friction = 0.005;
}

function moveBall () {
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

function UpdateCamera(time) {
  const direction = new THREE.Vector3();
  ball.getWorldDirection(direction);
  const displacement = new THREE.Vector3();
  const offset = -5;
  displacement.copy(direction).multiplyScalar(offset);
  newpos = displacement.add(ball.position);
  newpos.y = 10;
  camera.position.copy(newpos);
}

function ballLookAt(time) {
  ball.lookAt(camera.position.x, 0.5, camera.position.z);
  ball.rotateY(Math.PI);
}

function animate(time) {
  requestAnimationFrame(animate);
  orbit.target = ball.position;
  
  if (temp === 1) {
    UpdateCamera(time);
    moveBall();
  }
  else {
    ballLookAt(time);
  }

  orbit.update();
  
  renderer.render(scene, camera);
}
animate();
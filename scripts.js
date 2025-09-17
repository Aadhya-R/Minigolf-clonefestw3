import * as THREE from 'three';
import {Tween, Easing} from '@tweenjs/tween.js';
import {OrbitControls, ThreeMFLoader} from 'three/examples/jsm/Addons.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enablePan = false;
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

ball.position.set(8, 0.5, 3);

camera.position.set(ball.position.x - 5, 5, ball.position.z - 5);

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

renderer.setClearColor(0x87CEEB);

const raycaster = new THREE.Raycaster();
document.addEventListener('mousedown', onClick);

ball.name = "ball";

function onClick(e) {
  const coords = new THREE.Vector2(
    ((e.clientX/window.innerWidth) * 2 - 1),
    -(e.clientY/window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(coords, camera);
  const intersections = raycaster.intersectObjects(scene.children, true);
  if (intersections.length > 0) {
    console.log(intersections);
    const selectedObject = intersections[0].object;
    if (selectedObject.name === "ball") {
      //selectedObject.position.set(Math.random()*10, 0.5, Math.random()*10);
      ballMove(selectedObject);
      camera.position.set(ball.position.x - 5, 5, ball.position.z - 5);
    }
  }
}

let newpos = new THREE.Vector3();
let moveTween = new Tween(ball.position)
    .to(newpos, 1000)

let temp = 0;

function ballMove(ball) {
  temp = 1;
  ball.lookAt(camera.position.x, 0.5, camera.position.z);
  const direction = new THREE.Vector3();
  ball.getWorldDirection(direction);
  console.log(direction);
  direction.x = -direction.x;
  direction.z = -direction.z;
  const displacement = new THREE.Vector3();
  const offset = 5;
  displacement.copy(direction).multiplyScalar(offset);
  newpos = displacement.add(ball.position);
  moveTween = new Tween(ball.position)
    .to(newpos, 1000)
  moveTween.start();
  moveTween.onComplete(setTemp)
  console.log(temp)
}

function setTemp() {
  temp = 0;
  console.log(temp)
}

function animate() {
  requestAnimationFrame(animate);
  orbit.target = ball.position;
  if (temp === 1) {
    camera.position.set(ball.position.x - 5, 5, ball.position.z - 5);
  }
  moveTween.update();
  orbit.update();
  renderer.render(scene, camera);
}
//renderer.setAnimationLoop(animate);
animate();

console.log("Hello World")
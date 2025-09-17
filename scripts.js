import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/Addons.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const orbit = new OrbitControls(camera, renderer.domElement);

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

camera.position.set(0, 2, 5);
orbit.update();

ball.position.set(0, 0.5, 0);

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

function animate() {
  renderer.render( scene, camera );
}
renderer.setAnimationLoop(animate);

console.log("Hello World")
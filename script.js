import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.131.3/build/three.module.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQpVNR3Bw2y-gsopI0f9aZFOIvfgw3tc0",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database().ref("iss/location");

// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load Textures
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("assets/earth_texture.jpg");
const issTexture = textureLoader.load("assets/iss_vector.png");

// Create Earth
const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshStandardMaterial({ map: earthTexture }));
scene.add(earth);

// Create ISS Marker
const iss = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ map: issTexture }));
scene.add(iss);

// Lighting
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Camera Position
camera.position.z = 5;

// Update ISS Position
dbRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const lat = parseFloat(data.latitude);
    const lon = parseFloat(data.longitude);

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    iss.position.x = 2 * Math.sin(phi) * Math.cos(theta);
    iss.position.y = 2 * Math.cos(phi);
    iss.position.z = 2 * Math.sin(phi) * Math.sin(theta);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.001;
    renderer.render(scene, camera);
}
animate();

// Handle Window Resizing
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

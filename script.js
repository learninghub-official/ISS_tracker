
const THREE = window.THREE;

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOURAPIKEY",
    databaseURL: "https://YOURFIREBASEURL.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database().ref("iss/location");

// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load Textures
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("assets/earth_texture.jpg");
const issTexture = textureLoader.load("assets/iss_vector.png");

// Create Earth
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshStandardMaterial({ map: earthTexture })
);
scene.add(earth);

// Create ISS as a 2D Plane (Not a Sphere)
const issOrbitRadius = 2.5; // Distance from Earth's center
const issGeometry = new THREE.PlaneGeometry(0.5, 0.3); // Width, Height
const issMaterial = new THREE.MeshBasicMaterial({ map: issTexture, transparent: true, side: THREE.DoubleSide });
const iss = new THREE.Mesh(issGeometry, issMaterial);
scene.add(iss);

// Lighting
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Camera Position
camera.position.z = 6;

// Create a div to show ISS real-time coordinates
const infoDiv = document.createElement("div");
infoDiv.style.position = "absolute";
infoDiv.style.top = "10px";
infoDiv.style.left = "10px";
infoDiv.style.color = "white";
infoDiv.style.padding = "10px";
infoDiv.style.background = "rgba(0,0,0,0.5)";
infoDiv.style.fontSize = "14px";
infoDiv.innerHTML = "Fetching ISS Coordinates...";
document.body.appendChild(infoDiv);

// Variables for ISS Revolution
let theta = 0;

// Fetch ISS Real-Time Coordinates (Only for Display)
dbRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const lat = parseFloat(data.latitude);
    const lon = parseFloat(data.longitude);

    // Update only the info div (No effect on position)
    infoDiv.innerHTML = `ISS Coordinates:<br>Latitude: ${lat}<br>Longitude: ${lon}`;
});

// Animation Loop for ISS Orbit
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate Earth
    earth.rotation.y += 0.001;

    // Make ISS revolve perfectly around Earth's middle
    theta += 0.01; // Adjust speed of revolution
    iss.position.x = issOrbitRadius * Math.sin(theta);
    iss.position.z = issOrbitRadius * Math.cos(theta);
    iss.position.y = 0; // Always orbit in the middle (equator)

    // Make ISS face the camera
    iss.lookAt(camera.position);

    renderer.render(scene, camera);
}
animate();

// Handle Window Resizing
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

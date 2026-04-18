const Config = {
    scene: null,
    camera: null,
    renderer: null,
    maxAnisotropy: 1,
    assets: {
        earth: null,
        moon: null,
        clouds: null,
        stars: null
    },
    fps: {
        count: 0,
        frames: 0,
        lastTime: performance.now(),
        display: document.getElementById("fps")
    }
};

function initScene() {
    Config.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );

    Config.camera.position.z = 4;

    Config.renderer = new THREE.WebGLRenderer({ antialias: true });
    Config.renderer.setSize(window.innerWidth, window.innerHeight);
    Config.renderer.setPixelRatio(window.devicePixelRatio);

    Config.renderer.domElement.id = "earthCanvas";
    document.body.prepend(Config.renderer.domElement);

    Config.scene = new THREE.Scene();
    Config.maxAnisotropy = Config.renderer.capabilities.getMaxAnisotropy();
}

function setupLights() {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(5, 3, 5);
    Config.scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    Config.scene.add(ambientLight);
}

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 2000;
        starPositions[i + 1] = (Math.random() - 0.5) * 2000;
        starPositions[i + 2] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    Config.scene.add(stars);
    Config.assets.stars = stars;
}

const textureLoader = new THREE.TextureLoader();

function loadTexture(url) {
    return new Promise((resolve, reject) => {
        textureLoader.load(
            url,
            (texture) => {
                texture.anisotropy = Math.min(16, Config.maxAnisotropy);
                resolve(texture);
            },
            undefined,
            reject
        );
    });
}

function loadShader(url) {
    return fetch(url).then(r => r.text());
}

async function createEarth(vertexShader, fragmentShader) {
    const earthTexture = await loadTexture(
        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
    );

    const geometry = new THREE.SphereGeometry(1, 80, 80);

    const material = new THREE.MeshStandardMaterial({
        map: earthTexture,
        bumpMap: earthTexture,
        bumpScale: 0.05,
        metalness: 0,
        roughness: 0.8
    });

    const earth = new THREE.Mesh(geometry, material);
    Config.scene.add(earth);
    Config.assets.earth = earth;

    createAtmosphere(earth, vertexShader, fragmentShader);
    createHalo(earth);
    await createClouds(earth);
}

function createAtmosphere(parentMesh, vertexShader, fragmentShader) {
    const geometry = new THREE.SphereGeometry(1.15, 64, 64);

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
    });

    const atmosphere = new THREE.Mesh(geometry, material);
    parentMesh.add(atmosphere);
}

function createHalo(parentMesh) {
    const geometry = new THREE.SphereGeometry(1.01, 80, 80);

    const material = new THREE.MeshBasicMaterial({
        color: 0x1f3fff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        depthWrite: false
    });

    const halo = new THREE.Mesh(geometry, material);
    parentMesh.add(halo);
}

async function createClouds(parentMesh) {
    const cloudTexture = await loadTexture(
        "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
    );

    const geometry = new THREE.SphereGeometry(1.02, 64, 64);

    const material = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        alphaMap: cloudTexture,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending,
        shininess: 5
    });

    const clouds = new THREE.Mesh(geometry, material);
    parentMesh.add(clouds);
    Config.assets.clouds = clouds;
}

async function createMoon() {
    const moonTexture = await loadTexture(
        "https://threejs.org/examples/textures/planets/moon_1024.jpg"
    );

    const geometry = new THREE.SphereGeometry(0.27, 40, 40);

    const material = new THREE.MeshPhongMaterial({
        map: moonTexture,
        shininess: 5
    });

    const moon = new THREE.Mesh(geometry, material);
    moon.position.x = 3;

    Config.scene.add(moon);
    Config.assets.moon = moon;
}

function updateFPS() {
    Config.fps.frames++;
    const now = performance.now();

    if (now - Config.fps.lastTime >= 1000) {
        Config.fps.count = Config.fps.frames;
        Config.fps.frames = 0;
        Config.fps.lastTime = now;

        if (Config.fps.display) {
            Config.fps.display.textContent = `FPS: ${Config.fps.count}`;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (Config.assets.earth) Config.assets.earth.rotation.y += 0.002;
    if (Config.assets.clouds) Config.assets.clouds.rotation.y += 0.0025;

    if (Config.assets.moon) {
        const t = Date.now() * 0.0003;
        Config.assets.moon.position.x = Math.cos(t) * 3;
        Config.assets.moon.position.z = Math.sin(t) * 3;
    }

    if (Config.assets.stars) {
        Config.assets.stars.material.size =
            0.8 + Math.sin(Date.now() * 0.002) * 0.3;
    }

    updateFPS();
    Config.renderer.render(Config.scene, Config.camera);
}

function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    Config.camera.aspect = w / h;
    Config.camera.updateProjectionMatrix();
    Config.renderer.setSize(w, h);
}

window.addEventListener("resize", onWindowResize);

window.addEventListener("beforeunload", () => {
    Config.renderer.dispose();
});

async function main() {
    initScene();
    setupLights();
    createStars();

    const [vertexShader, fragmentShader] = await Promise.all([
        loadShader("source/shaders/atmosphere.vert"),
        loadShader("source/shaders/atmosphere.frag")
    ]);

    await Promise.all([
        createEarth(vertexShader, fragmentShader),
        createMoon()
    ]);

    animate();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
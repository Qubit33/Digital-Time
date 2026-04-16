// ═══════════════════════════════════════════════════════════════
// 🌍 SISTEMA 3D - TERRA, LUA E ESTRELAS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 📊 CONFIGURAÇÃO GLOBAL
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// 🎬 INICIALIZAR CENA
// ═══════════════════════════════════════════════════════════════
function initScene() {
    // 📷 Câmera
    Config.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    Config.camera.position.z = 4;

    // 🎨 Renderer
    Config.renderer = new THREE.WebGLRenderer({ antialias: true });
    Config.renderer.setSize(window.innerWidth, window.innerHeight);
    Config.renderer.setPixelRatio(window.devicePixelRatio);

Config.renderer.domElement.id = "earthCanvas";
document.body.prepend(Config.renderer.domElement); // 🔥 melhor que append

    // 📜 Cena
    Config.scene = new THREE.Scene();
    Config.maxAnisotropy = Config.renderer.capabilities.getMaxAnisotropy();

    console.log("✅ Cena inicializada");
}

// ═══════════════════════════════════════════════════════════════
// 💡 ADICIONAR LUZES
// ═══════════════════════════════════════════════════════════════
function setupLights() {
    // ☀️ Luz direcional (Sol)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(5, 3, 5);
    Config.scene.add(sunLight);

    // 🌍 Luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    Config.scene.add(ambientLight);

    console.log("✅ Luzes adicionadas");
}

// ═══════════════════════════════════════════════════════════════
// ⭐ CRIAR ESTRELAS
// ═══════════════════════════════════════════════════════════════
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 2000;     // X
        starPositions[i + 1] = (Math.random() - 0.5) * 2000; // Y
        starPositions[i + 2] = (Math.random() - 0.5) * 2000; // Z
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

    console.log("✅ Estrelas criadas");
}

// ═══════════════════════════════════════════════════════════════
// 📥 CARREGADOR DE ARQUIVOS
// ═══════════════════════════════════════════════════════════════
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
            (error) => {
                console.error(`❌ Erro ao carregar textura: ${url}`, error);
                reject(error);
            }
        );
    });
}

function loadShader(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .catch(error => {
            console.error(`❌ Erro ao carregar shader: ${url}`, error);
            throw error;
        });
}

// ═══════════════════════════════════════════════════════════════
// 🌍 CRIAR TERRA
// ═══════════════════════════════════════════════════════════════
async function createEarth(vertexShader, fragmentShader) {
    try {
        const earthTexture = await loadTexture(
            "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
        );

        // Geometria
        const geometry = new THREE.SphereGeometry(1, 80, 80);

        // Material
        const material = new THREE.MeshStandardMaterial({
            map: earthTexture,
            bumpMap: earthTexture,
            bumpScale: 0.05,
            metalness: 0.0,
            roughness: 0.8
        });

        const earth = new THREE.Mesh(geometry, material);
        Config.scene.add(earth);
        Config.assets.earth = earth;

        // 🎆 Adicionar atmosfera
        createAtmosphere(earth, vertexShader, fragmentShader);

        // 💫 Adicionar halo
        createHalo(earth);

        // ☁️ Adicionar nuvens
        await createClouds(earth);

        console.log("✅ Terra criada com sucesso");
    } catch (error) {
        console.error("❌ Erro ao criar Terra:", error);
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎆 CRIAR ATMOSFERA (SHADER)
// ═══════════════════════════════════════════════════════════════
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

    console.log("✅ Atmosfera adicionada");
}

// ═══════════════════════════════════════════════════════════════
// 💫 CRIAR HALO SUTIL
// ═══════════════════════════════════════════════════════════════
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

    console.log("✅ Halo adicionado");
}

// ═══════════════════════════════════════════════════════════════
// ☁️ CRIAR NUVENS
// ═══════════════════════════════════════════════════════════════
async function createClouds(parentMesh) {
    try {
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

        console.log("✅ Nuvens criadas");
    } catch (error) {
        console.error("❌ Erro ao criar nuvens:", error);
    }
}

// ═══════════════════════════════════════════════════════════════
// 🌙 CRIAR LUA
// ═══════════════════════════════════════════════════════════════
async function createMoon() {
    try {
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

        console.log("✅ Lua criada");
    } catch (error) {
        console.error("❌ Erro ao criar Lua:", error);
    }
}

// ═══════════════════════════════════════════════════════════════
// 📊 CALCULAR E EXIBIR FPS
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// 🎬 LOOP DE ANIMAÇÃO
// ═══════════════════════════════════════════════════════════════
function animate() {
    requestAnimationFrame(animate);

    // 🌍 Rotação da Terra
    if (Config.assets.earth) {
        Config.assets.earth.rotation.y += 0.002;
    }

    // ☁️ Rotação das nuvens (mais rápido)
    if (Config.assets.clouds) {
        Config.assets.clouds.rotation.y += 0.0025;
    }

    // 🌙 Órbita da Lua
    if (Config.assets.moon) {
        const t = Date.now() * 0.0003;
        Config.assets.moon.position.x = Math.cos(t) * 3;
        Config.assets.moon.position.z = Math.sin(t) * 3;
    }

    // ⭐ Pulsação de estrelas
    if (Config.assets.stars) {
        Config.assets.stars.material.size = 0.8 + Math.sin(Date.now() * 0.002) * 0.3;
    }

    updateFPS();
    Config.renderer.render(Config.scene, Config.camera);
}

// ═══════════════════════════════════════════════════════════════
// 📱 RESPONSIVIDADE
// ═══════════════════════════════════════════════════════════════
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    Config.camera.aspect = width / height;
    Config.camera.updateProjectionMatrix();
    Config.renderer.setSize(width, height);
}

window.addEventListener("resize", onWindowResize);

// ═══════════════════════════════════════════════════════════════
// 🧹 LIMPAR AO SAIR
// ═══════════════════════════════════════════════════════════════
window.addEventListener("beforeunload", () => {
    Config.renderer.dispose();
    console.log("✅ Recursos liberados");
});

// ═══════════════════════════════════════════════════════════════
// 🚀 INICIALIZAR APLICAÇÃO
// ═══════════════════════════════════════════════════════════════
async function main() {
    try {
        console.log("🚀 Iniciando aplicação 3D...");

        // 1️⃣ Inicializar cena básica
        initScene();

        // 2️⃣ Configurar luzes
        setupLights();

        // 3️⃣ Criar estrelas
        createStars();

        // 4️⃣ Carregar shaders
        console.log("📥 Carregando shaders...");
        const [vertexShader, fragmentShader] = await Promise.all([
            loadShader("source/shaders/atmosphere.vert"),
            loadShader("source/shaders/atmosphere.frag")
        ]);

        // 5️⃣ Criar objetos 3D
        console.log("🌍 Carregando objetos 3D...");
        await Promise.all([
            createEarth(vertexShader, fragmentShader),
            createMoon()
        ]);

        // 6️⃣ Iniciar animação
        console.log("🎬 Iniciando loop de animação...");
        animate();

        console.log("✅ Aplicação carregada com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao inicializar aplicação:", error);
    }
}

// Iniciar quando DOM estiver pronto
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
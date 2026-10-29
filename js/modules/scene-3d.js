/* ==========================================================
   scene-3d.js
   Latar 3D (three.js): bentuk wireframe, kristal, partikel, asteroid,
   planet, nebula, dan pecahan. Dimuat setelah three.js tersedia.
   Dilewati jika three.js gagal dimuat atau "kurangi gerakan" aktif.

   Jumlah objek di bawah ini sudah diturunkan dari versi asli
   (±70.000 objek) sesuai Opsi A, agar ringan di perangkat biasa.
   Ubah angka di COUNTS untuk menyetel kepadatan.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  const COUNTS = {
    shapes: 120,
    crystals: 300,
    particles: 1500,
    dust: 600,
    gold: 1000,
    asteroids: 450,
    planets: 6,
    nebula: 250,
    megaShards: 750,
    megaGlow: 1250,
    megaRocks: 500,
  };

  const THEME = [
    0xff4fd8, 0x33f2e0, 0x8b6bff, 0xffcb47, 0xff8a3d, 0x3ef2a0, 0x7ad0ff,
    0xffffff, 0x2fd1ff, 0x4dffb0, 0xffe08a, 0xff6bd0, 0x6de8ff, 0xfff2c2,
  ];
  const PLANET_COLORS = [0x33f2e0, 0xff4fd8, 0x8b6bff, 0xffcb47, 0xff8a3d, 0x3ef2a0, 0x7ad0ff];
  const NEBULA_COLORS = [0x33f2e0, 0x8b6bff, 0xff4fd8, 0x3ef2a0];

  const rand = (a, b) => a + Math.random() * (b - a);
  const jitter = (range) => (Math.random() - 0.5) * range;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const TWO_PI = Math.PI * 2;

  App.init3D = () => {
    App.threeReady.then((ok) => {
      if (!ok || App.reduceMotion) return;
      build(window.THREE);
    });
  };

  function makeGlowTexture(THREE) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  function build(THREE) {
    const canvas = document.getElementById('bgWebGL');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(78, window.innerWidth / window.innerHeight, 0.1, 220);
    camera.position.z = 34;

    const rig = new THREE.Group();
    scene.add(rig);

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const dummy = new THREE.Object3D();
    const glowTex = makeGlowTexture(THREE);

    /* ----- Helper ----- */

    // Membuat InstancedMesh dari fungsi pembuat data per instance
    const instanced = (geometry, material, count, make) => {
      const mesh = new THREE.InstancedMesh(geometry, material, count);
      const data = [];
      for (let i = 0; i < count; i++) {
        const d = make(i);
        dummy.position.set(d.x, d.y, d.z);
        dummy.rotation.set(d.rx || 0, d.ry || 0, d.rz || 0);
        dummy.scale.setScalar(d.s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        if (d.color !== undefined) mesh.setColorAt(i, new THREE.Color(d.color));
        data.push(d);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      rig.add(mesh);
      return { mesh, data };
    };

    const setInstance = (mesh, i, x, y, z, rx, ry, rz, s) => {
      dummy.position.set(x, y, z);
      dummy.rotation.set(rx, ry, rz);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    };

    // Titik cahaya (Points) dengan posisi acak di dalam kotak
    const makePoints = ({ count, spread, offsetZ = 0, size, opacity = 1, color, vertexColors = false, blending = THREE.AdditiveBlending }) => {
      const positions = new Float32Array(count * 3);
      const colors = vertexColors ? new Float32Array(count * 3) : null;
      const tmp = new THREE.Color();
      for (let i = 0; i < count; i++) {
        positions[i * 3] = jitter(spread[0]);
        positions[i * 3 + 1] = jitter(spread[1]);
        positions[i * 3 + 2] = jitter(spread[2]) + offsetZ;
        if (colors) {
          tmp.setHex(THEME[i % THEME.length]);
          colors[i * 3] = tmp.r;
          colors[i * 3 + 1] = tmp.g;
          colors[i * 3 + 2] = tmp.b;
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      if (colors) geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const params = {
        size,
        map: glowTex,
        transparent: true,
        opacity,
        vertexColors: !!colors,
        blending,
        depthWrite: false,
        sizeAttenuation: true,
      };
      if (!colors) params.color = color;
      const mat = new THREE.PointsMaterial(params);
      const points = new THREE.Points(geo, mat);
      rig.add(points);
      return points;
    };

    /* ----- Lapisan 1: bentuk wireframe ----- */

    const shapeGeometries = [
      new THREE.IcosahedronGeometry(2.4, 0),
      new THREE.OctahedronGeometry(2.1, 0),
      new THREE.TorusGeometry(1.8, 0.55, 10, 30),
      new THREE.TetrahedronGeometry(2.2, 0),
      new THREE.DodecahedronGeometry(1.9, 0),
      new THREE.TorusKnotGeometry(1.3, 0.4, 80, 10),
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.SphereGeometry(1.8, 10, 8),
      new THREE.ConeGeometry(1.7, 2.6, 6),
      new THREE.RingGeometry(0.9, 1.6, 16),
    ];

    const shapes = [];
    for (let i = 0; i < COUNTS.shapes; i++) {
      const color = THEME[i % THEME.length];
      const mesh = new THREE.Mesh(
        shapeGeometries[i % shapeGeometries.length],
        new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: rand(0.14, 0.28) })
      );
      const scale = rand(0.25, 1.25);
      mesh.position.set(jitter(230), (i / COUNTS.shapes - 0.5) * 200 + jitter(16), jitter(180) - 10);
      mesh.scale.setScalar(scale);
      mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
      rig.add(mesh);
      shapes.push({
        mesh,
        spin: [jitter(0.007), jitter(0.007), jitter(0.007)],
        floatSpeed: rand(0.15, 0.65),
        floatRange: rand(1.2, 4),
        floatPhase: rand(0, TWO_PI),
        baseY: mesh.position.y,
        pulseSpeed: rand(0.3, 0.9),
        pulsePhase: rand(0, TWO_PI),
        pulseAmount: rand(0.06, 0.16),
        baseScale: scale,
      });
    }

    /* ----- Lapisan 2: kristal kecil solid ----- */

    const crystals = instanced(
      new THREE.OctahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
      COUNTS.crystals,
      () => ({
        x: jitter(260), y: jitter(220), z: jitter(190) - 20,
        s: rand(0.15, 0.65), color: pick(THEME),
        floatSpeed: rand(0.2, 0.8), floatRange: rand(1.5, 4.5),
        floatPhase: rand(0, TWO_PI), spinX: jitter(0.02), spinY: jitter(0.02),
      })
    );

    /* ----- Lapisan 3: partikel cahaya ----- */

    const particles = makePoints({
      count: COUNTS.particles, spread: [230, 230, 170], offsetZ: -5,
      size: 1.1, vertexColors: true,
    });
    const dust = makePoints({
      count: COUNTS.dust, spread: [250, 250, 190], offsetZ: -30,
      size: 0.6, opacity: 0.3, color: 0xffffff,
    });
    const gold = makePoints({
      count: COUNTS.gold, spread: [210, 210, 160], offsetZ: -15,
      size: 1.6, opacity: 0.55, color: 0x33f2e0,
    });

    /* ----- Lapisan 4: asteroid yang mengorbit ----- */

    const asteroids = instanced(
      new THREE.DodecahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({ color: 0x9fb3d9, wireframe: true, transparent: true, opacity: 0.22 }),
      COUNTS.asteroids,
      () => ({
        x: 0, y: jitter(140), z: 0, s: rand(0.12, 0.67),
        radius: rand(90, 250), angle: rand(0, TWO_PI),
        orbitSpeed: rand(0.02, 0.07),
        floatSpeed: rand(0.15, 0.55), floatRange: rand(0.8, 2.4),
        floatPhase: rand(0, TWO_PI), spinX: jitter(0.03), spinY: jitter(0.03),
        rx: rand(0, Math.PI), ry: rand(0, Math.PI), rz: rand(0, Math.PI),
      })
    );

    /* ----- Lapisan 5: planet jauh dengan cincin ----- */

    const planets = [];
    for (let i = 0; i < COUNTS.planets; i++) {
      const color = PLANET_COLORS[i % PLANET_COLORS.length];
      const group = new THREE.Group();
      const bodyR = rand(3, 8);

      group.add(new THREE.Mesh(
        new THREE.SphereGeometry(bodyR, 20, 16),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, wireframe: true })
      ));
      group.add(new THREE.Mesh(
        new THREE.SphereGeometry(bodyR * 1.18, 16, 12),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: THREE.BackSide })
      ));
      if (Math.random() < 0.6) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(bodyR * 1.5, bodyR * 2.1, 48),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI / 2.4 + jitter(0.4);
        group.add(ring);
      }

      const dist = rand(130, 220);
      const ang = rand(0, TWO_PI);
      group.position.set(Math.cos(ang) * dist, jitter(160), Math.sin(ang) * dist - 60);
      rig.add(group);

      planets.push({
        group,
        spinSpeed: rand(0.02, 0.07),
        floatSpeed: rand(0.08, 0.28),
        floatRange: rand(3, 9),
        floatPhase: rand(0, TWO_PI),
        baseY: group.position.y,
      });
    }

    /* ----- Lapisan 6: gumpalan nebula ----- */

    const nebula = instanced(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({ color: 0x8b6bff, transparent: true, opacity: 0.05, depthWrite: false }),
      COUNTS.nebula,
      () => ({
        x: jitter(300), y: jitter(260), z: jitter(220) - 80,
        s: rand(4, 14), color: pick(NEBULA_COLORS),
        floatSpeed: rand(0.05, 0.2), floatRange: rand(2, 7),
        floatPhase: rand(0, TWO_PI),
      })
    );

    /* ----- Lapisan 7: pecahan besar ----- */

    const megaShards = instanced(
      new THREE.OctahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.16 }),
      COUNTS.megaShards,
      () => ({
        x: jitter(380), y: jitter(340), z: jitter(300) - 60,
        s: rand(0.08, 0.48), color: pick(THEME),
        rx: rand(0, Math.PI), ry: rand(0, Math.PI), rz: rand(0, Math.PI),
        floatSpeed: rand(0.1, 0.55), floatRange: rand(1, 4),
        floatPhase: rand(0, TWO_PI), spinX: jitter(0.025), spinY: jitter(0.025),
      })
    );

    /* ----- Lapisan 8: titik cahaya padat ----- */

    const megaGlow = makePoints({
      count: COUNTS.megaGlow, spread: [360, 320, 280], offsetZ: -50,
      size: 0.9, vertexColors: true,
    });

    /* ----- Lapisan 9: batu kristal yang mengorbit ----- */

    const megaRocks = instanced(
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.13 }),
      COUNTS.megaRocks,
      () => ({
        x: 0, y: jitter(260), z: 0, s: rand(0.1, 0.55), color: pick(THEME),
        radius: rand(60, 320), angle: rand(0, TWO_PI),
        orbitSpeed: rand(0.01, 0.045),
        floatSpeed: rand(0.1, 0.45), floatRange: rand(0.6, 2.2),
        floatPhase: rand(0, TWO_PI), spinX: jitter(0.03), spinY: jitter(0.03),
        rx: rand(0, Math.PI), ry: rand(0, Math.PI), rz: rand(0, Math.PI),
      })
    );

    /* ----- Interaksi kamera ----- */

    const camTarget = { x: 0, y: 0 };
    if (!App.isCoarse) {
      window.addEventListener('pointermove', (e) => {
        camTarget.x = (e.clientX / window.innerWidth - 0.5) * 6;
        camTarget.y = -(e.clientY / window.innerHeight - 0.5) * 4;
      });
    }

    /* ----- Animasi ----- */

    const tick = (ms) => {
      const time = ms * 0.001;
      const scrollT = App.scrollT || 0;

      shapes.forEach((s) => {
        s.mesh.rotation.x += s.spin[0];
        s.mesh.rotation.y += s.spin[1];
        s.mesh.rotation.z += s.spin[2];
        s.mesh.position.y = s.baseY + Math.sin(time * s.floatSpeed + s.floatPhase) * s.floatRange;
        s.mesh.scale.setScalar(s.baseScale * (1 + Math.sin(time * s.pulseSpeed + s.pulsePhase) * s.pulseAmount));
      });

      crystals.data.forEach((d, i) => {
        const fy = Math.sin(time * d.floatSpeed + d.floatPhase) * d.floatRange;
        setInstance(crystals.mesh, i, d.x, d.y + fy, d.z, time * d.spinX, time * d.spinY, 0, d.s);
      });
      crystals.mesh.instanceMatrix.needsUpdate = true;

      asteroids.data.forEach((a, i) => {
        a.angle += a.orbitSpeed * 0.001;
        const fy = Math.sin(time * a.floatSpeed + a.floatPhase) * a.floatRange;
        setInstance(
          asteroids.mesh, i,
          Math.cos(a.angle) * a.radius, a.y + fy, Math.sin(a.angle) * a.radius - 40,
          time * a.spinX, time * a.spinY, 0, a.s
        );
      });
      asteroids.mesh.instanceMatrix.needsUpdate = true;

      planets.forEach((p) => {
        p.group.rotation.y += p.spinSpeed * 0.02;
        p.group.position.y = p.baseY + Math.sin(time * p.floatSpeed + p.floatPhase) * p.floatRange;
      });

      nebula.data.forEach((n, i) => {
        const fy = Math.sin(time * n.floatSpeed + n.floatPhase) * n.floatRange;
        setInstance(nebula.mesh, i, n.x, n.y + fy, n.z, time * 0.01, time * 0.008, 0, n.s);
      });
      nebula.mesh.instanceMatrix.needsUpdate = true;

      megaShards.data.forEach((m, i) => {
        const fy = Math.sin(time * m.floatSpeed + m.floatPhase) * m.floatRange;
        setInstance(megaShards.mesh, i, m.x, m.y + fy, m.z, time * m.spinX, time * m.spinY, 0, m.s);
      });
      megaShards.mesh.instanceMatrix.needsUpdate = true;

      megaRocks.data.forEach((r, i) => {
        r.angle += r.orbitSpeed * 0.001;
        const fy = Math.sin(time * r.floatSpeed + r.floatPhase) * r.floatRange;
        setInstance(
          megaRocks.mesh, i,
          Math.cos(r.angle) * r.radius, r.y + fy, Math.sin(r.angle) * r.radius - 70,
          time * r.spinX, time * r.spinY, 0, r.s
        );
      });
      megaRocks.mesh.instanceMatrix.needsUpdate = true;

      megaGlow.rotation.y = time * 0.015;
      megaGlow.rotation.x = Math.sin(time * 0.04) * 0.08;
      particles.rotation.y = time * 0.02;
      particles.rotation.x = Math.sin(time * 0.05) * 0.1;
      dust.rotation.y = -time * 0.012;
      gold.rotation.y = time * 0.03;
      gold.material.opacity = 0.4 + Math.sin(time * 0.6) * 0.15;

      rig.rotation.y = scrollT * 0.6;
      rig.rotation.x = scrollT * -0.2;

      if (App.isCoarse) {
        camTarget.x = Math.sin(time * 0.1) * 3;
        camTarget.y = Math.cos(time * 0.08) * 2;
      }
      camera.position.x += (camTarget.x - camera.position.x) * 0.03;
      camera.position.y += (camTarget.y - camera.position.y) * 0.03;
      camera.position.z = 34 - scrollT * 6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
})();

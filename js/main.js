const SOUTH = 2;
const LEAP = 240;
var camera,
  scene,
  controls,
  renderer,
  stats,
  loader,
  pmremGenerator,
  mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster(),
  carList = [],
  shopConfigs = [],
  dismountBikeBtn = null,
  dismountCamperBtn = null,
  inventory = [],
  simCharacter = null,
  groundPlane = null,
  clickRaycaster = new THREE.Raycaster(),
  clickPulse = null,
  clickPulsePhase = 0,
  manager = new THREE.LoadingManager(),
  loader = new THREE.GLTFLoader(manager),
  isPlaying = true;

var clusterNames = [
  'factory',
  'house2',
  'shoparea',
  'house',
  'apartments',
  'shops',
  'fastfood',
  'house3',
  'stadium',
  'gas',
  'bikeshop',
  'coffeeshop',
  'residence',
  'bus',
  'park',
  'bikeshop',
];

const cluster = [
  { x: 1, z: 0, cluster: 'road' },

  { x: 2, z: 2, cluster: clusterNames[0], direction: SOUTH },
  { x: 2, z: 1, cluster: clusterNames[1], direction: SOUTH },
  { x: 2, z: 0, cluster: clusterNames[2], direction: SOUTH },
  { x: 2, z: -1, cluster: clusterNames[3], direction: SOUTH },
  { x: 2, z: -2, cluster: clusterNames[0], direction: SOUTH },
  { x: 2, z: -3, cluster: clusterNames[1], direction: SOUTH },
  { x: 2, z: -4, cluster: clusterNames[2], direction: SOUTH },
  { x: 2, z: -5, cluster: clusterNames[3], direction: SOUTH },

  { x: 1, z: 2, cluster: clusterNames[4], direction: SOUTH },
  { x: 1, z: 1, cluster: clusterNames[7], direction: SOUTH },
  { x: 1, z: 0, cluster: clusterNames[8], direction: SOUTH },
  { x: 1, z: -1, cluster: clusterNames[9], direction: SOUTH },
  { x: 1, z: -2, cluster: clusterNames[4], direction: SOUTH },
  { x: 1, z: -3, cluster: clusterNames[7], direction: SOUTH },
  { x: 1, z: -4, cluster: clusterNames[8], direction: SOUTH },
  { x: 1, z: -5, cluster: clusterNames[9], direction: SOUTH },

  { x: 0, z: 2, cluster: clusterNames[5], direction: SOUTH },
  { x: 0, z: 1, cluster: clusterNames[10], direction: SOUTH },
  { x: 0, z: 0, cluster: clusterNames[12], direction: SOUTH },
  { x: 0, z: -1, cluster: clusterNames[13], direction: SOUTH },
  { x: 0, z: -2, cluster: clusterNames[5], direction: SOUTH },
  { x: 0, z: -3, cluster: clusterNames[10], direction: SOUTH },
  { x: 0, z: -4, cluster: clusterNames[12], direction: SOUTH },
  { x: 0, z: -5, cluster: clusterNames[13], direction: SOUTH },

  { x: -1, z: 2, cluster: clusterNames[6], direction: SOUTH },
  { x: -1, z: 1, cluster: clusterNames[11], direction: SOUTH },
  { x: -1, z: 0, cluster: clusterNames[14], direction: SOUTH },
  { x: -1, z: -1, cluster: clusterNames[15], direction: SOUTH },
  { x: -1, z: -2, cluster: clusterNames[6], direction: SOUTH },
  { x: -1, z: -3, cluster: clusterNames[11], direction: SOUTH },
  { x: -1, z: -4, cluster: clusterNames[14], direction: SOUTH },
  { x: -1, z: -5, cluster: clusterNames[15], direction: SOUTH },

  { x: -2, z: 2, cluster: clusterNames[0], direction: SOUTH },
  { x: -2, z: 1, cluster: clusterNames[1], direction: SOUTH },
  { x: -2, z: 0, cluster: clusterNames[2], direction: SOUTH },
  { x: -2, z: -1, cluster: clusterNames[3], direction: SOUTH },
  { x: -2, z: -2, cluster: clusterNames[0], direction: SOUTH },
  { x: -2, z: -3, cluster: clusterNames[1], direction: SOUTH },
  { x: -2, z: -4, cluster: clusterNames[2], direction: SOUTH },
  { x: -2, z: -5, cluster: clusterNames[3], direction: SOUTH },

  { x: -3, z: 2, cluster: clusterNames[4], direction: SOUTH },
  { x: -3, z: 1, cluster: clusterNames[7], direction: SOUTH },
  { x: -3, z: 0, cluster: clusterNames[8], direction: SOUTH },
  { x: -3, z: -1, cluster: clusterNames[9], direction: SOUTH },
  { x: -3, z: -2, cluster: clusterNames[4], direction: SOUTH },
  { x: -3, z: -3, cluster: clusterNames[7], direction: SOUTH },
  { x: -3, z: -4, cluster: clusterNames[8], direction: SOUTH },
  { x: -3, z: -5, cluster: clusterNames[9], direction: SOUTH },

  { x: -4, z: 2, cluster: clusterNames[5], direction: SOUTH },
  { x: -4, z: 1, cluster: clusterNames[10], direction: SOUTH },
  { x: -4, z: 0, cluster: clusterNames[12], direction: SOUTH },
  { x: -4, z: -1, cluster: clusterNames[13], direction: SOUTH },
  { x: -4, z: -2, cluster: clusterNames[5], direction: SOUTH },
  { x: -4, z: -3, cluster: clusterNames[10], direction: SOUTH },
  { x: -4, z: -4, cluster: clusterNames[12], direction: SOUTH },
  { x: -4, z: -5, cluster: clusterNames[13], direction: SOUTH },

  { x: -5, z: 2, cluster: clusterNames[6], direction: SOUTH },
  { x: -5, z: 1, cluster: clusterNames[11], direction: SOUTH },
  { x: -5, z: 0, cluster: clusterNames[14], direction: SOUTH },
  { x: -5, z: -1, cluster: clusterNames[15], direction: SOUTH },
  { x: -5, z: -2, cluster: clusterNames[6], direction: SOUTH },
  { x: -5, z: -3, cluster: clusterNames[11], direction: SOUTH },
  { x: -5, z: -4, cluster: clusterNames[14], direction: SOUTH },
  { x: -5, z: -5, cluster: clusterNames[8], direction: SOUTH },
];

// --- Shop registration system ---
function registerShop(config) {
  config.positions = [];
  config.btn = null;
  shopConfigs.push(config);
  return config;
}

registerShop({
  buttonText: 'RENT BIKE',
  clusterName: 'bikeshop',
  localX: 14, localZ: 10,
  canShow: function () { return simCharacter && !simCharacter.userData.onBike && !simCharacter.userData.onCamper; },
  onRent: function () { mountBike(); },
});

registerShop({
  buttonText: 'RENT PHONE',
  clusterName: 'fastfood',
  localX: 7, localZ: 23,
  onRent: function () { addItemToInventory('phone', drawPhoneIcon); },
});

registerShop({
  buttonText: 'RENT SOFA',
  clusterName: 'fastfood',
  localX: 8, localZ: 7,
  onRent: function () { addItemToInventory('sofa', drawSofaIcon); },
});

registerShop({
  buttonText: 'RENT CAMPER',
  clusterName: 'factory',
  localX: 18, localZ: 0,
  canShow: function () { return simCharacter && !simCharacter.userData.onBike && !simCharacter.userData.onCamper; },
  onRent: function () { mountCamper(); },
});

function main() {
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({ canvas });

  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(80, 140, 80);
  camera.lookAt(new THREE.Vector3());
  camera.position.y = 200;

  controls = new THREE.MapControls(camera, canvas);
  controls.autoRotate = false;
  controls.autoRotateSpeed = -10;
  controls.screenSpacePanning = true;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.enableZoom = false;

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#9FE3FA');

  renderer.shadowMap.enabled = true;
  renderer.gammaInput = renderer.gammaOutput = true;
  renderer.gammaFactor = 2.0;
  // renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xcccccc);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const light = new THREE.DirectionalLight(16774618, 1.5);
    light.position.set(-300, 750, -300);
    light.castShadow = true;
    light.shadow.mapSize.width = light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 1000;
    light.shadow.camera.left = light.shadow.camera.bottom = -200;
    light.shadow.camera.right = light.shadow.camera.top = 200;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);
    scene.add(light.target);
    scene.add(new THREE.HemisphereLight(0xefefef, 0xffffff, 1));
  }

  const gltfLoader = new THREE.GLTFLoader();

  cluster.forEach((cl) => {
    loadClusters(cl);
    if (cl.cluster === 'bikeshop') {
      loadBikesAtShop(cl.x, cl.z);
    }
    if (cl.cluster === 'factory') {
      loadCampervansAtFactory(cl.x, cl.z);
    }
    shopConfigs.forEach(function (shop) {
      if (cl.cluster === shop.clusterName) {
        shop.positions.push({
          x: cl.x * 60 + shop.localX,
          z: cl.z * 60 + shop.localZ,
        });
      }
    });
  });

  loadCars({ x: 1, z: 0, cluster: 'cars' });

  // Invisible ground plane for click raycasting
  groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = 0;
  scene.add(groundPlane);

  // Spawn single player character at supermarket car park
  simCharacter = createSimsCharacter(15, 55);
  scene.add(simCharacter);

  // Focus camera on the sim
  scene.add(camera);
  camera.position.set(simCharacter.position.x + 30, 50, simCharacter.position.z + 30);
  controls.target.set(simCharacter.position.x, 0, simCharacter.position.z);
  controls.update();

  // Shared smokey glass button style
  var glassBtnStyle = 'position:fixed;padding:12px 28px;background:rgba(30,30,30,0.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,0.25);border-radius:8px;font-family:Dosis,sans-serif;font-size:16px;font-weight:700;cursor:pointer;pointer-events:auto;display:none;z-index:100;text-transform:uppercase;letter-spacing:2px;box-shadow:0 4px 16px rgba(0,0,0,0.35);transition:background 0.15s,border-color 0.15s;';

  // Create shop rental buttons
  shopConfigs.forEach(function (shop) {
    var btn = document.createElement('button');
    btn.textContent = shop.buttonText;
    btn.style.cssText = glassBtnStyle + 'transform:translate(-50%,-100%);';
    btn.addEventListener('mouseenter', function () { btn.style.background = 'rgba(60,60,60,0.7)'; btn.style.borderColor = 'rgba(255,255,255,0.5)'; });
    btn.addEventListener('mouseleave', function () { btn.style.background = 'rgba(30,30,30,0.55)'; btn.style.borderColor = 'rgba(255,255,255,0.25)'; });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      shop.onRent();
    });
    document.body.appendChild(btn);
    shop.btn = btn;
  });

  // Create dismount bike UI button
  dismountBikeBtn = document.createElement('button');
  dismountBikeBtn.id = 'dismount-bike-btn';
  dismountBikeBtn.textContent = 'DISMOUNT BIKE';
  dismountBikeBtn.style.cssText = glassBtnStyle + 'bottom:100px;left:50%;transform:translateX(-50%);';
  dismountBikeBtn.addEventListener('mouseenter', function () { dismountBikeBtn.style.background = 'rgba(60,60,60,0.7)'; dismountBikeBtn.style.borderColor = 'rgba(255,255,255,0.5)'; });
  dismountBikeBtn.addEventListener('mouseleave', function () { dismountBikeBtn.style.background = 'rgba(30,30,30,0.55)'; dismountBikeBtn.style.borderColor = 'rgba(255,255,255,0.25)'; });
  dismountBikeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (simCharacter && simCharacter.userData.onBike) {
      dismountBike();
    }
  });
  document.body.appendChild(dismountBikeBtn);

  // Create dismount camper UI button
  dismountCamperBtn = document.createElement('button');
  dismountCamperBtn.id = 'dismount-camper-btn';
  dismountCamperBtn.textContent = 'DISMOUNT CAMPER';
  dismountCamperBtn.style.cssText = glassBtnStyle + 'bottom:100px;left:50%;transform:translateX(-50%);';
  dismountCamperBtn.addEventListener('mouseenter', function () { dismountCamperBtn.style.background = 'rgba(60,60,60,0.7)'; dismountCamperBtn.style.borderColor = 'rgba(255,255,255,0.5)'; });
  dismountCamperBtn.addEventListener('mouseleave', function () { dismountCamperBtn.style.background = 'rgba(30,30,30,0.55)'; dismountCamperBtn.style.borderColor = 'rgba(255,255,255,0.25)'; });
  dismountCamperBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (simCharacter && simCharacter.userData.onCamper) {
      dismountCamper();
    }
  });
  document.body.appendChild(dismountCamperBtn);

  // Create inventory panel
  var inventoryPanel = document.createElement('div');
  inventoryPanel.id = 'inventory-panel';
  inventoryPanel.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:4px;padding:6px;background:rgba(30,30,30,0.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);border-radius:8px;z-index:100;box-shadow:0 4px 16px rgba(0,0,0,0.35);';
  for (var si = 0; si < 5; si++) {
    var slot = document.createElement('div');
    slot.className = 'inv-slot';
    slot.dataset.slot = si;
    slot.style.cssText = 'width:52px;height:52px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.2);border-radius:4px;box-sizing:border-box;transition:background 0.15s,border-color 0.15s;cursor:pointer;';
    slot.addEventListener('mouseenter', function () { this.style.background = 'rgba(255,255,255,0.15)'; this.style.borderColor = 'rgba(255,255,255,0.45)'; });
    slot.addEventListener('mouseleave', function () { this.style.background = 'rgba(255,255,255,0.07)'; this.style.borderColor = 'rgba(255,255,255,0.2)'; });
    inventoryPanel.appendChild(slot);
  }
  document.body.appendChild(inventoryPanel);

  // Click-to-move handler
  canvas.addEventListener('click', function (e) {
    if (!isPlaying || !simCharacter) return;
    var clickMouse = new THREE.Vector2();
    clickMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    clickRaycaster.setFromCamera(clickMouse, camera);

    var hits = clickRaycaster.intersectObject(groundPlane);
    if (hits.length > 0) {
      var target = hits[0].point;

      if (simCharacter.userData.onCamper) {
        // Snap target to nearest road and use pathfinding
        var roadTarget = getNearestRoadPoint(target.x, target.z);
        var path = findRoadPath(simCharacter.position.x, simCharacter.position.z, roadTarget.x, roadTarget.z);
        var waypoints = pathToLaneWaypoints(path);
        simCharacter.userData.camperPath = waypoints;
        simCharacter.userData.camperPathIdx = 0;

        if (waypoints.length > 0) {
          var wp = waypoints[0];
          simCharacter.userData.targetX = wp.x;
          simCharacter.userData.targetZ = wp.z;
          simCharacter.userData.isWalking = true;
          var wdx = wp.x - simCharacter.position.x;
          var wdz = wp.z - simCharacter.position.z;
          simCharacter.rotation.y = Math.atan2(wdx, wdz);
        }
      } else {
        simCharacter.userData.targetX = target.x;
        simCharacter.userData.targetZ = target.z;
        simCharacter.userData.isWalking = true;
        var dx = target.x - simCharacter.position.x;
        var dz = target.z - simCharacter.position.z;
        simCharacter.rotation.y = Math.atan2(dx, dz);
      }

      // Click pulse indicator
      if (clickPulse) scene.remove(clickPulse);
      var pulseGeo = new THREE.RingGeometry(0.3, 0.5, 32);
      var pulseMat = new THREE.MeshBasicMaterial({
        color: 0x39ff14,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      clickPulse = new THREE.Mesh(pulseGeo, pulseMat);
      clickPulse.rotation.x = -Math.PI / 2;
      clickPulse.position.set(target.x, 0.05, target.z);
      clickPulsePhase = 0;
      scene.add(clickPulse);
    }
  });

  function render() {
    if (!isPlaying) {
      return;
    }
    controls.update();

    // Camera follows sim
    if (simCharacter) {
      camera.position.set(
        simCharacter.position.x + 30,
        50,
        simCharacter.position.z + 30
      );
      controls.target.set(simCharacter.position.x, 0, simCharacter.position.z);
    }

    if (camera.position.x > 130) {
      controls.target.x -= LEAP;
      camera.position.x -= LEAP;
      carList.forEach((car) => (car.position.x -= LEAP));
      if (simCharacter) {
        simCharacter.position.x -= LEAP;
        if (simCharacter.userData.targetX !== null) simCharacter.userData.targetX -= LEAP;
      }
    } else if (camera.position.x < -120) {
      controls.target.x += LEAP;
      camera.position.x += LEAP;
      carList.forEach((car) => (car.position.x += LEAP));
      if (simCharacter) {
        simCharacter.position.x += LEAP;
        if (simCharacter.userData.targetX !== null) simCharacter.userData.targetX += LEAP;
      }
    }
    if (camera.position.z > 130) {
      controls.target.z -= LEAP;
      camera.position.z -= LEAP;
      carList.forEach((car) => (car.position.z -= LEAP));
      if (simCharacter) {
        simCharacter.position.z -= LEAP;
        if (simCharacter.userData.targetZ !== null) simCharacter.userData.targetZ -= LEAP;
      }
    } else if (camera.position.z < -120) {
      controls.target.z += LEAP;
      camera.position.z += LEAP;
      carList.forEach((car) => (car.position.z += LEAP));
      if (simCharacter) {
        simCharacter.position.z += LEAP;
        if (simCharacter.userData.targetZ !== null) simCharacter.userData.targetZ += LEAP;
      }
    }

    raycaster.setFromCamera(mouse, camera);

    carList.forEach((car) => {
      car.r.set(
        new THREE.Vector3(car.position.x + 58, 1, car.position.z),
        new THREE.Vector3(car.userData.x, 0, car.userData.z)
      );
      let _NT = car.r.intersectObjects(carList, true);
      // Check if sim is in the car's lane ahead using distance + direction
      var simBlocking = false;
      if (_NT.length === 0 && simCharacter) {
        var toSimX = simCharacter.position.x - (car.position.x + 58);
        var toSimZ = simCharacter.position.z - car.position.z;
        var dirLen = Math.sqrt(car.userData.x * car.userData.x + car.userData.z * car.userData.z);
        if (dirLen > 0) {
          var ndx = car.userData.x / dirLen;
          var ndz = car.userData.z / dirLen;
          var forward = toSimX * ndx + toSimZ * ndz;
          var perp = Math.abs(toSimX * ndz - toSimZ * ndx);
          simBlocking = forward > 0 && forward < 12 && perp < 3;
        }
      }
      if (_NT.length > 0 || simBlocking) {
        car.speed = 0;
        return;
      } else {
        car.speed = car.speed < car.maxSpeed ? car.speed + 0.002 : car.speed;

        if (car.position.x < -380) car.position.x += LEAP * 2;
        else if (car.position.x > 100) car.position.x -= LEAP * 2;
        if (car.position.z < -320) car.position.x += LEAP * 2;
        else if (car.position.z > 160) car.position.x -= LEAP * 2;

        car.position.x += car.userData.x * car.speed;
        car.position.z += car.userData.z * car.speed;
      }
    });

    updateSimsCharacter();

    // Animate click pulse
    if (clickPulse) {
      clickPulsePhase += 0.04;
      var s = 1 + clickPulsePhase * 3;
      clickPulse.scale.set(s, s, s);
      clickPulse.material.opacity = Math.max(0, 0.8 - clickPulsePhase);
      if (clickPulse.material.opacity <= 0) {
        scene.remove(clickPulse);
        clickPulse = null;
      }
    }

    // Position shop rental buttons over nearest matching shop
    shopConfigs.forEach(function (shop) {
      if (!shop.btn) return;
      if (shop.canShow && !shop.canShow()) {
        shop.btn.style.display = 'none';
        return;
      }
      if (!simCharacter) { shop.btn.style.display = 'none'; return; }
      var closestDist = Infinity;
      var closestPos = null;
      for (var i = 0; i < shop.positions.length; i++) {
        var p = shop.positions[i];
        var d = Math.sqrt(
          Math.pow(simCharacter.position.x - p.x, 2) +
          Math.pow(simCharacter.position.z - p.z, 2)
        );
        if (d < closestDist) { closestDist = d; closestPos = p; }
      }
      if (closestPos && closestDist < 30) {
        var sp = new THREE.Vector3(closestPos.x, 8, closestPos.z);
        sp.project(camera);
        shop.btn.style.display = 'block';
        shop.btn.style.left = ((sp.x * 0.5 + 0.5) * window.innerWidth) + 'px';
        shop.btn.style.top = ((-sp.y * 0.5 + 0.5) * window.innerHeight) + 'px';
      } else {
        shop.btn.style.display = 'none';
      }
    });

    // Show/hide dismount button
    if (dismountBikeBtn) {
      dismountBikeBtn.style.display = (simCharacter && simCharacter.userData.onBike) ? 'block' : 'none';
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  function loadClusters({ x, z, cluster, direction }) {
    gltfLoader.load(`gltf/${cluster}.gltf`, (gltf) => {
      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(gltf.scene);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      controls.maxDistance = boxSize * 5;
      camera.near = boxSize / 100;
      camera.far = boxSize * 200;
      camera.updateProjectionMatrix();

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true;
          child.material.depthWrite = !child.material.transparent;
        }
      });

      gltf.scene.position.set(x * 60, 0, z * 60);
      if (direction) gltf.scene.rotation.y = Math.PI * direction;

      scene.add(gltf.scene);
      // addLights();
    });
  }
  requestAnimationFrame(render);

  {
    document
      .getElementById('about-button')
      .addEventListener('click', function (e) {
        isPlaying = !isPlaying;
        if (isPlaying) {
          requestAnimationFrame(render);
        }
        document.getElementById('about').classList.toggle('visible');
        document.getElementById('c').classList.toggle('blur');
      });
  }
}

main();
//Events
window.addEventListener('resize', onResize, false);
window.addEventListener('mousemove', onMouseMove, false);

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function addLights() {
  const light1 = new THREE.AmbientLight(0xffffff, 2);
  light1.name = 'ambient_light';
  camera.add(light1);

  const light2 = new DirectionalLight(0xffffff, 4);
  light2.position.set(0.5, 0, 0.866); // ~60º
  light2.name = 'main_light';
  camera.add(light2);

  renderer.toneMappingExposure = 1;
}

function createSimsCharacter(x, z) {
  var character = new THREE.Group();
  character.name = 'sims-character';

  var skinMat = new THREE.MeshStandardMaterial({ color: 0xf5c6a0 });
  var shirtMat = new THREE.MeshStandardMaterial({ color: 0x3498db });
  var pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
  var shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

  // Head
  var head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
  head.position.y = 2.05;
  head.castShadow = true;
  character.add(head);

  // Body / torso
  var body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.4), shirtMat);
  body.position.y = 1.4;
  body.castShadow = true;
  character.add(body);

  // Left arm
  var leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.5, 1.7, 0);
  var leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.25), shirtMat);
  leftArm.position.y = -0.35;
  leftArmPivot.add(leftArm);
  character.add(leftArmPivot);

  // Right arm
  var rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.5, 1.7, 0);
  var rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.25), shirtMat);
  rightArm.position.y = -0.35;
  rightArmPivot.add(rightArm);
  character.add(rightArmPivot);

  // Left leg
  var leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.18, 1.0, 0);
  var leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.3), pantsMat);
  leftLeg.position.y = -0.35;
  var leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.4), shoeMat);
  leftShoe.position.set(0, -0.72, 0.05);
  leftLegPivot.add(leftLeg);
  leftLegPivot.add(leftShoe);
  character.add(leftLegPivot);

  // Right leg
  var rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.18, 1.0, 0);
  var rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.3), pantsMat);
  rightLeg.position.y = -0.35;
  var rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.4), shoeMat);
  rightShoe.position.set(0, -0.72, 0.05);
  rightLegPivot.add(rightLeg);
  rightLegPivot.add(rightShoe);
  character.add(rightLegPivot);

  // 3D R logo floating above head (extruded from SVG path)
  var H = 735;
  var rShape = new THREE.Shape();
  rShape.moveTo(847.312, H - 267.957);
  rShape.bezierCurveTo(850.07, H - 120.607, 726.734, H, 579.286, H);
  rShape.lineTo(314.451, H);
  rShape.bezierCurveTo(304.693, H, 296.782, H - 7.906, 296.782, H - 17.659);
  rShape.lineTo(296.782, H - 140.863);
  rShape.bezierCurveTo(296.782, H - 150.616, 304.693, H - 158.522, 314.451, H - 158.522);
  rShape.lineTo(581.539, H - 158.522);
  rShape.bezierCurveTo(640.065, H - 158.522, 689.804, H - 206.391, 688.742, H - 264.879);
  rShape.bezierCurveTo(687.711, H - 321.617, 641.352, H - 367.314, 584.283, H - 367.314);
  rShape.lineTo(296.783, H - 367.314);
  rShape.lineTo(296.783, H - 194.953);
  rShape.bezierCurveTo(296.783, H - 179.113, 277.622, H - 171.18, 266.415, H - 182.38);
  rShape.lineTo(5.21, H - 443.457);
  rShape.bezierCurveTo(-1.737, H - 450.401, -1.737, H - 461.659, 5.21, H - 468.602);
  rShape.lineTo(266.415, H - 729.679);
  rShape.bezierCurveTo(277.622, H - 740.88, 296.782, H - 732.947, 296.782, H - 717.106);
  rShape.lineTo(296.782, H - 525.836);
  rShape.lineTo(502.362, H - 525.836);
  rShape.lineTo(652.955, H - 727.817);
  rShape.bezierCurveTo(656.288, H - 732.288, 661.539, H - 734.922, 667.117, H - 734.922);
  rShape.lineTo(824.979, H - 734.922);
  rShape.bezierCurveTo(839.585, H - 734.922, 847.888, H - 718.322, 839.172, H - 706.667);
  rShape.lineTo(687.817, H - 504.703);
  rShape.bezierCurveTo(780.185, H - 465.12, 845.324, H - 374.238, 847.312, H - 267.957);

  var rGeo = new THREE.ExtrudeGeometry(rShape, { depth: 150, bevelEnabled: false });
  rGeo.center();
  var rMat = new THREE.MeshStandardMaterial({
    color: 0xFE2930,
    emissive: 0xFE2930,
    emissiveIntensity: 0.5,
    side: THREE.DoubleSide,
  });
  var rLogo = new THREE.Mesh(rGeo, rMat);
  var logoScale = 0.0006;
  rLogo.scale.set(logoScale, logoScale, logoScale);
  rLogo.position.y = 2.8;
  rLogo.castShadow = true;
  character.add(rLogo);

  character.userData = {
    leftArmPivot: leftArmPivot,
    rightArmPivot: rightArmPivot,
    leftLegPivot: leftLegPivot,
    rightLegPivot: rightLegPivot,
    rLogo: rLogo,
    speed: 0.08,
    targetX: null,
    targetZ: null,
    isWalking: false,
    animPhase: 0,
    onBike: false,
    bikeModel: null,
    onCamper: false,
    camperModel: null,
    camperPath: [],
    camperPathIdx: 0,
    camperProxy: null,
  };

  character.position.set(x, -0.2, z);
  character.castShadow = true;

  return character;
}

function mountBike() {
  if (!simCharacter || simCharacter.userData.onBike) return;
  var ud = simCharacter.userData;

  // Create a bike and attach it to the character
  var bike = createBicycle(0x2ecc71);
  bike.position.set(0, 0.2, 0);
  bike.scale.set(1.2, 1.2, 1.2);
  simCharacter.add(bike);
  ud.bikeModel = bike;
  ud.onBike = true;
  ud.speed = 0.2;

  // Adjust character pose: sitting position
  // Lower the body slightly, bend legs forward for pedaling
  ud.leftArmPivot.rotation.x = -0.8;
  ud.rightArmPivot.rotation.x = -0.8;
  ud.leftLegPivot.rotation.x = -0.5;
  ud.rightLegPivot.rotation.x = 0.3;
}

function dismountBike() {
  if (!simCharacter || !simCharacter.userData.onBike) return;
  var ud = simCharacter.userData;

  // Remove bike from character and place it to the side in the world
  var bikeModel = ud.bikeModel;
  simCharacter.remove(bikeModel);

  // Place bike offset to the right of the character's facing direction
  var facing = simCharacter.rotation.y;
  var sideX = simCharacter.position.x + Math.cos(facing) * 1.5;
  var sideZ = simCharacter.position.z - Math.sin(facing) * 1.5;
  bikeModel.position.set(sideX, 0, sideZ);
  bikeModel.rotation.y = facing + Math.PI / 2;
  bikeModel.scale.set(1.2, 1.2, 1.2);
  scene.add(bikeModel);

  ud.bikeModel = null;
  ud.onBike = false;
  ud.speed = 0.08;

  // Reset to standing pose
  ud.leftArmPivot.rotation.x = 0;
  ud.rightArmPivot.rotation.x = 0;
  ud.leftLegPivot.rotation.x = 0;
  ud.rightLegPivot.rotation.x = 0;
}

// --- Road network for camper pathfinding ---
var ROAD_SPACING = 60;
var LANE_OFFSET = 3;

function getNearestRoadPoint(wx, wz) {
  var nearestNSx = Math.round(wx / ROAD_SPACING) * ROAD_SPACING;
  var nearestEWz = Math.round(wz / ROAD_SPACING) * ROAD_SPACING;
  var distToNS = Math.abs(wx - nearestNSx);
  var distToEW = Math.abs(wz - nearestEWz);
  if (distToNS < distToEW) {
    return { x: nearestNSx, z: wz };
  } else {
    return { x: wx, z: nearestEWz };
  }
}

function getNearestIntersection(wx, wz) {
  return {
    x: Math.round(wx / ROAD_SPACING) * ROAD_SPACING,
    z: Math.round(wz / ROAD_SPACING) * ROAD_SPACING,
  };
}

function findRoadPath(startX, startZ, endX, endZ) {
  var start = getNearestIntersection(startX, startZ);
  var end = getNearestIntersection(endX, endZ);

  if (start.x === end.x && start.z === end.z) {
    return [{ x: end.x, z: end.z }];
  }

  var openSet = [{ x: start.x, z: start.z, g: 0, f: 0, parent: null }];
  var closedSet = {};

  function key(x, z) { return x + ',' + z; }
  function heuristic(x1, z1, x2, z2) {
    return Math.abs(x1 - x2) + Math.abs(z1 - z2);
  }

  var endKey = key(end.x, end.z);

  while (openSet.length > 0) {
    var bestIdx = 0;
    for (var i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[bestIdx].f) bestIdx = i;
    }
    var current = openSet[bestIdx];

    if (key(current.x, current.z) === endKey) {
      var path = [];
      var node = current;
      while (node) {
        path.unshift({ x: node.x, z: node.z });
        node = node.parent;
      }
      return path;
    }

    openSet.splice(bestIdx, 1);
    closedSet[key(current.x, current.z)] = true;

    var neighbors = [
      { x: current.x + ROAD_SPACING, z: current.z },
      { x: current.x - ROAD_SPACING, z: current.z },
      { x: current.x, z: current.z + ROAD_SPACING },
      { x: current.x, z: current.z - ROAD_SPACING },
    ];

    for (var ni = 0; ni < neighbors.length; ni++) {
      var n = neighbors[ni];
      var nKey = key(n.x, n.z);
      if (closedSet[nKey]) continue;

      var g = current.g + ROAD_SPACING;
      var f = g + heuristic(n.x, n.z, end.x, end.z);

      var existing = null;
      for (var oi = 0; oi < openSet.length; oi++) {
        if (key(openSet[oi].x, openSet[oi].z) === nKey) {
          existing = openSet[oi];
          break;
        }
      }

      if (!existing) {
        openSet.push({ x: n.x, z: n.z, g: g, f: f, parent: current });
      } else if (g < existing.g) {
        existing.g = g;
        existing.f = f;
        existing.parent = current;
      }
    }

    if (Object.keys(closedSet).length > 500) break;
  }

  return [{ x: start.x, z: start.z }, { x: end.x, z: end.z }];
}

function pathToLaneWaypoints(path) {
  if (path.length < 2) return path;

  var waypoints = [];
  for (var i = 0; i < path.length - 1; i++) {
    var from = path[i];
    var to = path[i + 1];
    var dx = to.x - from.x;
    var dz = to.z - from.z;

    // Lane offset for right-hand traffic
    var laneX = 0, laneZ = 0;
    if (dx > 0) laneZ = -LANE_OFFSET;       // eastbound: south side
    else if (dx < 0) laneZ = LANE_OFFSET;   // westbound: north side
    else if (dz > 0) laneX = LANE_OFFSET;   // north(+z): east side
    else if (dz < 0) laneX = -LANE_OFFSET;  // south(-z): west side

    waypoints.push({ x: from.x + laneX, z: from.z + laneZ });
    waypoints.push({ x: to.x + laneX, z: to.z + laneZ });
  }

  return waypoints;
}

// --- Camper mount/dismount ---
function mountCamper() {
  if (!simCharacter) return;
  var ud = simCharacter.userData;

  if (ud.onBike) dismountBike();

  var camper = createCampervan(0x2980b9);
  camper.position.set(0, 0.2, 0);
  simCharacter.add(camper);

  ud.camperModel = camper;
  ud.onCamper = true;
  ud.speed = 0.2;
  ud.camperPath = [];
  ud.camperPathIdx = 0;

  // Hide character body (inside camper)
  simCharacter.children.forEach(function (child) {
    if (child !== camper && child !== ud.rLogo) {
      child.visible = false;
    }
  });

  // R logo above camper
  ud.rLogo.position.y = 4.5;

  // Collision proxy so other cars detect the camper
  var camperProxy = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  camperProxy.position.copy(simCharacter.position);
  camperProxy.userData = { x: 0, z: 1 };
  camperProxy.r = new THREE.Raycaster();
  camperProxy.speed = 0;
  camperProxy.maxSpeed = 0;
  camperProxy.distance = 0;
  camperProxy.isCamperProxy = true;
  scene.add(camperProxy);
  carList.push(camperProxy);
  ud.camperProxy = camperProxy;
}

function dismountCamper() {
  if (!simCharacter || !simCharacter.userData.onCamper) return;
  var ud = simCharacter.userData;

  var camper = ud.camperModel;
  simCharacter.remove(camper);

  // Place camper at current position in the world
  camper.position.copy(simCharacter.position);
  camper.position.y = 0;
  camper.rotation.y = simCharacter.rotation.y;
  scene.add(camper);

  // Show character body again
  simCharacter.children.forEach(function (child) {
    child.visible = true;
  });

  // Remove proxy from carList
  if (ud.camperProxy) {
    var idx = carList.indexOf(ud.camperProxy);
    if (idx >= 0) carList.splice(idx, 1);
    scene.remove(ud.camperProxy);
  }

  ud.camperModel = null;
  ud.onCamper = false;
  ud.speed = 0.08;
  ud.camperPath = [];
  ud.camperPathIdx = 0;
  ud.camperProxy = null;

  // Reset R logo position
  ud.rLogo.position.y = 2.8;

  // Reset to standing pose
  ud.leftArmPivot.rotation.x = 0;
  ud.rightArmPivot.rotation.x = 0;
  ud.leftLegPivot.rotation.x = 0;
  ud.rightLegPivot.rotation.x = 0;
}

function addItemToInventory(name, drawFn) {
  var slots = document.querySelectorAll('.inv-slot');
  var emptySlot = null;
  for (var i = 0; i < slots.length; i++) {
    if (!slots[i].dataset.item) {
      emptySlot = slots[i];
      break;
    }
  }
  if (!emptySlot) return;

  var iconCanvas = document.createElement('canvas');
  iconCanvas.width = 48;
  iconCanvas.height = 48;
  drawFn(iconCanvas.getContext('2d'));

  var img = document.createElement('img');
  img.src = iconCanvas.toDataURL();
  img.style.cssText = 'width:40px;height:40px;display:block;margin:6px auto;pointer-events:none;';
  emptySlot.appendChild(img);
  emptySlot.dataset.item = name;
  inventory.push(name);
}

function drawPhoneIcon(ctx) {
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(14, 6);
  ctx.lineTo(34, 6);
  ctx.quadraticCurveTo(38, 6, 38, 10);
  ctx.lineTo(38, 38);
  ctx.quadraticCurveTo(38, 42, 34, 42);
  ctx.lineTo(14, 42);
  ctx.quadraticCurveTo(10, 42, 10, 38);
  ctx.lineTo(10, 10);
  ctx.quadraticCurveTo(10, 6, 14, 6);
  ctx.fill();
  ctx.fillStyle = '#4fc3f7';
  ctx.fillRect(13, 10, 22, 24);
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(24, 38, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.fillRect(20, 7, 8, 1.5);
}

function drawSofaIcon(ctx) {
  // Sofa base / seat cushion
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(6, 22);
  ctx.lineTo(42, 22);
  ctx.quadraticCurveTo(44, 22, 44, 24);
  ctx.lineTo(44, 32);
  ctx.quadraticCurveTo(44, 34, 42, 34);
  ctx.lineTo(6, 34);
  ctx.quadraticCurveTo(4, 34, 4, 32);
  ctx.lineTo(4, 24);
  ctx.quadraticCurveTo(4, 22, 6, 22);
  ctx.fill();
  // Back rest
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.moveTo(8, 12);
  ctx.lineTo(40, 12);
  ctx.quadraticCurveTo(42, 12, 42, 14);
  ctx.lineTo(42, 23);
  ctx.lineTo(6, 23);
  ctx.lineTo(6, 14);
  ctx.quadraticCurveTo(6, 12, 8, 12);
  ctx.fill();
  // Left arm rest
  ctx.fillStyle = '#a93226';
  ctx.fillRect(2, 18, 5, 16);
  // Right arm rest
  ctx.fillRect(41, 18, 5, 16);
  // Legs
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(7, 34, 3, 5);
  ctx.fillRect(38, 34, 3, 5);
  // Seat cushion line
  ctx.strokeStyle = '#a93226';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 23);
  ctx.lineTo(24, 33);
  ctx.stroke();
}

function updateSimsCharacter() {
  if (!simCharacter) return;
  var ud = simCharacter.userData;

  // Animate R logo (spin + bob)
  ud.rLogo.rotation.y += 0.03;
  ud.rLogo.position.y = 2.8 + Math.sin(Date.now() * 0.003) * 0.15;

  if (!ud.isWalking || ud.targetX === null) return;

  var dx = ud.targetX - simCharacter.position.x;
  var dz = ud.targetZ - simCharacter.position.z;
  var dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < 0.5) {
    // Arrived at target
    ud.isWalking = false;
    ud.targetX = null;
    ud.targetZ = null;
    if (ud.onBike) {
      // Hold riding pose when stopped
      ud.leftArmPivot.rotation.x = -0.8;
      ud.rightArmPivot.rotation.x = -0.8;
      ud.leftLegPivot.rotation.x = -0.3;
      ud.rightLegPivot.rotation.x = -0.3;
    } else {
      ud.leftArmPivot.rotation.x = 0;
      ud.rightArmPivot.rotation.x = 0;
      ud.leftLegPivot.rotation.x = 0;
      ud.rightLegPivot.rotation.x = 0;
    }
    return;
  }

  // Collect obstacles for raycasting (everything except ground, character, lights)
  var obstacles = [];
  scene.children.forEach(function (obj) {
    if (obj !== groundPlane && obj !== simCharacter) {
      obstacles.push(obj);
    }
  });

  var desiredAngle = Math.atan2(dx, dz);
  var charPos = new THREE.Vector3(simCharacter.position.x, 1.0, simCharacter.position.z);
  var checkDist = 6;

  // Try the direct path first, then increasingly wider angles to steer around obstacles
  var offsets = [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4];
  var moveAngle = null;

  for (var i = 0; i < offsets.length; i++) {
    var angle = desiredAngle + offsets[i];
    var dir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    var ray = new THREE.Raycaster(charPos, dir, 0, checkDist);
    var hits = ray.intersectObjects(obstacles, true);
    if (hits.length === 0) {
      moveAngle = angle;
      break;
    }
  }

  if (moveAngle !== null) {
    simCharacter.position.x += Math.sin(moveAngle) * ud.speed;
    simCharacter.position.z += Math.cos(moveAngle) * ud.speed;
    simCharacter.rotation.y = moveAngle;

    if (ud.onBike) {
      // Pedaling animation — circular leg motion
      ud.animPhase += 0.18;
      var pedalAngle = ud.animPhase;
      ud.leftLegPivot.rotation.x = -0.3 + Math.sin(pedalAngle) * 0.5;
      ud.rightLegPivot.rotation.x = -0.3 + Math.sin(pedalAngle + Math.PI) * 0.5;
      // Arms stay fixed gripping handlebars
      ud.leftArmPivot.rotation.x = -0.8;
      ud.rightArmPivot.rotation.x = -0.8;
    } else {
      // Walk animation
      ud.animPhase += 0.12;
      var swing = Math.sin(ud.animPhase) * 0.6;
      ud.leftArmPivot.rotation.x = swing;
      ud.rightArmPivot.rotation.x = -swing;
      ud.leftLegPivot.rotation.x = -swing;
      ud.rightLegPivot.rotation.x = swing;
    }
  }
  // If all directions blocked, character waits until a path opens
}

function createBicycle(color) {
  var bike = new THREE.Group();
  var frameMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  var wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  var seatMat = new THREE.MeshStandardMaterial({ color: 0x663311 });
  var handleMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  var accentMat = new THREE.MeshStandardMaterial({ color: color });

  // Wheels — torus for rim, thin cylinder for hub
  var wheelR = 0.45;
  var wheelGeo = new THREE.TorusGeometry(wheelR, 0.05, 6, 16);
  var hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8);

  // Rear wheel
  var rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
  rearWheel.position.set(0, wheelR, -0.55);
  rearWheel.rotation.y = Math.PI / 2;
  rearWheel.castShadow = true;
  bike.add(rearWheel);
  var rearHub = new THREE.Mesh(hubGeo, handleMat);
  rearHub.position.set(0, wheelR, -0.55);
  rearHub.rotation.z = Math.PI / 2;
  bike.add(rearHub);

  // Front wheel
  var frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontWheel.position.set(0, wheelR, 0.55);
  frontWheel.rotation.y = Math.PI / 2;
  frontWheel.castShadow = true;
  bike.add(frontWheel);
  var frontHub = new THREE.Mesh(hubGeo, handleMat);
  frontHub.position.set(0, wheelR, 0.55);
  frontHub.rotation.z = Math.PI / 2;
  bike.add(frontHub);

  // Frame tubes using thin boxes
  // Down tube (bottom bracket to head tube)
  var downTube = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.7), accentMat);
  downTube.position.set(0, 0.5, 0.1);
  downTube.rotation.x = 0.45;
  downTube.castShadow = true;
  bike.add(downTube);

  // Seat tube (bottom bracket to seat)
  var seatTube = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.05), accentMat);
  seatTube.position.set(0, 0.65, -0.2);
  seatTube.castShadow = true;
  bike.add(seatTube);

  // Top tube (seat to head tube)
  var topTube = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.65), accentMat);
  topTube.position.set(0, 0.88, 0.12);
  topTube.rotation.x = 0.15;
  topTube.castShadow = true;
  bike.add(topTube);

  // Chain stay (bottom bracket to rear axle)
  var chainStay = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.45), frameMat);
  chainStay.position.set(0, 0.4, -0.35);
  chainStay.rotation.x = -0.15;
  chainStay.castShadow = true;
  bike.add(chainStay);

  // Seat stay (seat to rear axle)
  var seatStay = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.55), frameMat);
  seatStay.position.set(0, 0.7, -0.38);
  seatStay.rotation.x = -0.55;
  seatStay.castShadow = true;
  bike.add(seatStay);

  // Fork (head tube to front axle)
  var fork = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), frameMat);
  fork.position.set(0, 0.6, 0.52);
  fork.rotation.x = 0.15;
  fork.castShadow = true;
  bike.add(fork);

  // Seat
  var seat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.2), seatMat);
  seat.position.set(0, 0.98, -0.18);
  seat.castShadow = true;
  bike.add(seat);

  // Handlebar stem
  var stem = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.04), handleMat);
  stem.position.set(0, 0.95, 0.48);
  stem.castShadow = true;
  bike.add(stem);

  // Handlebar bar
  var handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.04), handleMat);
  handlebar.position.set(0, 1.05, 0.5);
  handlebar.castShadow = true;
  bike.add(handlebar);

  // Pedal crank
  var crank = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), frameMat);
  crank.position.set(0, 0.35, -0.15);
  crank.rotation.z = Math.PI / 2;
  bike.add(crank);

  return bike;
}

function loadBikesAtShop(clusterX, clusterZ) {
  var bikeColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
  var bikePositions = [
    { x: 20, z: 0, ry: Math.PI / 2 },
    { x: 20, z: 1, ry: Math.PI / 2 + 0.15 },
    { x: 20, z: 2, ry: Math.PI / 2 - 0.1 },
    { x: 20, z: 3, ry: Math.PI / 2 + 0.2 },
    { x: 20, z: 4, ry: Math.PI / 2 - 0.15 },
  ];

  bikePositions.forEach(function (pos, i) {
    var bike = createBicycle(bikeColors[i]);
    bike.position.set(clusterX * 60 + pos.x, 0, clusterZ * 60 + pos.z);
    bike.rotation.y = pos.ry;
    scene.add(bike);
  });
}

function createCampervan(bodyColor) {
  var van = new THREE.Group();
  var bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
  var roofMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0 });
  var trimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  var windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6 });
  var wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  var hubMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
  var bumperMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
  var lightMat = new THREE.MeshStandardMaterial({ color: 0xffdd44, emissive: 0xffdd44, emissiveIntensity: 0.3 });
  var tailMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, emissive: 0xcc2222, emissiveIntensity: 0.2 });

  // Main cabin body (lower section)
  var body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.6, 5.5), bodyMat);
  body.position.set(0, 1.2, 0);
  body.castShadow = true;
  van.add(body);

  // Camper roof section (raised rear half)
  var roof = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.7, 3.2), roofMat);
  roof.position.set(0, 2.35, -0.5);
  roof.castShadow = true;
  van.add(roof);

  // Cab roof (lower, front section)
  var cabRoof = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.15, 1.8), bodyMat);
  cabRoof.position.set(0, 2.0, 1.85);
  cabRoof.castShadow = true;
  van.add(cabRoof);

  // Windshield (front)
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 0.08), windowMat);
  windshield.position.set(0, 1.65, 2.77);
  van.add(windshield);

  // Rear window
  var rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.08), windowMat);
  rearWindow.position.set(0, 2.1, -2.12);
  van.add(rearWindow);

  // Side windows - left
  var sideWinL1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 1.0), windowMat);
  sideWinL1.position.set(-1.41, 1.7, 1.8);
  van.add(sideWinL1);
  var sideWinL2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.9), windowMat);
  sideWinL2.position.set(-1.41, 2.1, 0.2);
  van.add(sideWinL2);
  var sideWinL3 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.9), windowMat);
  sideWinL3.position.set(-1.41, 2.1, -1.1);
  van.add(sideWinL3);

  // Side windows - right
  var sideWinR1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 1.0), windowMat);
  sideWinR1.position.set(1.41, 1.7, 1.8);
  van.add(sideWinR1);
  var sideWinR2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.9), windowMat);
  sideWinR2.position.set(1.41, 2.1, 0.2);
  van.add(sideWinR2);
  var sideWinR3 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.9), windowMat);
  sideWinR3.position.set(1.41, 2.1, -1.1);
  van.add(sideWinR3);

  // Wheels
  var wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12);
  var hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.32, 8);
  var wheelPositions = [
    { x: -1.2, z: 1.5 }, { x: 1.2, z: 1.5 },
    { x: -1.2, z: -1.4 }, { x: 1.2, z: -1.4 },
  ];
  wheelPositions.forEach(function (wp) {
    var wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wp.x, 0.45, wp.z);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    van.add(wheel);
    var hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(wp.x, 0.45, wp.z);
    hub.rotation.z = Math.PI / 2;
    van.add(hub);
  });

  // Front bumper
  var frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.3, 0.2), bumperMat);
  frontBumper.position.set(0, 0.55, 2.8);
  frontBumper.castShadow = true;
  van.add(frontBumper);

  // Rear bumper
  var rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.3, 0.2), bumperMat);
  rearBumper.position.set(0, 0.55, -2.8);
  rearBumper.castShadow = true;
  van.add(rearBumper);

  // Headlights
  var hlGeo = new THREE.BoxGeometry(0.4, 0.25, 0.08);
  var hlL = new THREE.Mesh(hlGeo, lightMat);
  hlL.position.set(-0.9, 1.0, 2.78);
  van.add(hlL);
  var hlR = new THREE.Mesh(hlGeo, lightMat);
  hlR.position.set(0.9, 1.0, 2.78);
  van.add(hlR);

  // Tail lights
  var tlGeo = new THREE.BoxGeometry(0.35, 0.25, 0.08);
  var tlL = new THREE.Mesh(tlGeo, tailMat);
  tlL.position.set(-1.0, 1.0, -2.78);
  van.add(tlL);
  var tlR = new THREE.Mesh(tlGeo, tailMat);
  tlR.position.set(1.0, 1.0, -2.78);
  van.add(tlR);

  // Side trim stripe (accent line along body)
  var stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 5.0), trimMat);
  stripe.position.set(-1.42, 1.35, 0);
  van.add(stripe);
  var stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 5.0), trimMat);
  stripeR.position.set(1.42, 1.35, 0);
  van.add(stripeR);

  // Roof rack (two rails)
  var rackMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
  var railL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.6), rackMat);
  railL.position.set(-0.9, 2.72, -0.5);
  van.add(railL);
  var railR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.6), rackMat);
  railR.position.set(0.9, 2.72, -0.5);
  van.add(railR);
  // Cross bars
  for (var ci = 0; ci < 3; ci++) {
    var crossBar = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.06, 0.08), rackMat);
    crossBar.position.set(0, 2.76, -0.5 + (ci - 1) * 1.0);
    van.add(crossBar);
  }

  return van;
}

function loadCampervansAtFactory(clusterX, clusterZ) {
  var vanColors = [0x2980b9, 0xd4a04a, 0x27ae60];
  var vanPositions = [
    { x: 27, z: 25, ry: Math.PI / 2 + 0.4 - (114 * Math.PI / 180) },
    { x: 23, z: 25, ry: Math.PI / 2 + 0.4 - (114 * Math.PI / 180) },
    { x: 18, z: 25, ry: Math.PI / 2 + 0.4 - (114 * Math.PI / 180) },
  ];
  vanPositions.forEach(function (pos, i) {
    var van = createCampervan(vanColors[i]);
    van.position.set(clusterX * 60 + pos.x, 0, clusterZ * 60 + pos.z);
    van.rotation.y = pos.ry;
    scene.add(van);
  });
}

function loadCars({ x, z, cluster, direction }) {
  loader.load(`gltf/${cluster}.gltf`, (gltf) => {
    controls.update();

    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        child.material.depthWrite = !child.material.transparent;
      }
    });

    gltf.scene.position.set(x * 60, 0, z * 60);
    if (direction) gltf.scene.rotation.y = Math.PI * direction;

    scene.add(gltf.scene);

    gltf.scene.children.forEach((e) => {
      e.distance = 0;
      e.maxSpeed = 0.3;
      e.speed = e.maxSpeed;
      e.r = new THREE.Raycaster(
        new THREE.Vector3(e.position.x, 2, e.position.z),
        new THREE.Vector3(e.userData.x, 0, e.userData.z),
        5,
        15
      );
      carList.push(e);
    });
  });
}

let cubes = []
require(['lib/three', 'lib/tween', 'dungeon', 'relativeDir', 'constants'], function(THREE, TWEEN, Dungeon, RelativeDir, Const) {
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    function handleButtonClick(event) {
        var key = event.keyCode ? event.keyCode : event.which;
        const compass = event.target.textContent
        if(event.target.id == '1') {
            party.handleKey(81);
            return
        }
        switch(compass){
            case '↑ w':
                party.handleKey(87);
                break;
            case '↷ e':
                party.handleKey(69);
                break;
            case '↓ s':
                party.handleKey(83);
                break;
            case '← a':
                party.handleKey(65);
                break;
            case '→ d':
                party.handleKey(68);
                break;
        }
    }
    
    // Array of button labels
    const buttonLabels = ['1', '↑ w', '2', '← a', '↓ s', '→ d',''];
    
    // Create a container for the buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.position = 'fixed';
    buttonsContainer.style.top = '0';
    buttonsContainer.style.left = '0';
    buttonsContainer.style.margin = '10px';
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.gap = '5px';
    
    // Create and append buttons
    buttonLabels.forEach(label => {
        const button = document.createElement('button');
        button.textContent = label;
        button.style.border = '2px solid slate';
        button.style.background = 'transparent';
        button.style.color = 'white';
        button.style.padding = '20px';
        button.style.zIndex = 2

        if(label==''){
            button.id = 'glass'
            button.style.border = '0px';
            button.style.padding = '20000px';
            button.style.position = 'absolute';
            button.style.outline = 'none';
            button.style.zIndex = 100
        }

        if (label === '1') {
            button.textContent = '↶ q';
            button.id = '1';
        }

        if (label === '2') {
            button.textContent = '↷ e';
            button.id = '2';
        }


        button.addEventListener('click', handleButtonClick);
        buttonsContainer.appendChild(button);
    });
    
    // Append the container to the body
    document.body.appendChild(buttonsContainer);

    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;

    renderer.shadowCameraNear = 3;
    renderer.shadowCameraFar = 1000;
    renderer.shadowCameraFov = 50;

    renderer.shadowMapBias = 0.0039;
    renderer.shadowMapDarkness = 0.5;
    renderer.shadowMapWidth = 4096;
    renderer.shadowMapHeight = 4096;

    var dungeon = new Dungeon();

    var party;

    const direction = {
        FORWARD:  0,
        RIGHT:    1,
        BACKWARD: 2,
        LEFT:     3
    }

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    const refresh = params.get('refresh'); 

    if(refresh == 'true'){
        party = dungeon.spawnParty(Number(localStorage.getItem('x')),Number(localStorage.getItem('y')), Number(localStorage.getItem('direction-1')));
    } else {
        party = dungeon.spawnParty(10,6, direction.FORWARD);
    }

    dungeon.addMeshesToScene(scene, party.camera);

    var geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);

    
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const colors = [
        0xffb23e, //orange
        0xDCD31D, //yellow
        0xA9BF9, // blue
        0xFF69B4,
        0x008000,
        0xA020F0
        // 0xD8CBF, 
        // 0xD4FF00, 
    ];

    let map = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    
    function findValidPositions(map, startX, startY, radius) {
        let positions_x = [];
        let positions_z = [];
        let validPositions = [];
        let minX = Math.max(startX - radius, 0);
        let maxX = Math.min(startX + radius, map[0].length - 1);
        let minZ = Math.max(startY - radius, 0);
        let maxZ = Math.min(startY + radius, map.length - 1);

        for (let z = 0; z < map.length; z++) {
            for (let x = 0; x < map[z].length; x++) {
                if (map[z][x] === 1) {
                    // Check if within the computed ranges
                    if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
                        // Add to positions if within the radius for x or z
                        positions_x.push(x)
                        positions_z.push(z)
                    }
                }
            }
        }

        for (let z = 0; z < map.length; z++) {
            for (let x = 0; x < map[z].length; x++) {
                if (map[z][x] === 1) {
                    // Check if within the computed ranges
                    if (!positions_x.includes(x) && !positions_z.includes(z)) {
                        // Add to positions if within the radius for x or z
                        validPositions.push({ x, z });
                    }
                }
            }
        }
        return validPositions;
    }
    
    let validPositions = findValidPositions(map, Number(localStorage.getItem('x')) ? Number(localStorage.getItem('x')): 10,Number(localStorage.getItem('y')) ? Number(localStorage.getItem('y')): 6, 4);
    
    for (let i = 0; i < 10; i++) {
        var material = new THREE.MeshPhongMaterial({
            color: colors[i % colors.length],
            emissive: colors[i % colors.length],
            shininess: 200
        });
    
        var cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
    
        // Select a random valid position
        if (validPositions.length > 0) {
            let randomIndex = Math.floor(Math.random() * validPositions.length);
            let position = validPositions[randomIndex];
    
            cube.position.x = position.x; // Adjust according to your coordinate system
            cube.position.z = position.z; // Adjust according to your coordinate system
        }
    
        cube.position.y = 0.31;
        cube.name = 'loot'; //portal
    
        var cubeLight = new THREE.PointLight(0x66aac0, 0.6, 3);
        cube.add(cubeLight);
        scene.add(cube);
        cubes.push(cube);
    }

    var ambientLight = new THREE.AmbientLight(0x08131c);
    scene.add(ambientLight);

    party.light.castShadow = true;
    party.light.shadowMapWidth = 4096;
    party.light.shadowMapHeight = 4096;

    scene.add(party.camera);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        console.log(event)
        // Calculate mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, party.camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children);

        for (let i = 0; i < intersects.length; i++) {
            if(intersects[i].object.name == 'loot' && intersects[i].distance < 1.9){
                // window.parent.postMessage({portal: 'loot'}, 'https://lootbox-client.vercel.app');
                window.parent.postMessage({portal: 'loot'}, 'https://0xsequence-demos.github.io/demo-lootbox/');
            }
        }
    }

    // Add event listener for mouse click
    document.getElementById('glass').addEventListener('click', onMouseClick, false)
    window.addEventListener('click', onMouseClick, false);

    document.addEventListener('keydown', function(e) {
        var key = e.keyCode ? e.keyCode : e.which;
        console.log(key)
        party.handleKey(key);
    });

    window.addEventListener('resize', function() {
        party.camera.aspect = window.innerWidth/window.innerHeight;
        party.updateFov();
        party.camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function render(t) {
        requestAnimationFrame(render);
        TWEEN.update();

        cubes.map((cube) => {

            cube.rotation.x += 0.02;
            cube.rotation.y += 0.0187;
            cubeLight.intensity = 0.1 * Math.sin(t*0.002) + 0.6;
            cube.position.y = 0.1 * Math.sin(t*0.001) + 0.41
        })
        party.tick();


        renderer.render(scene, party.camera);
    }

    var lightCoords = [[3, 8],
                       [2, 2],
                       [5, 4],
                       [9, 2],
                       [24, 4],
                       [27, 7],
                       [24, 7],
                       [27, 4]];

    var modelLoader = new THREE.JSONLoader();
    var textureLoader = new THREE.TextureLoader();

    modelLoader.load('models/bare_bulb.json', function(obj) {
        textureLoader.load('textures/bare_bulb_color.png', function (color) {
            color.magFilter = THREE.NearestFilter;
            textureLoader.load('textures/bare_bulb_emissive.png', function (emissive) {
                var material = new THREE.MeshPhongMaterial({
                    map: color,
                    emissive: 0xffffff,
                    emissiveMap: emissive
                });

                for (var i=0; i < lightCoords.length; i+=1) {
                    var bulb = new THREE.Mesh(obj, material);
                    bulb.position.x = lightCoords[i][0]
                    bulb.position.z = lightCoords[i][1]
                    bulb.castShadow = true;
                    var bulbLight = new THREE.PointLight(0xfff0dd, 0.8, 4);
                    bulbLight.position.y = 0.871;
                    //bulbLight.castShadow = true;
                    bulbLight.shadowMapWidth = 512;
                    bulbLight.shadowMapHeight = 512;
                    bulbLight.shadowCameraNear = 0.075;
                    bulbLight.shadowCameraFar = 0.13;
                    bulb.add(bulbLight)
                    scene.add(bulb);
                }

                render();
            });
        });
    });
});
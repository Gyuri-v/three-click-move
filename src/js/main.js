import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { PreventDragClick } from './PreventDragClick';

const canvas = document.querySelector('.canvas');

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let AREAVALUE = 50;

let renderer, scene, camera, ambientLight, pointLight, orbitControls, raycaster, preventDragClick;
let pointerMesh;

const init = function () {
    // Renderer
    renderer = new THREE.WebGL1Renderer({ canvas, antialias: true });
    renderer.setSize(WIDTH, HEIGHT);

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#f5f5f5');
    
    // Camera
    camera = new THREE.PerspectiveCamera(70, WIDTH/HEIGHT, 0.1, 100);
    camera.position.set(0, 4, AREAVALUE / 2 + 5);
    // camera.lookAt(0, 4, 0);
    scene.add(camera);

    // Controls
    orbitControls = new OrbitControls( camera, renderer.domElement );
    orbitControls.maxPolarAngle = THREE.MathUtils.degToRad(85);
    orbitControls.target.set(0, 4, AREAVALUE / 2);
    orbitControls.enableZoom = false;

    // Light
    ambientLight = new THREE.AmbientLight('#fff', 0.5);
    pointLight = new THREE.PointLight('#fff', 1);
    pointLight.position.set(0, 2, 1);
    scene.add( ambientLight, pointLight );

    // Mesh
    createMesh();
}

const createMesh = function () {
    const basicGeometry = new THREE.BoxGeometry(AREAVALUE, AREAVALUE, 0.2);
    const basicMateroal = new THREE.MeshStandardMaterial({ color: '#444', side: THREE.DoubleSide });

    // floor
    const floorMesh = new THREE.Mesh(basicGeometry, basicMateroal);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.name = 'floor';
    scene.add(floorMesh);

    // Wall
    const wallMesh = new THREE.Mesh(basicGeometry, basicMateroal);
    wallMesh.position.set(0, AREAVALUE / 2, -AREAVALUE / 2)
    scene.add(wallMesh);

    // Box
    const boxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1), 
        new THREE.MeshStandardMaterial({ color: 'red' })
    );
    boxMesh.position.set(-5, 2, -AREAVALUE / 2);
    scene.add(boxMesh);

    // pointer
    pointerMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1), 
        new THREE.MeshStandardMaterial({ 
            color: 'crimson',
            transparent: true,
            opacity: 0.5,
        })
    );
    pointerMesh.rotation.x = -Math.PI / 2;
    pointerMesh.position.set(0, 0.11, AREAVALUE / 2 - 5);
    scene.add(pointerMesh);

    
}

const draw = function () {
    orbitControls.update();

    renderer.render( scene, camera );
    renderer.setAnimationLoop(draw);
}

const setSize = function () {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.left = -(WIDTH / HEIGHT);
    camera.right = WIDTH / HEIGHT;
    camera.top = 1;
    camera.bottom = -1;
    
    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.render(scene, camera);
}

init();
draw();
window.addEventListener('resize', setSize);
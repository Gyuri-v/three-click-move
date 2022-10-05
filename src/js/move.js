import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import gsap from 'gsap';
import { PreventDragClick } from './PreventDragClick';

const canvas = document.querySelector('.canvas');

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let AREAVALUE = 50;

let renderer, scene, camera, ambientLight, pointLight, orbitControls, pointerLockControls, raycaster, preventDragClick;
let pointerMesh;
let mousePoint = new THREE.Vector2();
let destinationPoint = new THREE.Vector3();
let meshes = [];
let isMouseClick = false;

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
    // orbitControls.target.set(0, 4, AREAVALUE / 2);
    orbitControls.enableZoom = false;
    orbitControls.maxDistance = 30; 
    orbitControls.minDistance = 4; 
    

    // Light
    ambientLight = new THREE.AmbientLight('#fff', 0.5);
    pointLight = new THREE.PointLight('#fff', 1);
    pointLight.position.set(0, 2, 1);
    scene.add( ambientLight, pointLight );

    // Mesh
    createMesh();

    // Raycaster
    raycaster = new THREE.Raycaster();

    // PreventDragClick
    preventDragClick = new PreventDragClick(canvas);

    // Event
    canvas.addEventListener('click', (e) => {
        if ( preventDragClick.mouseMoved ) return;
        isMouseClick = true;
        // calcMousePoint(e);
        raycasting();
    });
    canvas.addEventListener('mouseup', (e) => {
        // isPressed = false;
        isMouseClick = false;
    });
    canvas.addEventListener('mousemove', (e) => {
        calcMousePoint(e);
        raycasting();
    });
}

const createMesh = function () {
    const basicGeometry = new THREE.BoxGeometry(AREAVALUE, AREAVALUE, 0.2);
    const basicMateroal = new THREE.MeshStandardMaterial({ color: '#444', side: THREE.DoubleSide });

    // floor
    const floorMesh = new THREE.Mesh(basicGeometry, basicMateroal);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.name = 'floor';
    meshes.push(floorMesh);
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

const createMoveRoute = function () {
}

const calcMousePoint = function (e) {
    mousePoint.x = (e.clientX / canvas.clientWidth) * 2 - 1;
    mousePoint.y = -(e.clientY / canvas.clientHeight  * 2 - 1);
}

const raycasting = function () {
    raycaster.setFromCamera(mousePoint, camera);
    checkIntersects();
}

let cameraMoves, cameraMovesPoints;
let targetMoves, targetMovesPoints;
const checkIntersects = function () {
    const intersects = raycaster.intersectObjects(meshes);
    for (const item of intersects) {
        if ( item.object.name === 'floor' ) {
            destinationPoint.x = item.point.x;
            destinationPoint.y = 4;
            destinationPoint.z = item.point.z;

            if ( isMouseClick ) {
                // isCameraMoving = true;

                cameraMoves = new THREE.CatmullRomCurve3([
                    camera.position, 
                    new THREE.Vector3(camera.position.x, destinationPoint.y, camera.position.z + (destinationPoint.z - camera.position.z) / 2),
                    destinationPoint
                ])
                cameraMovesPoints = cameraMoves.getSpacedPoints(100);

                const cameraMovesLine = new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(cameraMovesPoints),
                    new THREE.LineBasicMaterial({ color: 'red' })
                );
                scene.add(cameraMovesLine);

                let cameraIntervalNum = 0;
                const cameraInterval = setInterval(function () {
                    camera.position.set(
                        cameraMovesPoints[cameraIntervalNum].x,
                        cameraMovesPoints[cameraIntervalNum].y,
                        cameraMovesPoints[cameraIntervalNum].z
                    );
                    cameraIntervalNum++
                }, 10);
                setTimeout(function () {
                    clearInterval(cameraInterval);
                }, 1000);

                isMouseClick = false;
            }
            
            pointerMesh.position.x = destinationPoint.x;
            pointerMesh.position.z = destinationPoint.z;
        }
    }
}

const draw = function () {
    console.log(orbitControls.target, camera.position)

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



/*
- draw 에서 적용되도록 수정
- lerp 이용
*/
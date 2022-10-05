import * as THREE from "three";
import { DoubleSide } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class App {
    constructor() {
        this.initialize();
        this.render();
    }
    initialize() {
        let scene = new THREE.Scene();
        let renderer = new THREE.WebGLRenderer();

        renderer.setClearColor(0x000000, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        window.onresize = this.resize.bind(this);

        this.renderer = renderer;
        this.scene = scene;
        this.scene.background = new THREE.Color('#f5f5f5');

        this.clock = new THREE.Clock();
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0); // 감속
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);           // 가속
        this._velocity = new THREE.Vector3(0, 0, 0);                     // 속도
        this._position = new THREE.Vector3();                            // 위치
        this._input = new BasicCharacterControllerInput();

        this.setCamera();
        this.setLight();
        this.setMeshes();
    }

    setMeshes() {
        let floor = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshStandardMaterial({ color: '#222', side: THREE.DoubleSide })
        );
        floor.position.set(0, 0, 0);
        floor.rotation.x = Math.PI / 2;
        
        let model = new THREE.Mesh(
            new THREE.BoxGeometry(1, 10, 1),
            new THREE.MeshStandardMaterial({ color: 'blue' })
        );
        model.position.y = 5;

        this.scene.add(floor, model);

        this.floor = floor;
        this.model = model;
    }

    thirdPersonCamera() {
        this.currentPosition = new THREE.Vector3();
        this.currentLookat = new THREE.Vector3();

        const idealOffset = new THREE.Vector3(-15, 20, -30);
        idealOffset.applyQuaternion(this.model.quaternion);
        idealOffset.add(this.model.position);

        const idealLookat = new THREE.Vector3(0, 10, 50);
        idealLookat.applyQuaternion(this.model.quaternion);
        idealLookat.add(this.model.position);

        const t = 1.0 - Math.pow(0.001, this.timeElapsedS);
        
        this.currentPosition.lerp(idealOffset, 0.3);
        this.currentLookat.lerp(idealLookat, 0.3);

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookat);
    }

    setCamera() {
        let camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            1.0,
            1000
        );
        camera.position.set(25, 10, 25);
        camera.lookAt(this.scene.position);
        this.scene.add(camera);

        this.camera = camera;
    }

    setLight() {
        let ambientLight = new THREE.AmbientLight('#fff', 0.5);
        let pointLight = new THREE.PointLight('#fff', 1);
        pointLight.position.set(0, 3, 1);
        
        this.scene.add(ambientLight, pointLight);
        
        this.ambientLight = ambientLight;
        this.pointLight = pointLight;
    }

    update() {
        // this.model.rotation.y += 0.02;
        // this.model.position.x = Math.sin(this.time) * 20;
        // this.model.position.z = Math.cos(this.time) * 20;
        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.multiplyScalar(timeInSeconds);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);

        const controlObject = this._target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();

        const acc = this._acceleration.clone();
        if (this._input._keys.shift) {
            acc.multiplyScalar(2.0);
        }

        if (this._input._keys.forward) {
            velocity.z += acc.z * timeInSeconds;
        }
        if (this._input._keys.backward) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this._input._keys.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this._input._keys.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
    }

    render(t) {
        this.time = this.clock.getElapsedTime();

        if (this._previousRAF === null) {
            this._previousRAF = t;
        }

        const timeElapsedS = (t - this._previousRAF) * 0.001;
        this.timeElapsedS = timeElapsedS;
        this._previousRAF = t;

        this.thirdPersonCamera();
        this.update();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }

    resize() {
        let camera = this.camera;
        let renderer = this.renderer;
        let scene = this.scene;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    }
}
window.onload = function () {
    new App();
};




class BasicCharacterControllerInput {
    constructor() {
        this._Init();
    }

    _Init() {
        this._keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false,
        };
        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }

    _onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this._keys.forward = true;
                break;
            case 65: // a
                this._keys.left = true;
                break;
            case 83: // s
                this._keys.backward = true;
                break;
            case 68: // d
                this._keys.right = true;
                break;
            case 32: // SPACE
                this._keys.space = true;
                break;
            case 16: // SHIFT
                this._keys.shift = true;
                break;
        }
    }

    _onKeyUp(event) {
        switch (event.keyCode) {
            case 87: // w
                this._keys.forward = false;
                break;
            case 65: // a
                this._keys.left = false;
                break;
            case 83: // s
                this._keys.backward = false;
                break;
            case 68: // d
                this._keys.right = false;
                break;
            case 32: // SPACE
                this._keys.space = false;
                break;
            case 16: // SHIFT
                this._keys.shift = false;
                break;
        }
    }
};
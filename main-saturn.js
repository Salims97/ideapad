import './style.css';
import * as THREE from 'three';
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui';



let camera, camera1, scene, renderer;
let controls, water, sun;
let earthMesh, cloudMesh, starMesh, group, seaEarthMesh, arrow;
let mouse;

//model
let vectorRocket, groupRocket, vectorCOG, vectorCOP;

//physics:
// center of gravity
let fThrust, fWeight, mdot, rocketMass, fuelMass, fullMass, angleOfAttack, zero, thrust, weight;
//gravity 
let gravityConst = 6.67428 * Math.pow(10, -11),
  r = 6278, earthMass = 5.97219 * Math.pow(10, 24);
//center of pressure 
let fDrag, drag, referenceArea, rho, dragCoefficient, liftCoefficient, theta, thetaRocket, lift, fLift;

//euler
let velocity, acceleration, dt = 0.01, rocketPosition;
var control;

//rotate 
let temp, dir, temp1, length1, angle, centerOfEarth, rotateAngle;




init();
animate();
// InitialPhyisics();
updatePhysics();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 25000);
  camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 25000);
  camera.position.z = 1;
  camera.position.y = 0.5;

  // scene.add(new THREE.AxesHelper(0.095 + 0.1106));


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);




  const earthGeometry = new THREE.SphereGeometry(100, 378, 50, 50);

  // earth material
  const earthMaterial = new THREE.MeshPhongMaterial({

    map: new THREE.TextureLoader().load('image/earthmap1k.jpg'),
    bumpMap: new THREE.TextureLoader().load('image/earthbump1k.jpg'),
    specularMap: new THREE.TextureLoader().load('image/specularmap.jpg'),
  });

  // earth mesh
  earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earthMesh);

  const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientlight);

  // point light
  const pointLight = new THREE.PointLight(0xffffff, 0.9);
  pointLight.position.set(16000, 50, 50);
  scene.add(pointLight);


  // cloud Geometry
  const cloudGeometry = new THREE.SphereGeometry(102, 50, 50);

  // cloud metarial
  const cloudMetarial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('image/earthCloud.png'),
    transparent: true,
  });

  // cloud mesh
  cloudMesh = new THREE.Mesh(cloudGeometry, cloudMetarial);
  scene.add(cloudMesh);

  // galaxy geometry
  const starGeometry = new THREE.SphereGeometry(800, 50, 50);

  // galaxy material
  const starMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('image/galaxy.png'),
    side: THREE.BackSide
  });

  // galaxy mesh
  starMesh = new THREE.Mesh(starGeometry, starMaterial);
  scene.add(starMesh);





  //create atmosphere 
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(95, 50, 50), new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  }));
  atmosphere.scale.set(1.1, 1.1, 1.1);
  scene.add(atmosphere);

  // mini window and the program still appears correctly
  window.addEventListener('resize', function () {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

  //control the camera movement
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();


  //All sea code 
  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.CircleGeometry(99, 100);

  water = new Water(

    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('image/waternormals.jpg', function (texture) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );
  water.rotation.x = - Math.PI / 2;
  water.position.y = -1;
  scene.add(water);


  const sky1 = new THREE.TextureLoader().load('image/Sky.jpeg');
  const geometryS = new THREE.SphereGeometry(100, 50, 50);
  const materialS1 = new THREE.MeshBasicMaterial({ map: sky1, transparent: false });
  var earth1 = new THREE.Mesh(geometryS, materialS1);
  earth1.material.side = THREE.BackSide;
  scene.add(earth1);

  // base 
  const gltfLoader = new GLTFLoader();

  gltfLoader.load('assets/models/base_of_rocket/scene.gltf',
    (gltf) => {
      const baseRocket = gltf.scene;
      scene.add(baseRocket);

      baseRocket.position.set(0, 0, 0);
      baseRocket.scale.set(0.2, 0.5, 0.2);
    }
  );

  //models combined
  groupRocket = new THREE.Group();

  //vector of the rocket
  vectorRocket = new THREE.Vector3();
  //rocket
  gltfLoader.load('assets/models/usa-nasa-rocket/scene.gltf',
    (gltf) => {
      const rockets = gltf.scene;
      rockets.position.set(0, 0.0889, 0);
      rockets.scale.set(0.0015, 0.0015, 0.0015);
      groupRocket.add(rockets);
    }
  );


  // //cylinder
  // gltfLoader.load('assets/models/oxigen_cylinder/scene.gltf',
  //   (gltf) => {
  //     const oxigenCylinder = gltf.scene;
  //     // console.log(oxigenCylinder);
  //     //scene.add(oxigenCylinder);

  //     oxigenCylinder.position.set(0.01, 0.09, 0);
  //     oxigenCylinder.scale.set(0.0015, 0.0025, 0.0015);
  //     groupRocket.add(oxigenCylinder);
  //   }
  // );
  // gltfLoader.load('assets/models/oxigen_cylinder/scene.gltf',
  //   (gltf) => {
  //     const oxigenCylinder1 = gltf.scene;
  //     oxigenCylinder1.position.set(-0.01, 0.09, 0);
  //     oxigenCylinder1.scale.set(0.0015, 0.0025, 0.0015);
  //     groupRocket.add(oxigenCylinder1);
  //   }
  // );





  scene.add(groupRocket);



  // initial value of phyisics
  angleOfAttack = Math.PI / 2;
  mdot = 2578 * 5;
  rocketMass = 282200;
  referenceArea = (10 * Math.PI) / 1000;

  acceleration = new THREE.Vector3();
  velocity = new THREE.Vector3();
  rocketPosition = new THREE.Vector3();
  vectorCOG = new THREE.Vector3();
  vectorCOP = new THREE.Vector3();
  centerOfEarth = new THREE.Vector3();

  // var aziz = new THREE.Vector3(2, 4, 6);
  // console.log(aziz, 'aziz');
  // //  aziz.multiplyScalar(2);
  // aziz = aziz.addScaledVector(aziz, 2);
  // console.log(aziz);

  //conrol-gui
  control = new function () {
    this.thrust = 33360000;
    this.fuelMass = 2539800;
    this.rho = 1.3;
    this.liftCoefficient = 0.5;
    this.dragCoefficient = 0.75;
  };
  addControls(control);
  function addControls(controlObject) {
    var gui = new GUI();
    gui.add(controlObject, 'thrust', 0, 33360000);
    gui.add(controlObject, 'fuelMass', 0, 2539800);
    gui.add(controlObject, 'rho', 0.5, 1.5);
    gui.add(controlObject, 'liftCoefficient', 0.3, 1.6);
    gui.add(controlObject, 'dragCoefficient', 0.4, 1.05);
  }
  fullMass = rocketMass + control.fuelMass;
  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return;
    }

    switch (event.key) {
      case "l":
        window.location.href = "index.html";
        break;
      default:
        return;
    }
    event.preventDefault();
  }, true);
}

function updatePhysics() {

  if (control.fuelMass == 0) {
    control.thrust = 0;
  }

  fThrust = new THREE.Vector3(control.thrust * Math.cos(angleOfAttack), control.thrust * Math.sin(angleOfAttack), 0);

  weight = gravityConst * fullMass * earthMass / (r * r * 1000000);
  fWeight = new THREE.Vector3(0, -weight, 0);

  //lift and drag in space equals zero
  if (groupRocket.position.distanceTo(centerOfEarth) >= 100) {
    drag = 0;
    lift = 0;
  } else {
    lift = 0.5 * control.rho * control.liftCoefficient * referenceArea * velocity.lengthSq();
    drag = 0.5 * control.rho * control.dragCoefficient * referenceArea * velocity.lengthSq();
  }

  fDrag = new THREE.Vector3(-drag * Math.cos(angleOfAttack), -drag * Math.sin(angleOfAttack), 0);
  fLift = new THREE.Vector3(-lift * Math.cos(angleOfAttack + Math.PI / 2), -lift * Math.sin(angleOfAttack + Math.PI / 2), 0);

  if (groupRocket.position.y < 0) {
    groupRocket.position.x = groupRocket.position.x;
    groupRocket.position.y = -0.01;
    groupRocket.position.z = groupRocket.position.z;
    groupRocket.rotation.z = -Math.PI / 2;
  } else {
    groupRocket.position.add(rocketPosition);
  }










  rotateAngle = Math.PI / 2 - angleOfAttack;
  if (!isNaN(thetaRocket) && groupRocket.position.length() > 1 && groupRocket.position.length() <= 10) {
    groupRocket.rotation.z = -rotateAngle / 10;

  } else if (!isNaN(thetaRocket) && groupRocket.position.length() > 10 && groupRocket.position.length() <= 35) {
    groupRocket.rotation.z = -rotateAngle / 5;
  } else if (!isNaN(thetaRocket) && groupRocket.position.length() > 35 && groupRocket.position.length() <= 49) {
    groupRocket.rotation.z = -rotateAngle / 3;
  } else if (!isNaN(thetaRocket) && groupRocket.position.length() > 49 && groupRocket.position.length() <= 65) {
    groupRocket.rotation.z = -rotateAngle / 2;
  } else if (!isNaN(thetaRocket) && groupRocket.position.length() > 65 && groupRocket.position.length() <= 85) {
    groupRocket.rotation.z = -rotateAngle / 1.5;
  } else if (!isNaN(thetaRocket) && groupRocket.position.length() > 85) {
    groupRocket.rotation.z = -rotateAngle;
  }
}








//this code runs every second 
setInterval(function () {
  //mass flow rate relationship with fuel
  if (fullMass > rocketMass) {
    control.fuelMass -= mdot;
    fullMass = control.fuelMass + rocketMass;
  }

  if (fullMass <= rocketMass) {
    fullMass = rocketMass;
    control.fuelMass = 0;
  }

  //adding thrust + weight
  vectorCOG.addVectors(fWeight, fThrust);
  //adding lift :-) + drag
  vectorCOP.addVectors(fDrag, fLift);
  vectorRocket.addVectors(vectorCOG, vectorCOP);

  //euler
  acceleration = vectorRocket.divideScalar(fullMass * 1000);
  velocity = velocity.addScaledVector(acceleration, dt);
  rocketPosition = rocketPosition.addScaledVector(velocity, dt);
  r = groupRocket.position.y + 6278;

  //euler rules for integration
  //velocity += acceleration *dt;
  //position += velocity * dt;



  //rotation angle || الحركة الدائرية
  temp1 = velocity;
  length1 = temp1.length();
  angle = 0.343 / length1;
  //transform to radian
  theta = angle * Math.PI / 180;
  thetaRocket = Math.asin(theta);
  if (!isNaN(thetaRocket)) {
    angleOfAttack = thetaRocket;
  }

  //arrow helpers
  temp = new THREE.Vector3();
  temp.copy(groupRocket.position);
  dir = temp.normalize();
  const origin = groupRocket.position;
  const length = 0.05;
  const hex = 0xff0000;
  arrow = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrow);

  // the physics printed on screen
  // console.log('thrust : ', fThrust);
  // console.log('weight : ', fWeight);
  // console.log('drag : ', fDrag);
  // console.log('lift : ', fLift);
  // console.log('angleOfAttack:', angleOfAttack, 'theta', thetaRocket);
  // console.log('acceleration: ', acceleration);
  // console.log('velocity: ', velocity);
  // console.log('rocket Position: ', groupRocket.position);
  // console.log();



}, 1000);



function animate() {



  setTimeout(function () {

    requestAnimationFrame(animate);

  }, 1000 / 30);


  updatePhysics();
  render();

  earthMesh.rotation.y += 0.0015;
  cloudMesh.rotation.y += 0.0010;
  starMesh.rotation.y += 0.0005;

}

function render() {
  water.material.uniforms['time'].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}



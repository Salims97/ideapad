import './style.css';
import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl';
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
//import vShader from './shaders/vertex.glsl.js';
//import fShader from './shaders/fragment.glsl.js'
import fragmentShader from './shaders/fragment.glsl';
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { BackSide } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import RocketBody from './assets/src/scripts/rocke_body';
import { AxesHelper } from 'three';
console.log(THREE);

//console.log(vertexShader);
//console.log(fragmentShader);

// document.querySelector('#app').innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `

let camera, scene, renderer;
let controls, water, sun;
let earthMesh, cloudMesh, starMesh, group, seaEarthMesh;
let mouse;
//model
let vectorRocket, groupRocket, vectorCOG, vectorCOP;
//physics:
// center of gravity
let fThrust, fWeight, mdot, rocketMass, fuelMass, fullMass, angleOfAttack, zero, thrust, weight;
//gravity 
let gravityConst = 6.67428 * Math.pow(10, -11), r = 6278, earthMass = 5.97219 * Math.pow(10, 24);
//center of pressure 
let fDrag, drag, referenceArea, rho, dragCoefficient;
//euler
let velocity, acceleration, dt = 0.01, rocketPosition;
init();
animate();
// InitialPhyisics();
updatePhysics();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 25000);
  camera.position.z = 10;
  camera.position.y = 5;

  scene.add(new THREE.AxesHelper(5000));
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);



  const sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50), new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,

    uniforms: {
      globeTexture:
      {
        value: new THREE.TextureLoader().load('image/earth.jpeg')
      }
    }

  }));

  const earthGeometry = new THREE.SphereGeometry(100, 378, 50, 50);

  // earth material
  const earthMaterial = new THREE.MeshPhongMaterial({
    // roughness: 1,
    // metalness: 0,
    map: new THREE.TextureLoader().load('image/earthmap1k.jpg'),
    bumpMap: new THREE.TextureLoader().load('image/earthbump1k.jpg'),
    bumpScale: 3.7,
    specularMap: new THREE.TextureLoader().load('image/specularmap.jpg'),
    //specular:new THREE.Color('red')
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
  const cloudGeometry = new THREE.SphereGeometry(103, 50, 50);

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




  //this is how to import from another java script file
  var rocket = new RocketBody(/*put some positions*/);





  //  const geometrybump=new THREE.SphereGeometry(0.5, 32, 32);
  //  const materialbump=new THREE.MeshPhongMaterial();
  //  const maptexture=new THREE.TextureLoader().load('image/earth.jpeg')
  //   materialbump.map=maptexture
  //   materialbump.bumpMap=new THREE.TextureLoader().load('image/bump.jpg')
  //  materialbump.bumpScale=0.005
  // materialbump.specularMap=new THREE.TextureLoader().load('image/water.png')
  // materialbump.specular=new THREE.Color('red')
  //  materialbump.transparent=false
  //  materialbump.side=BackSide
  //  const spherebump=new THREE.Mesh(geometrybump,materialbump)
  //scene.add(spherebump)

  //create atmosphere 
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(100, 50, 50), new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  }));
  atmosphere.scale.set(1.1, 1.1, 1.1);
  scene.add(atmosphere);

  group = new THREE.Group();
  //group.add(sphere)
  //group.add(spherebump)
  scene.add(group);



  //animate
  mouse = {
    x: undefined,
    y: undefined
  };
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();


  //All sea code 
  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.CircleGeometry(100, 1000);

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
  // water.position.set(0, 6278, 0);
  water.rotation.x = - Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(1);
  sky.geometry = new THREE.SphereGeometry(100);
  //scene.add( sky );

  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sky1 = new THREE.TextureLoader().load('image/Sky.jpeg');
  const geometryS = new THREE.SphereGeometry(100, 50, 50);
  const materialS1 = new THREE.MeshBasicMaterial({ map: sky1, transparent: false });
  var earth1 = new THREE.Mesh(geometryS, materialS1);
  earth1.material.side = THREE.BackSide;
  scene.add(earth1);

  function updateSun() {

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;

  }

  updateSun();
  const waterUniforms = water.material.uniforms;






  // base 
  const gltfLoader = new GLTFLoader();

  gltfLoader.load('assets/models/base_of_rocket/scene.gltf',
    (gltf) => {
      const baseRocket = gltf.scene;
      // console.log(baseRocket);
      scene.add(baseRocket);

      baseRocket.position.set(0, 0, 0);
      baseRocket.scale.set(4, 4, 4);
    }
  );

  groupRocket = new THREE.Group();
  vectorRocket = new THREE.Vector3(0, 0.1, 0);
  //rocket
  gltfLoader.load('assets/models/rocket_model/scene.gltf',
    (gltf) => {
      const rockets = gltf.scene;
      // console.log(rockets);
      // scene.add(rockets);

      rockets.position.set(0, 3.9, 0);
      rockets.scale.set(2, 2, 2);
      groupRocket.add(rockets);
    }
  );



  //cylinder



  gltfLoader.load('assets/models/oxigen_cylinder/scene.gltf',
    (gltf) => {
      const oxigenCylinder = gltf.scene;
      // console.log(oxigenCylinder);
      //scene.add(oxigenCylinder);

      oxigenCylinder.position.set(0.45, 1.5, 0);
      oxigenCylinder.scale.set(0.15, 0.25, 0.15);
      groupRocket.add(oxigenCylinder);
    }
  );
  gltfLoader.load('assets/models/oxigen_cylinder/scene.gltf',
    (gltf) => {
      const oxigenCylinder1 = gltf.scene;
      // console.log(oxigenCylinder1);
      //scene.add(oxigenCylinder1);

      oxigenCylinder1.position.set(-0.45, 1.5, 0);
      oxigenCylinder1.scale.set(0.15, 0.25, 0.15);
      groupRocket.add(oxigenCylinder1);
    }
  );



  scene.add(groupRocket);

  // addCylinder(8,30,0);
  //addCylinder(-8,30,0);



  // initial value of phyisics
  thrust = 3800000; //57800000;
  angleOfAttack = Math.PI / 2;
  mdot = 3000;
  rocketMass = 33000;
  fuelMass = 30000;
  fullMass = rocketMass + fuelMass;

  rho = 1.3;
  referenceArea = 0.112;
  dragCoefficient = 0.75;
  acceleration = new THREE.Vector3();
  velocity = new THREE.Vector3();
  rocketPosition = new THREE.Vector3();
  vectorCOG = new THREE.Vector3();
  vectorCOP = new THREE.Vector3();


  var aziz = new THREE.Vector3(2, 4, 6);
  console.log(aziz, 'aziz');
  //  aziz.multiplyScalar(2);
  aziz = aziz.addScaledVector(aziz, 2);
  console.log(aziz);


  //euler


}











function updatePhysics() {



  if (fuelMass == 0) {
    thrust = 0;
  }

  // console.log(fWeight,fThrust);
  //  console.log(groupRocket.position,fuelMass);
  fThrust = new THREE.Vector3(thrust * Math.cos(angleOfAttack), thrust * Math.sin(angleOfAttack), 0);

  weight = gravityConst * fullMass * earthMass / (r * r * 1000000);

  fWeight = new THREE.Vector3(0, -weight, 0);


  drag = 0.5 * rho * dragCoefficient * referenceArea * velocity.length() * velocity.length();
  fDrag = new THREE.Vector3(-drag * Math.cos(angleOfAttack), -drag * Math.sin(angleOfAttack), 0);




  // r += rocketPosition.y;


  // console.log(vectorCOG);
  // console.log();
  // console.log(Math.pow(5,2));
  // console.log(groupRocket.position);
  // console.log(Math.cos(angleOfAttack));



  // console.log(rocketPosition);



  //   velocity += acceleration * dt;
  //   position += velocity * dt;

  if (groupRocket.position.y < 0) {
    groupRocket.position.x = 0;
    groupRocket.position.y = -0.1;
    groupRocket.position.z = 5;
    groupRocket.rotation.z = - Math.PI / 2;
  } else {
    groupRocket.position.add(rocketPosition);
  }
  //  console.log(groupRocket.position,rocketPosition);
}



//this code runs every second 
setInterval(function () {



  if (fullMass > rocketMass) {
    fuelMass -= mdot;
    fullMass = fuelMass + rocketMass;
  }

  if (fullMass <= rocketMass) {
    fullMass = rocketMass;
    fuelMass = 0;
  }

  vectorCOG.addVectors(fWeight, fThrust);
  vectorCOP.add(fDrag/*,fLift */);
  vectorRocket.addVectors(vectorCOG, vectorCOP);

  acceleration = vectorRocket.divideScalar(fullMass);
  velocity = velocity.addScaledVector(acceleration, dt);
  rocketPosition = rocketPosition.addScaledVector(velocity, dt);

  console.log(fDrag);
  // console.log(fuelMass, fullMass);


}, 1000);




function animate() {



  setTimeout(function () {

    requestAnimationFrame(animate);

  }, 1000 / 30);


  updatePhysics();
  render();

  // if (fullMass > rocketMass) {
  //   fuelMass -= mdot;
  //   fullMass = fuelMass + rocketMass;
  // }

  // if (fullMass <= rocketMass) {
  //   fullMass = rocketMass;
  //   fuelMass = 0;
  // }

  // updatePhysics();
  // sphere.rotation.y+=0.001
  earthMesh.rotation.y += 0.0015;
  cloudMesh.rotation.y += 0.0010;
  starMesh.rotation.y += 0.0005;

  group.rotation.y += 0.001;
  group.rotation.y = mouse.x * 0.5;
  //groupRocket.rotation.y+=0.01;
  // groupRocket.position.add(vectorRocket);
  // console.log(groupRocket.position);





}

function render() {
  water.material.uniforms['time'].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}

addEventListener('mousemove', () => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 - 1;
  // console.log(mouse)
});

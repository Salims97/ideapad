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
console.log(THREE);

//console.log(vertexShader);
//console.log(fragmentShader);

// document.querySelector('#app').innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `

let camera, scene, renderer;
let controls, water, sun;
let earthMesh, cloudMesh, starMesh, group, seaEarthMesh,grouproket;
let mouse;
let fthrust;
let rockets1,oxigen_cylinder10,oxigen_cylinder20;
init();
animate();
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.z = 20;

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

  const earthGeometry = new THREE.SphereGeometry(2000, 50, 50);

  // earth material
  const earthMaterial = new THREE.MeshPhongMaterial({
    roughness: 1,
    metalness: 0,
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
  const cloudGeometry = new THREE.SphereGeometry(2005, 50, 50);

  // cloud metarial
  const cloudMetarial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('image/earthCloud.png'),
    transparent: true,
  });

  // cloud mesh
  cloudMesh = new THREE.Mesh(cloudGeometry, cloudMetarial);
  scene.add(cloudMesh);

  // galaxy geometry
  const starGeometry = new THREE.SphereGeometry(5000, 50, 50);

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
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2000, 50, 50), new THREE.ShaderMaterial({
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

  const waterGeometry = new THREE.CircleGeometry(1300, 10000);

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

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(1);
  sky.geometry = new THREE.SphereGeometry(2000);
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
  const geometryS = new THREE.SphereGeometry(1995, 50, 50);
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
fthrust=new THREE.Vector3(0,0.1,0)






  // base 
  const gltfLoader = new GLTFLoader();

  gltfLoader.load('assets/models/base_of_rocket/scene.gltf',
    (gltf) => {
      const baseRocket = gltf.scene;
      console.log(baseRocket);
      scene.add(baseRocket);

      baseRocket.position.set(0, 0, 0);
      baseRocket.scale.set(100, 100, 100);
    }
  );

grouproket=new THREE.Group();

  //rocket
  gltfLoader.load('assets/models/rocket_model/scene.gltf',
    (gltf) => {
      const rockets = gltf.scene;
      //console.log(rockets);
     // scene.add(rockets);

      rockets.position.set(0, 80, 0);
      rockets.scale.set(40, 40, 40);
     grouproket.add(rockets)
    }
  );



  //cylinder
  
    
  
  gltfLoader.load('assets/models/oxigen_cylinder/scene.gltf',
    (gltf) => {
      const oxigenCylinder = gltf.scene;
     // console.log(oxigenCylinder);
      //scene.add(oxigenCylinder);

      oxigenCylinder.position.set(8, 30, 0);
      oxigenCylinder.scale.set(2.5, 5, 2);
      grouproket.add(oxigenCylinder)
    }
  );
  gltfLoader.load('assets/models/oxigen_cylinder/scene.gltf',
    (gltf) => {
      const oxigenCylinder1 = gltf.scene;
     // console.log(oxigenCylinder1);
      //scene.add(oxigenCylinder1);

      oxigenCylinder1.position.set(-8, 30, 0);
      oxigenCylinder1.scale.set(2.5, 5, 2);
      grouproket.add(oxigenCylinder1)
    }
  );


  
  scene.add(grouproket);


 






 // addCylinder(8,30,0);
  //addCylinder(-8,30,0);

}
function animate() {
  requestAnimationFrame(animate);
  render();

  // sphere.rotation.y+=0.001
  earthMesh.rotation.y += 0.0015;
  cloudMesh.rotation.y += 0.0010;
  starMesh.rotation.y += 0.0005;

  group.rotation.y += 0.001;
  group.rotation.y = mouse.x * 0.5;
//grouproket.rotation.y+=0.01;
//  grouproket.position.y+=0.1
grouproket.position.add(fthrust);
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

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let gltfLoader,scene;
export default class RocketBody {

    constructor(name, position, mass, velocity, acceleration, rotation) {
        this.name = name;
        this.position = position;
        this.mass = mass;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.rotation = rotation;
    }


    

    
     addRocketModel() {
        gltfLoader = new GLTFLoader();
        scene = new THREE.Scene();
        gltfLoader.load('assets/models/rocket_model/scene.gltf',
          (gltf) => {
         const     rockets = gltf.scene;
            // console.log(rockets);
            // modelGroup.add(rockets);
            scene.add(rockets);
        
            rockets.position.set(this.position.x,this.positiony,this.position.z);
            rockets.scale.set(40, 40, 40);
            
          }
    
        );
    
    
    
    
        //cylinder
    
        gltfLoader.load('assets/models/oxigen_cylinder/scene.gltf',
          (gltf) => {
            const oxigenCylinder1 = gltf.scene;
            // console.log(oxigenCylinder);
            // modelGroup.add(oxigenCylinder1);
            scene.add(oxigenCylinder1);
            // scene.add(modelGroup);
            oxigenCylinder1.position.set(this.position.x + 8 ,this.position.y - 50,this.position.z);
            oxigenCylinder1.scale.set(2.5, 5, 2);
          }
        );
    
        gltfLoader.load('assets/models/oxigen_cylinder/scene.gltf',
          (gltf) => {
            const oxigenCylinder2 = gltf.scene;
            // console.log(oxigenCylinder);
            // modelGroup.add(oxigenCylinder2);
            scene.add(oxigenCylinder2);
            // scene.add(modelGroup);
            oxigenCylinder2.position.set(this.position.x - 8,this.position.y - 50 ,this.position.z);
            oxigenCylinder2.scale.set(2.5, 5, 2);
          }
        );
    
    
      }

      addCube(){
        const geometry = new THREE.BoxGeometry( 5,5,5 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
        console.log('aziz');
      }

    }



//      setPosition(position) {
    //         this.position = position;
    //         this.loadedModel.position.x = this.position.x ;
    //         this.loadedModel.position.y = this.position.y ;
    //         this.loadedModel.position.z = this.position.z ;
    //     }

    // addRocket() {
    //     gltfloader.load('assets/models/rocket_model/scene.gltf',
    //       (gltf) => {
    //         const rockets = gltf.scene;
    //         // console.log(rockets);
    //         scene.add(rockets);
    
    //         rockets.position.set(this.position);
    //         rockets.scale.set(40, 40, 40);
    //       }
    
    //     );
    //   }
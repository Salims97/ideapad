import { Vector3 } from "three";

export default class RocketBody{

    constructor(name,model,position,mass,velocity,acceleration ){
        this.name = name;
        this.model = model;
        this.position = position;
        this.mass = mass;
        this.velocity = velocity;
        this.acceleration = acceleration;
     

    }
    
}
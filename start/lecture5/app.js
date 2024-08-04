import * as THREE from 'three';
import { OrbitControls } from '../../libs/three/examples/jsm/controls/OrbitControls.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 0, 4 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xaaaaaa );

		const ambient = new THREE.HemisphereLight( 0xFFFFFF, 0xBBBBFF, 0.3);
		this.scene.add( ambient );

		const light = new THREE.DirectionalLight(0xFFFFFF, 3);
		light.position.set( 0.2, 1, 1);
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( this.renderer.domElement );
        this.renderer.setAnimationLoop(this.render.bind(this));

		//TO DO: Add code here

		const controls = new OrbitControls( this.camera, this.renderer.domElement );
    
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    resize(){
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    
	render( ) {  
		this.renderer.render( this.scene, this.camera );
    }
}

export { App };
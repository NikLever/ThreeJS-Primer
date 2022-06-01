import * as THREE from 'three';
import { OrbitControls } from '../../libs/three140/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../../libs/three140/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three140/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from '../../libs/three140/examples/jsm/loaders/RGBELoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { GUI } from '../../libs/three140/examples/jsm/libs/lil-gui.module.min.js'

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();

		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 0.8, 2.5 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xaaaaaa );
        
		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight( 0xFFFFFF, 1.5 );
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        container.appendChild( this.renderer.domElement );
		this.setEnvironment();
		
        this.loadingBar = new LoadingBar();
        
        this.loadGLTF();
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.y = 0.8;
        this.controls.update();

        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    setEnvironment(){
        const loader = new RGBELoader();
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( '../../assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }
    
    loadGLTF(){
        const loader = new GLTFLoader( ).setPath('../../assets/');
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three140/examples/js/libs/draco/' );
        loader.setDRACOLoader( dracoLoader );

		// Load a glTF resource
		loader.load(
			// resource URL
			'knight.glb',
			// called when the resource is loaded
			gltf => {
                
                
                this.knight = gltf.scene;

                this.knight.traverse( child => {
                    if (child.isMesh && child.name == 'Cube') child.visible = false;
                });
                
                this.mixer = new THREE.AnimationMixer( this.knight );
                this.animations = {};

                const names = [];

                gltf.animations.forEach( clip => {
                    const name = clip.name.toLowerCase();
                    names.push(name);
                    this.animations[name] = clip;
                })

                console.log( `animations: ${names.join(',')}`);
                
                this.action = 'look around';

                const options = { name: 'look around' };

                const gui = new GUI();
                gui.add(options, 'name', names).onChange( name => { this.action = name });

				this.scene.add( gltf.scene );
                
                this.loadingBar.visible = false;
				
				this.renderer.setAnimationLoop( this.render.bind(this));
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			err => {

				console.error( err.message );

			}  
        );
    }

    set action(name){
		if (this.actionName == name.toLowerCase()) return;
				
		const clip = this.animations[name.toLowerCase()];

		if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
			if (name=='die'){
				action.clampWhenFinished = true;
				action.setLoop( THREE.LoopOnce );
			}
			action.reset();
			const nofade = this.actionName == 'die';
			this.actionName = name.toLowerCase();
			action.play();
			if (this.curAction){
				if (nofade){
					this.curAction.enabled = false;
				}else{
					this.curAction.crossFadeTo(action, 0.5);
				}
			}
			this.curAction = action;
		}
	}
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        const dt = this.clock.getDelta();
        if (this.mixer) this.mixer.update(dt);
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };
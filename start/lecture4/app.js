import * as THREE from 'three';
import { OrbitControls } from '../../libs/three140/examples/jsm/controls/OrbitControls.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );

        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    resize(){

    }
    
	render( ) {   
		
    }
}

export { App };

            var container, stats;
            var camera, scene, renderer;
            var mesh, w, h;
            var windowHalfX = window.innerWidth / 2;
            var windowHalfY = window.innerHeight / 2;
            var earth, clouds, sky;
            var imgDir = '/img/';
            var Shaders = {
            	    'earth' : {
            	      uniforms: {
            	        'texture': { type: 't', value: 0, texture: null }
            	      },
            	      vertexShader: [
            	        'varying vec3 vNormal;',
            	        'varying vec2 vUv;',
            	        'void main() {',
            	          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            	          'vNormal = normalize( normalMatrix * normal );',
            	          'vUv = uv;',
            	        '}'
            	      ].join('\n'),
            	      fragmentShader: [
            	        'uniform sampler2D texture;',
            	        'varying vec3 vNormal;',
            	        'varying vec2 vUv;',
            	        'void main() {',
            	          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
            	          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
            	          'vec3 atmosphere = vec3( 0.7, 0.6, 1.0 ) * pow( intensity, 3.0 );',
            	          'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
            	        '}'
            	      ].join('\n')
            	    },
            	    'atmosphere' : {
              	      uniforms: {
              	        'texture': { type: 't', value: 0, texture: null }
              	      },
            	      vertexShader: [
            	        'varying vec3 vNormal;',
            	        'void main() {',
            	          'vNormal = normalize( normalMatrix * normal );',
            	          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            	        '}'
            	      ].join('\n'),
            	      fragmentShader: [
            	        'varying vec3 vNormal;',
            	        'void main() {',
            	          'float intensity = pow( 0.9 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 7.0 );',
            	          'gl_FragColor = vec4( 0.2, 0.4, 1.0, 0.4 ) * .1* intensity ;',
            	        '}'
            	      ].join('\n')
            	    }
            	  };
            
            init();
            animate();
            function init() {
                container = document.getElementById( 'geo' );
                w = container.offsetWidth || window.innerWidth;
                h = container.offsetHeight || window.innerHeight;
                camera = new THREE.Camera( 60, 1, 1, 10000 );
                camera.position.z = 800;
                camera.position.y = 400;
                scene = new THREE.Scene();
                sceneAtmosphere = new THREE.Scene();

                var geometry = new THREE.Sphere(200, 40, 30);

                shader = Shaders['earth'];
                uniforms = THREE.UniformsUtils.clone(shader.uniforms);
                uniforms['texture'].texture = THREE.ImageUtils.loadTexture(imgDir+'world.jpg');

                material = new THREE.MeshShaderMaterial({
                      uniforms: uniforms,
                      vertexShader: shader.vertexShader,
                      fragmentShader: shader.fragmentShader
                    });

                earth = new THREE.Mesh(geometry, material);
                earth.matrixAutoUpdate = true;
                scene.addObject(earth);

              
                shader = Shaders['atmosphere'];
                uniforms = THREE.UniformsUtils.clone(shader.uniforms);
                material = new THREE.MeshShaderMaterial({
                      uniforms: uniforms,
                      vertexShader: shader.vertexShader,
                      fragmentShader: shader.fragmentShader
                    });
                sky = new THREE.Mesh(geometry, material);
                sky.scale.x = sky.scale.y = sky.scale.z = 1.8;
                sky.flipSided = true;
                sky.matrixAutoUpdate = false;
                sky.updateMatrix();
                sceneAtmosphere.addObject(sky);  
                
                
                
                renderer = new THREE.WebGLRenderer({antialias: true});
                renderer.autoClear = false;
                renderer.setClearColorHex(0x000000, 0.0);
                renderer.setSize(w,h);

                renderer.domElement.style.position = 'absolute';

                container.appendChild(renderer.domElement);
                
                if(typeof Stats !== "undefined"){
	                stats = new Stats();
	                stats.domElement.style.position = 'absolute';
	                stats.domElement.style.top = '0px';
	                container.appendChild( stats.domElement );
            	}
            }
            function animate() {
                requestAnimationFrame( animate );
                render();
                if(typeof Stats !== "undefined"){stats.update();}
            }

            function render() {
//                camera.position.x += ( mouseX - camera.position.x ) * 0.05;
//                camera.position.y += ( - mouseY - camera.position.y ) *0.8;
                earth.rotation.y += .02;
                renderer.render( scene, camera );
                renderer.render( sceneAtmosphere, camera );
            }

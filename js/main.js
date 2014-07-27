      //dom elements
      var title = document.getElementById("title");
      var projectName = document.getElementById("projectName");
      var logo = document.getElementById("logo");
      var fullscreen = document.getElementById("fullscreen");

      //scene variables
      var container, scene, renderer;
      var camera, cameraLeft, cameraRight
      var user, hud;
      var geometry, material, mesh, objects, sphere;

      //vr and resize variables
      var vrEffect;
      var vrControls;
      var radius = 100, theta = 0;

      //collada variables
      var model;
      var modelURL = "models/_new/ffos-1.dae"
      var animations;
      var kfAnimations = [ ];
      var kfAnimationsLength = 0;
      var loader = new THREE.ColladaLoader();
      var lastTimestamp;
      var progress = 0;


      //in this scene, loadModel kicks things off.
      //Rest of scene setup does not start until DAE has loaded.
      function loadModel() {

        loader.load( modelURL, function( collada ) {

          model = collada.scene;
          animations = collada.animations;
          kfAnimationsLength = animations.length;
          model.scale.x = model.scale.y = model.scale.z = 1.0;
          model.position.z = 0;
          //applyDoubleSide(model);

          /*
          setMaterial(model, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: false,
            opacity: 1,
            wireframe: false
          }))
          */
          projectName.className = projectName.className + "stereo";
          title.className = title.className + "fadeOut";
          logo.className = logo.className + "fadeOut";
          fullscreen.className = "fadeIn";

          logo.addEventListener( "animationend", proceed, false );

          function proceed() {
            title.className = title.className + " hidden";
            logo.className = logo.className + " hidden";
            init();
            start();
            animate(lastTimestamp);
          }

          /*
          //Some Tween.js stuff I'm not going to use

            var tween = new TWEEN.Tween( sphere.material ).to( { opacity: 0 }, 1000 );
            tween.easing(TWEEN.Easing.Cubic.In);
            tween.start();

            var tween = new TWEEN.Tween( { x: 50, y: 0 } )
                    .to( { x: 400 }, 2000 )
                    .easing( TWEEN.Easing.Elastic.InOut )
                    .onUpdate( function () {

                        output.innerHTML = 'x == ' + Math.round( this.x );
                        var transform = 'translateX(' + this.x + 'px)';
                        output.style.webkitTransform = transform;
                        output.style.transform = transform;

                    } )
                    .start();
              */
        } );
      }


      //function, adds DoubleSide to all materials found in scene
      var applyDoubleSide = function (node) {
        if (node.material) {
          node.material.side = THREE.DoubleSide;
        }
        if ( node.children ) {
          for (var i = 0; i < node.children.length; i++) {
            applyDoubleSide( node.children[i] );
          }
        }
      }


      var setMaterial = function(node, material) {
        node.material = material;
        node.material.side = THREE.DoubleSide;
        if (node.children) {
          for (var i = 0; i < node.children.length; i++) {
            setMaterial(node.children[i], material);
          }
        }
      }


      function init() {

        //setup event handlers
        fullscreen.onclick = function() {
          vrEffect.setFullScreen( true );
        };

          window.addEventListener( "keypress", onkey, true);
        window.addEventListener( "resize", onWindowResize, false );

        //setup container, renderer, scene
        container = document.getElementById("container");
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
        });
        renderer.antialias = true;
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild(renderer.domElement);
        scene = new THREE.Scene();

        //setup VR rendere and controls
        vrEffect = new THREE.VREffect(renderer, VREffectLoaded);
        vrControls = new THREE.VRControls(camera);

        function VREffectLoaded(error) {
          if (error) {
            //fullscreen.innerHTML = error;
            //fullscreen.classList.add('error');
          }
        }

        //setup lights
        /**/
        var light = new THREE.DirectionalLight( 0xffffff, .8 );
        light.position.set( 2, 2, 20 );
        scene.add( light );


        //setup floor
        /*
        var floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20,20,1,1),
            new THREE.MeshBasicMaterial( {color: 0x0099ff} )
          );
        floor.material.side = THREE.DoubleSide;
        floor.position.set(0,0,0)
        floor.rotation.set(1, 0, 0);
        scene.add(floor);
        */

        //setup collada model
        scene.add(model);

        //setup inner white sphere
        /*
        sphere = new THREE.Mesh(
          new THREE.SphereGeometry(100,32,32),
          new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 1 } )
          //new THREE.MeshBasicMaterial( {color: 0xffffff} )
        );
        sphere.material.side = THREE.DoubleSide;
        scene.add(sphere);
        */

        //setup background image sphere
        var bg = new THREE.Mesh(
          new THREE.SphereGeometry( 2000, 60, 40 ),
          new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/bg3.jpg' ) } )
        );
        bg.material.side = THREE.DoubleSide;

        scene.add(bg);


        // setup KeyFrame Animations

        for ( var i = 0; i < kfAnimationsLength; ++i ) {

          var animation = animations[ i ];
          THREE.AnimationHandler.add( animation );

          var kfAnimation = new THREE.KeyFrameAnimation( animation );
          kfAnimation.timeScale = 1;
          kfAnimations.push( kfAnimation );
        }


        //setup user
        user = new THREE.Object3D();
        user.position.set(0,1.7,0)
        scene.add(user)

        //setup camera
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.set(0,0,0)
        user.add(camera);

        //setup HUD
        hud = new THREE.Object3D();
        hud.position.set(0,0,-100);
        user.add(hud);

        var map = new THREE.Mesh(
            new THREE.PlaneGeometry(20,20,1,1),
            new THREE.MeshBasicMaterial( {color: 0xff03f1, transparent: true, opacity: 1} )
          );
        map.material.side = THREE.DoubleSide;
        map.position.set(-44,44,0)
        //hud.add(map);

      }

      function onkey(event) {
        if (event.charCode == 'f'.charCodeAt(0)) {
          vrEffect.setFullScreen( true );
        } else if (event.charCode == 'v'.charCodeAt(0)) {
          vrEffect.setFullScreen( true );
        } else {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
      }


      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );

      }


      function animate() {

        //Collada-related
        var timestamp = Date.now();
        var frameTime = ( timestamp - lastTimestamp ) * 0.001; // seconds

        if ( progress >= 0 && progress < 9 ) {

          for ( var i = 0; i < kfAnimationsLength; ++i ) {

            kfAnimations[ i ].update( frameTime );
          }

        } else if ( progress >= 9 ) {

          for ( var i = 0; i < kfAnimationsLength; ++i ) {

            kfAnimations[ i ].stop();
          }

          progress = 0;
          start();

        }

        progress += frameTime;
        lastTimestamp = timestamp;

        //TWEEN.update();
        render();
        requestAnimationFrame( animate );

      }


      function render() {

        vrControls.update();
        //vrEffect.render( scene, camera );
        renderer.render( scene, camera );

      }

      //start
      //starts animation loop. Is called by animate() when playhead advances to X, to restart loop.
      function start() {

        //start keyframes
        for ( var i = 0; i < kfAnimationsLength; ++i ) {

          var animation = kfAnimations[i];

          for ( var h = 0, hl = animation.hierarchy.length; h < hl; h++ ) {

            var keys = animation.data.hierarchy[ h ].keys;
            var sids = animation.data.hierarchy[ h ].sids;
            var obj = animation.hierarchy[ h ];

            if ( keys.length && sids ) {

              for ( var s = 0; s < sids.length; s++ ) {

                var sid = sids[ s ];
                var next = animation.getNextKeyWith( sid, h, 0 );

                if ( next ) next.apply( sid );

              }

              obj.matrixAutoUpdate = false;
              animation.data.hierarchy[ h ].node.updateMatrix();
              obj.matrixWorldNeedsUpdate = true;
            }

          }
          animation.loop = false;
          animation.play();
          lastTimestamp = Date.now();
        }
      }

      window.addEventListener("load", makePretty, false);


      function makePretty() {

        projectName.className = projectName.className + "stereo";
        title.className = title.className + "fadeOut";
        logo.className = logo.className + "fadeOut";
        fullscreen.className = "fadeIn";

        logo.addEventListener( "animationend", proceed, false );

        function proceed() {
          title.className = title.className + " hidden";
          logo.className = logo.className + " hidden";
          //init();
          //start();
          //animate(lastTimestamp);
        }

      }
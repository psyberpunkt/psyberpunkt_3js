// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

// import { PositionalAudioHelper } from './jsm/helpers/PositionalAudioHelper.js';

// import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
// import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';


// var dj_list = {
//   dj_1: {
//     name_dj: "",
//     name_song: "",
//     name_album: "",
//     length: ;
//   }
//   dj_2: {
//     name_dj: "",
//     name_song: "",
//     name_album: "",
//     length: ;
//   }
//   dj_3: {
//     name_dj: "",
//     name_song: "",
//     name_album: "",
//     length: ;
//   }

// }


// var aud = document.getElementById("music");
// aud.onended = function() {
//   alert("The audio has ended");
//   console.log("The audio has ended");
// };

// const video = document.querySelector('video');




            import * as THREE from 'three';

            import Stats from './threejs/stats.module.js';
            import { GUI } from './threejs/lil-gui.module.min.js';
            import { OrbitControls } from './threejs/OrbitControls.js';
            import { RoomEnvironment } from './threejs/RoomEnvironment.js';
            import { PointerLockControls } from './threejs/PointerLockControls.js';

            import { GLTFLoader } from './threejs/GLTFLoader.js';
            import { FBXLoader } from './threejs/FBXLoader.js';
            import { DRACOLoader } from './threejs/DRACOLoader.js';

            import { PositionalAudioHelper } from './threejs/PositionalAudioHelper.js';





let model;

var playerPosition = (142.16392264800328, 0, 1219.9873608174055);

var touchstartX = 0;
var touchstartY = 0;
var touchendX = 0;
var touchendY = 0;

var isTouchMove = false;
var isRunToggled = false;


var song_nr = 0;
const songs_list = [
  "../static/sound/Headroom - Edisons Medicine.mp4",
  "../static/sound/Infected Mushroom & WHITENO1SE - More Of Just The Same.webm",
  "../static/sound/HEADROOM (SA) - Live @ Origin Festival 2022 (Official Video).aac",
  "../static/sound/376737_Skullbeatz___Bad_Cat_Maste.ogg",
  "../static/sound/376737_Skullbeatz___Bad_Cat_Maste.mp3"
]

    // <!-- <source src="" type="audio/ogg"> -->
    // <!-- <source src="" type="audio/mpeg"> -->
    // <source src="" type="audio/mpeg">
    // <!-- <source src="" type="audio/mpeg"> -->
    // <!-- <source src="" type="audio/mpeg"> -->

// const audioArray = {
//   song_1: {
//     artist: 'Headroom',
//     track: 'Y2K-Hole',
//     url: 'https://www.youtube.com/watch?v=NqJ2zZPkODg'
//   }
//   song_2: {
//     artist: 'Headroom',
//     track: 'Y2K-Hole',
//     url: 'https://www.youtube.com/watch?v=NqJ2zZPkODg'
//   }
//   song_3: {
//     artist: 'Headroom',
//     track: 'Y2K-Hole',
//     url: 'https://www.youtube.com/watch?v=NqJ2zZPkODg'
//   }
//   song_4: {
//     artist: 'Headroom',
//     track: 'Y2K-Hole',
//     url: 'https://www.youtube.com/watch?v=NqJ2zZPkODg'
//   }
// }


// custom global variables
var video1, video2, videoImage, videoImageContext, videoTexture;










class BasicCharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};


class BasicCharacterController {
  constructor(params) {
    this._Init(params);
  }

  _Init(params) {
    this._params = params;
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._position = new THREE.Vector3();
    // this._position = playerPosition;


    this._animations = {};
    this._input = new BasicCharacterControllerInput();
    this._stateMachine = new CharacterFSM(
        new BasicCharacterControllerProxy(this._animations));

    this._LoadModels();
  }

  _LoadModels() {
    const loader = new FBXLoader();
    loader.setPath('../static/characters/quinn_anim/');
    loader.load('quinn_t_pose.fbx', (fbx) => {
      fbx.scale.setScalar(0.1);
      // fbx.position.set(142.16392264800328, 0, 1219.9873608174055);
      fbx.position.set(195, 0, 1107);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('idle');
      };

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
  
        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath('../static/characters/quinn_anim/');
      loader.load('quinn_walking.fbx', (a) => { _OnLoad('walk', a); });
      loader.load('quinn_fast_run.fbx', (a) => { _OnLoad('run', a); });
      loader.load('quinn_jump.fbx', (a) => { _OnLoad('jump', a); });
      loader.load('quinn_standing_idle.fbx', (a) => { _OnLoad('idle', a); });
      loader.load('quinn_shrugg.fbx', (a) => { _OnLoad('shrugg', a); });
      loader.load('Hip Hop Dancing.fbx', (a) => { _OnLoad('dance', a); });
    });

  }

  get Position() {
    return this._position;
  }

  get Rotation() {
    if (!this._target) {
      return new THREE.Quaternion();
    }
    return this._target.quaternion;
  }

  Update(timeInSeconds) {
    if (!this._stateMachine._currentState) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this._input);

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(6.0);
    }

    if (this._stateMachine._currentState.Name == 'dance') {
      acc.multiplyScalar(0.0);
    }

    if (this._input._keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }

    if (this._input._keys.g) {
      console.log("Cam position: ");
      console.log(_Q, _A, _R);
      console.log(this._position);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    this._position.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
  }
};

class BasicCharacterControllerInput {
  constructor() {
    this._Init();    
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
      ctrl: false,
      u: false,
    };
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);

    document.addEventListener( 'mousewheel', (e) => this._onMouseWheel(e), false );
    document.addEventListener( 'DOMMouseScroll', (e) => this._onMouseWheel(e), false ); // firefox


    // const el = document.getElementById('android_buttons');
    // el.addEventListener('touchstart', handleStart);
    // el.addEventListener('touchend', handleEnd);
    // el.addEventListener('touchcancel', handleCancel);
    // el.addEventListener('touchmove', handleMove);

    document.getElementById('arrow_up').addEventListener('mousedown', (e) => this._onTouchDown("forward"), false );
    document.getElementById('arrow_up').addEventListener('mouseup', (e) => this._onTouchUp("forward"), false );


    document.getElementById('arrow_left').addEventListener('mousedown', (e) => this._onTouchDown("left"), false );
    document.getElementById('arrow_left').addEventListener('mouseup', (e) => this._onTouchUp("left"), false );

    document.getElementById('arrow_right').addEventListener('mousedown', (e) => this._onTouchDown("right"), false );
    document.getElementById('arrow_right').addEventListener('mouseup', (e) => this._onTouchUp("right"), false );

    document.getElementById('arrow_down').addEventListener('mousedown', (e) => this._onTouchDown("backward"), false );
    document.getElementById('arrow_down').addEventListener('mouseup', (e) => this._onTouchUp("backward"), false );

    document.getElementById('arrow_up').addEventListener('touchstart', (e) => this._onTouchDown("forward"), false );
    document.getElementById('arrow_up').addEventListener('touchend', (e) => this._onTouchUp("forward"), false );


    document.getElementById('arrow_left').addEventListener('touchstart', (e) => this._onTouchDown("left"), false );
    document.getElementById('arrow_left').addEventListener('touchend', (e) => this._onTouchUp("left"), false );

    document.getElementById('arrow_right').addEventListener('touchstart', (e) => this._onTouchDown("right"), false );
    document.getElementById('arrow_right').addEventListener('touchend', (e) => this._onTouchUp("right"), false );

    document.getElementById('arrow_down').addEventListener('touchstart', (e) => this._onTouchDown("backward"), false );
    document.getElementById('arrow_down').addEventListener('touchend', (e) => this._onTouchUp("backward"), false );

    document.getElementById('run').addEventListener('touchstart', (e) => this._onTouchDown("run"), false );
    document.getElementById('run').addEventListener('touchend', (e) => this._onTouchUp("run"), false );

    document.getElementById('run_toggle').addEventListener('touchstart', (e) => this._onTouchDown("run_toggle"), false );
    // document.getElementById('run_toggle').addEventListener('touchend', (e) => this._onTouchUp("run_toggle"), false );

    document.getElementById('jump').addEventListener('touchstart', (e) => this._onTouchDown("jump"), false );
    document.getElementById('jump').addEventListener('touchend', (e) => this._onTouchUp("jump"), false );



    document.getElementById('dance').addEventListener('touchstart', (e) => this._onTouchDown("dance"), false );
    document.getElementById('dance').addEventListener('touchend', (e) => this._onTouchUp("dance"), false );


        // ontouchstart="handleTouchStart(event)" 
        // ontouchend="handleTouchEnd(event)"
        // ontouchmove="handleTouchMove(event)">


    // document.getElementById('tiltPanel').addEventListener('touchstart', handleTouchStart);
    document.getElementById('tiltPanel').addEventListener('touchend', (e) => this._handleTouchEnd(), false );
    document.getElementById('tiltPanel').addEventListener('touchmove', (e) => this._handleTouchMove(event), false );





    // document.getElementById('music').addEventListener('ended', (e) => {
    //   console.log('Video stopped either because 1) it was over, ' +
    //       'or 2) no further data is available.');
    //   alert("The audio has ended");
    // });


// ###############################################################################3    
// // events and args should be of type Array
// function addMultipleListeners(element,events,handler,useCapture,args){
//   if (!(events instanceof Array)){
//     throw 'addMultipleListeners: '+
//           'please supply an array of eventstrings '+
//           '(like ["click","mouseover"])';
//   }
//   //create a wrapper to be able to use additional arguments
//   var handlerFn = function(e){
//     handler.apply(this, args && args instanceof Array ? args : []);
//   }
//   for (var i=0;i<events.length;i+=1){
//     element.addEventListener(events[i],handlerFn,useCapture);
//   }
// }

// function handler(e) {
//   // do things
// };

// // usage
// addMultipleListeners(
//     document.getElementById('first'),
//     ['touchstart','click'],
//     handler,
//     false);
// ##################################################################################

    // document.getElementById('audio').addEventListener('ended', (e) => this._handleMusicEnded(event), false );


    document.getElementById('dj_box_video').addEventListener("canplay", (e) => this._handleVideoCanPlay(event), false );
    document.getElementById('dj_box_video').addEventListener('ended', (e) => this._handleVideoEnded(event), false );




  }


_handleVideoCanPlay() {
  setTimeout(function() {
    document.getElementById('dj_box_video').play();
  }, 30000);
}


_handleVideoEnded(){
  console.log("video ended");
}


_handleMusicEnded(){

  // console.log('Video stopped either because 1) it was over, ' +
          // 'or 2) no further data is available.');
  // alert("The audio has ended");

  if (song_nr >= songs_list.length){
    song_nr = 0;
  } else {
    song_nr = song_nr + 1;
  }

  document.getElementById('audioSource').src = songs_list[song_nr];
  document.getElementById('audio').load();
  document.getElementById('audio').play();

  console.log("Playing song: ", songs_list[song_nr]);

}








_handleTouchEnd(){
    // this._handleGesure();

  touchstartX = 0;
  touchstartY = 0;
  touchendX = 0;
  touchendY = 0;
  isTouchMove = false;
  this._keys.left = false;
  this._keys.right = false;

}

_handleTouchMove(event) {
  if (isTouchMove == false){
    touchstartX = event.touches[0].clientX;
    touchstartY = event.touches[0].clientY;
    isTouchMove = true;
  } else {
    touchendX = event.touches[0].clientX;
    touchendY = event.touches[0].clientY;



    if (touchendX < touchstartX) {
      this._keys.left = true;
        // alert(swiped + 'left!');
        // document.getElementById("top_r_heading").innerHTML += "\nLeft";
    }
    if (touchendX > touchstartX) {
      this._keys.right = true;
        // alert(swiped + 'right!');
        // document.getElementById("top_r_heading").innerHTML += "\nright";
    }


  }
  // document.getElementById("top_r_heading").innerHTML = touchendX + ", " + touchendY;
}



_handleGesure() {
  // alert("_handleGesure");
    var swiped = 'swiped: ';
    if (touchendX < touchstartX) {
      this._keys.left = true;
        alert(swiped + 'left!');
        // document.getElementById("top_r_heading").innerHTML += "\nLeft";
    }
    if (touchendX > touchstartX) {
      this._keys.right = true;
        alert(swiped + 'right!');
        // document.getElementById("top_r_heading").innerHTML += "\nright";
    }
    // if (touchendY < touchstartY) {
    //     alert(swiped + 'up!');
    //     document.getElementById("top_r_heading").innerHTML += "\nup";
    // }
    // if (touchendY > touchstartY) {
    //     alert(swiped + 'down!');
    //     document.getElementById("top_r_heading").innerHTML += "\ndown";
    // }
    // if (touchendY == touchstartY) {
    //     alert('tap!');
    //     document.getElementById("top_r_heading").innerHTML += "\ntap";
    // }
}

















  _onTouchDown(button){
    console.log("button down")
    switch (button){
      case "forward":
        this._keys.forward = true;
        break;
      case "left":
        this._keys.left = true;
        break;
      case "right":
        this._keys.right = true;
        break;
      case "backward":
        this._keys.backward = true;
        break;
      case "run":
        this._keys.shift = true;
        break;
      case "jump":
        this._keys.space = true;
        break;
      case "dance":
        this._keys.ctrl = true;
        break;
      case "run_toggle":
        if (isRunToggled == false){
          this._keys.shift = true;
          this._keys.forward = true;
          isRunToggled = true;
        } else {
          this._keys.shift = false;
          this._keys.forward = false;
          isRunToggled = false;
        }
        break;

    }

  }

  _onTouchUp(button){
    switch (button){
      case "forward":
        this._keys.forward = false;
        break;
      case "left":
        this._keys.left = false;
        break;
      case "right":
        this._keys.right = false;
        break;
      case "backward":
        this._keys.backward = false;
        break;
      case "run":
        this._keys.shift = false;
        break;
      case "jump":
        this._keys.space = false;
        break;
      case "dance":
        this._keys.ctrl = false;
        break;
    }
    
  }


  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
      case 32: // SPACE
        this._keys.space = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;
      case 17: // Ctrl
        this._keys.ctrl = true;
        break;
      case 85: // Ctrl
        this._keys.u = true;
        break;
      case 71: // G
        this._keys.g = true;

        // this._camera.updateMatrixWorld();
        // Then:

        // var vector = this._camera.position.clone();

        // vector.applyMatrix( this._camera.matrixWorld );

        console.log("Getting Player/Camera pos: ");
        // console.log("Cam pos: ", vector);
        break;
    }
  }

  _onKeyUp(event) {
    switch(event.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
      case 32: // SPACE
        this._keys.space = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
      case 17: // Ctrl
        this._keys.ctrl = false;
        break;
      case 71: // Ctrl
        this._keys.g = false;
        break;
      case 85: // Ctrl
        this._keys.u = false;
        break;
    }
  }

  _onPointerMove( event ) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    // pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    console.log("Pointer moved: ", event)

  }
  // document.addEventListener( 'pointermove', onPointerMove );


  _onMouseWheel( event ) {

    console.log("Mouse Wheel moved: ", event)

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    // pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // console.log("Camera: ", )

  }











};



class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _AddState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;
    
    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
};


class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState('idle', IdleState);
    this._AddState('walk', WalkState);
    this._AddState('run', RunState);
    this._AddState('jump', JumpState);
    this._AddState('dance', DanceState);
    this._AddState('shrugg', ShruggState);
  }
};


class State {
  constructor(parent) {
    this._parent = parent;
  }

  Enter() {}
  Exit() {}
  Update() {}
};


class ShruggState extends State {
  constructor(parent) {
    super(parent);

    this._FinishedCallback = () => {
      this._Finished();
    }
  }

  get Name() {
    return 'shrugg';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['shrugg'].action;
    const mixer = curAction.getMixer();
    mixer.addEventListener('finished', this._FinishedCallback);

    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.reset();  
      curAction.setLoop(THREE.LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState('idle');
  }

  _Cleanup() {
    const action = this._parent._proxy._animations['shrugg'].action;
    
    action.getMixer().removeEventListener('finished', this._CleanupCallback);
  }

  Exit() {
    this._Cleanup();
  }

  Update(_) {
  }
};




class DanceState extends State {
  constructor(parent) {
    super(parent);

    this._FinishedCallback = () => {
      this._Finished();
    }
  }

  get Name() {
    return 'dance';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['dance'].action;
    const mixer = curAction.getMixer();
    mixer.addEventListener('finished', this._FinishedCallback);

    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.reset();  
      curAction.setLoop(THREE.LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState('idle');
  }

  _Cleanup() {
    const action = this._parent._proxy._animations['dance'].action;
    
    action.getMixer().removeEventListener('finished', this._CleanupCallback);
  }

  Exit() {
    this._Cleanup();
  }

  Update(_) {
  }
};


class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'walk';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['walk'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'run') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (input._keys.shift) {
        this._parent.SetState('run');
      } else if (input._keys.space) {
        this._parent.SetState('jump');
      }
      return;
    }

    this._parent.SetState('idle');
  }
};


class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'run';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['run'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'walk') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (!input._keys.shift) {
        this._parent.SetState('walk');
      } else if (input._keys.space) {
        this._parent.SetState('jump');
      }
      return;
    }

    this._parent.SetState('idle');
  }
};









class JumpState extends State {
  constructor(parent) {
    super(parent);

    this._FinishedCallback = () => {
      this._Finished();
    }
  }

  get Name() {
    return 'jump';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['jump'].action;
    const mixer = curAction.getMixer();
    mixer.addEventListener('finished', this._FinishedCallback);

    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.reset();  
      curAction.setLoop(THREE.LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState('idle');
  }

  _Cleanup() {
    const action = this._parent._proxy._animations['dance'].action;
    
    action.getMixer().removeEventListener('finished', this._CleanupCallback);
  }

  Exit() {
    this._Cleanup();
  }

  Update(_) {
  }
};
















class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'idle';
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations['idle'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {
  }

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      this._parent.SetState('walk');
    } else if (input._keys.ctrl) {
      this._parent.SetState('dance');
    } else if (input._keys.space) {
      this._parent.SetState('jump');
    } else if (input._keys.u) {
      this._parent.SetState('shrugg');
    }
  }
};


class ThirdPersonCamera {
  constructor(params) {
    this._params = params;
    this._camera = params.camera;

    this._currentPosition = new THREE.Vector3();
    this._currentLookat = new THREE.Vector3();
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-15, 20, -30);
    idealOffset.applyQuaternion(this._params.target.Rotation);
    idealOffset.add(this._params.target.Position);
    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 10, 50);
    idealLookat.applyQuaternion(this._params.target.Rotation);
    idealLookat.add(this._params.target.Position);
    return idealLookat;
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);

    this._camera.position.copy(this._currentPosition);
    this._camera.lookAt(this._currentLookat);
  }
}


class ThirdPersonCameraDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 50;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // this._camera.position.set(25, 10, 25);
    this._camera.position.set(133, 19, 9);

    this._scene = new THREE.Scene();

    this._scene.fog = new THREE.FogExp2(0x4b0082, 0.002);

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(-100, 100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 50;
    light.shadow.camera.right = -50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    this._scene.add(light);

    light = new THREE.AmbientLight(0xFFFFFF, 0.25);
    this._scene.add(light);

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        '../static/resources/cubemap_1.png',
        '../static/resources/cubemap_3.png',
        '../static/resources/cubemap_4.png',
        '../static/resources/cubemap_5.png',
        '../static/resources/cubemap_0.png',
        '../static/resources/cubemap_2.png',
    ]);
    texture.encoding = THREE.sRGBEncoding;
    this._scene.background = texture;

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x808080,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);


    const gltfLoader = new GLTFLoader().setPath( '../static/buildings/cybercity_2099_v2/' );
    gltfLoader.load( 'scene.gltf', ( gltf ) =>{

      gltf.scene.position.set(100, 0, 0);
      gltf.scene.scale.set(0.03, 0.03, 0.03); 
          
      model = gltf.scene;
      // this._target = gltf;
      this._scene.add(model);

    } );























//

      const listener1 = new THREE.AudioListener();
      this._camera.add( listener1 );

      const audioElement1 = document.getElementById( 'dj_box_video' );
      audioElement1.play();

      const positionalAudio1 = new THREE.PositionalAudio( listener1 );
      positionalAudio1.setMediaElementSource( audioElement1 );
      positionalAudio1.setBuffer(AudioBuffer);
      positionalAudio1.setVolume(1); //volume
      positionalAudio1.setRefDistance( 17 );
      positionalAudio1.setDirectionalCone( 180, 230, 0.1 );

      const positionalAudioHelper1 = new PositionalAudioHelper( positionalAudio1, 1 );
      positionalAudio1.add( positionalAudioHelper1 );

      //

      // const listener2 = new THREE.AudioListener();
      // this._camera.add( listener2 );

      // const audioElement2 = document.getElementById( 'myVideo2' );
      // audioElement2.play();

      // const positionalAudio2 = new THREE.PositionalAudio( listener2 );
      // positionalAudio2.setMediaElementSource( audioElement2 );
      // positionalAudio2.setBuffer(AudioBuffer);
      // positionalAudio2.setVolume(0.9); //volume
      // positionalAudio2.setRefDistance( 50 );
      // positionalAudio2.setDirectionalCone( 180, 230, 0.1 );

      // const positionalAudioHelper2 = new PositionalAudioHelper( positionalAudio2, 0.5 );
      // positionalAudio2.add( positionalAudioHelper2 );


// const audio = new Audio("start url");

//   audio.addEventListener('ended',function(){
//         audio.src = "new url";
//         audio.pause();
//         audio.load();
//         audio.play();
//     });





      // sound is damped behind this wall

      // const wallGeometry = new THREE.BoxGeometry( 2, 1, 0.1 );
      // const wallMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 } );

      // const wall = new THREE.Mesh( wallGeometry, wallMaterial );
      // wall.position.set( 0, 0.5, - 0.5 );
      // wall.scale.set( 20, 20, 20 );
      // this._scene.add( wall );


      //



    // const dj_table_loader = new FBXLoader();
    // dj_table_loader.setPath('../static/img/objects/gothic-table/source/');
    // dj_table_loader.load('table.fbx', (fbx) => {
    //   fbx.scale.setScalar(0.1);
    //   fbx.position.set(-44.973280875405514, 0, 691.7035402999097);
    //   fbx.traverse(c => {
    //     c.castShadow = true;
    //   });


    //   this._scene.add(fbx);

    // });

    // const dj_model_loader = new FBXLoader();
    // dj_model_loader.setPath('../static/characters/full-body-cyberpunk-male/source/');
    // dj_model_loader.load('cheering_hands_up_plus_skin.fbx', (fbx) => {
    //   fbx.scale.setScalar(0.0015);
    //   // fbx.position.set(-24.420257468652487, 0, 670.5739310901374);
    //   fbx.position.set(236, 0, 1150);
    //   fbx.rotation.y = Math.PI * 1.5;
    //   fbx.traverse(c => {
    //     c.castShadow = true;
    //   });

    //   // fbx.add( positionalAudio2 );

    //   this._scene.add(fbx);



    //   var mixer = new THREE.AnimationMixer(fbx);

    //   var manager = new THREE.LoadingManager();
    //   manager.onLoad = () => {
    //     this._stateMachine.SetState('idle');
    //   };

    //   const _OnLoad = (animName, anim) => {
    //     const clip = anim.animations[0];
    //     const action = this._mixer.clipAction(clip);
  
    //     this._animations[animName] = {
    //       clip: clip,
    //       action: action,
    //     };
    //   };

    //   const loader = new FBXLoader(this._manager);
    //   loader.setPath('../static/characters/quinn_anim/');
    //   loader.load('quinn_walking.fbx', (a) => { _OnLoad('walk', a); });
    //   loader.load('quinn_fast_run.fbx', (a) => { _OnLoad('run', a); });
    //   loader.load('quinn_jump.fbx', (a) => { _OnLoad('jump', a); });
    //   loader.load('quinn_standing_idle.fbx', (a) => { _OnLoad('idle', a); });
    //   loader.load('quinn_shrugg.fbx', (a) => { _OnLoad('shrugg', a); });
    //   loader.load('Hip Hop Dancing.fbx', (a) => { _OnLoad('dance', a); });
    // });





  // model
        const dj_model_loader = new FBXLoader();
        // dj_model_loader.load( '../static/characters/full-body-cyberpunk-male/source/cheering_hands_up_plus_skin.fbx', function ( object ) {
        dj_model_loader.setPath('../static/characters/full-body-cyberpunk-male/');
        dj_model_loader.load('cyber_punk_male.fbx', (fbx) => {          
          fbx.scale.setScalar(0.1);
          fbx.position.set(236, 0, 1150);
          fbx.rotation.y = Math.PI * 1.5;
          fbx.traverse(c => {
            c.castShadow = true;
          });


          this._scene.add( fbx );

          // mixer = new THREE.AnimationMixer( fbx );

          // const action = mixer.clipAction( fbx.animations[ 0 ] );
          // action.play();

          // fbx.traverse( function ( child ) {

          //   if ( child.isMesh ) {

          //     child.castShadow = true;
          //     child.receiveShadow = true;

          //   }

          // } );


        } );







    // const dj_model_loader = new GLTFLoader().setPath( '../static/characters/full-body-cyberpunk-male/source/' );
    // dj_model_loader.load( 'readyplayerme_cyberpunk.glb', ( gltf ) =>{

    //   gltf.scene.position.set(236, 0, 1150);
    //   gltf.scene.scale.set(12, 12, 12);
    //   // gltf.scene.rotation.x += 0.01;
    //   gltf.scene.rotation.y = Math.PI * 1.5;
          
    //   // model = gltf.scene;
    //   // this._target = gltf;
    //   this._scene.add(gltf.scene);

    // } );








    const dj_table_loader = new GLTFLoader().setPath( '../static/img/objects/dj_roomv01/' );
    dj_table_loader.load( 'scene.gltf', ( gltf ) =>{

      gltf.scene.position.set(180, -10, 1116.58);
      gltf.scene.scale.set(10, 10, 10);
      // gltf.scene.rotation.x += 0.01;
      gltf.scene.rotation.y = Math.PI / 2;
          
      // model = gltf.scene;
      // this._target = gltf;
      this._scene.add(gltf.scene);

    } );






    // const dj_deck_loader = new FBXLoader();
    // dj_deck_loader.setPath('../static/img/objects/');
    // dj_deck_loader.load('dj_deck.fbx', (fbx) => {
    //   fbx.scale.setScalar(0.015);
    //   // fbx.position.set(-44.973280875405514, 9, 691.7035402999097);
    //   fbx.position.set(217.38844995312397, 0, 1149.0588735170177);
    //   fbx.traverse(c => {
    //     c.castShadow = true;
    //   });
    //   this._scene.add(fbx);
    // });




// -66.09942372634336, y: 0, z: 717.1305430208627

// Left front speaker
// -63.081855942096254, y: 0, z: 706.160629721603
// big speaker

    const dj_speaker_l_loader = new FBXLoader();
    dj_speaker_l_loader.setPath('../static/img/objects/Speaker/');
    dj_speaker_l_loader.load('big speaker.fbx', (fbx) => {
      fbx.scale.setScalar(0.03);
      // fbx.position.set(-29.261463566177216, 0, 720.1611083014209);
      fbx.position.set(233, 0, 1122);
      fbx.rotation.y = 180* Math.PI / 180;
      fbx.traverse(c => {
        c.castShadow = true;
      });

      fbx.add( positionalAudio1 );

      this._scene.add(fbx);

    });




// Right front speaker
// -24.420257468652487, y: 0, z: 670.5739310901374



    const dj_speaker_r_loader = new FBXLoader();
    dj_speaker_r_loader.setPath('../static/img/objects/Speaker/');
    dj_speaker_r_loader.load('big speaker.fbx', (fbx) => {
      fbx.scale.setScalar(0.03);
      // fbx.position.set(-24.420257468652487, 0, 670.5739310901374);
      fbx.position.set(233, 0, 1178);
      fbx.rotation.y = 180* Math.PI / 180;
      fbx.traverse(c => {
        c.castShadow = true;
      });

      // fbx.add( positionalAudio2 );

      this._scene.add(fbx);

    });









///////////
  // VIDEO //
  ///////////
  
  // // // create the video element

  // create DIV in HTML:
  // <video id="myVideo" autoplay style="display:none">
  //    <source src="videos/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
  // </video>
  // and set JS variable:

  video1 = document.getElementById( 'dj_box_video' );
  // video2 = document.getElementById( 'myVideo2' );
  // alternative method -- 
  // video = document.createElement( 'video' );
  // video.id = 'video';
  video1.type = ' video/mp4; codecs="theora, vorbis" ';
  video1.src = "https://www.youtube.com/watch?v=NqJ2zZPkODg";
  // video2.src = "../static/sound/Headroom_Y2K_Hole.mp4";
  video1.load(); // must call after setting/changing source
  // video2.load(); // must call after setting/changing source
  video1.play();
  


  // video2.play();



  videoImage = document.createElement( 'canvas' );
  videoImage.width = 480;
  videoImage.height = 204;

  videoImageContext = videoImage.getContext( '2d' );
  // background color if no video present
  videoImageContext.fillStyle = '#000000';
  videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

  videoTexture = new THREE.VideoTexture( video1 );
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.needsUpdate = true;
  
  var videoMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, side:THREE.DoubleSide } );
  videoMaterial.needsUpdate = true;


  // the geometry on which the movie will be displayed;
  //    movie image will be scaled to fit these dimensions.
  var videoScreenGeometry = new THREE.PlaneGeometry( 100, 75, 4, 4 );
  var videoScreen = new THREE.Mesh( videoScreenGeometry, videoMaterial );
  videoScreen.position.set(255, 38, 1145);
  videoScreen.rotation.y = Math.PI * 1.5;         // 90 left
  // videoScreen.rotation.y = Math.PI / 2;
  // videoScreen.rotation.y = Math.PI * 0.5;      //
  // videoScreen.rotation.y = Math.PI;            //180
  // videoScreen.rotation.y = 180* Math.PI / 180;
  this._scene.add(videoScreen);
  




// //Get your video element:
// const video = document.getElementById("myVideo");
// video.onloadeddata = function () {
//     video.play();
// };

// //Create your video texture:
// const videoTexture = new THREE.VideoTexture(video);
// videoTexture.needsUpdate = true;
// const videoMaterial = new THREE.MeshBasicMaterial({
//     map: videoTexture,
//     side: THREE.FrontSide,
//     toneMapped: false,
// });
// videoMaterial.needsUpdate = true;

// //Create screen
// const videoScreenGeometry = new THREE.PlaneGeometry( 240, 100, 4, 4 );
// const videoScreen = new THREE.Mesh(videoScreenGeometry, videoMaterial);
//   videoScreen.position.set(255, 0, 1145);
//   videoScreen.rotation.y = Math.PI / 2;
// this._scene.add(videoScreen);


















    this._mixers = [];
    this._previousRAF = null;

    this._LoadAnimatedModel();
    this._RAF();
  }

  _LoadAnimatedModel() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    }
    this._controls = new BasicCharacterController(params);

    this._thirdPersonCamera = new ThirdPersonCamera({
      camera: this._camera,
      target: this._controls,
    });
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      // console.log("####### Camera #######");
      // console.log(this._camera.position);
      // console.log("");
      // console.log("####### Player #######");
      // console.log("");
      // console.log("");
      // console.log("######################");
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }

    this._thirdPersonCamera.Update(timeElapsedS);
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  // _APP = new ThirdPersonCameraDemo();
});

const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', init );




    function init() {
      console.log("init started....")
      const overlay = document.getElementById( 'overlay' );
      overlay.remove();

      _APP = new ThirdPersonCameraDemo();
    }




function _LerpOverFrames(frames, t) {
  const s = new THREE.Vector3(0, 0, 0);
  const e = new THREE.Vector3(100, 0, 0);
  const c = s.clone();

  for (let i = 0; i < frames; i++) {
    c.lerp(e, t);
  }
  return c;
}

function _TestLerp(t1, t2) {
  const v1 = _LerpOverFrames(100, t1);
  const v2 = _LerpOverFrames(50, t2);
  console.log(v1.x + ' | ' + v2.x);
}

_TestLerp(0.01, 0.01);
_TestLerp(1.0 / 100.0, 1.0 / 50.0);
_TestLerp(1.0 - Math.pow(0.3, 1.0 / 100.0), 
          1.0 - Math.pow(0.3, 1.0 / 50.0));

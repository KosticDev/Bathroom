import { observer } from "mobx-react-lite";
import { v4 as uuid_v4 } from "uuid";
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./components/Firebase/firebaseConfig";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

import * as THREE from "three";
import "./Action";

import $, { data } from "jquery";

import { MapControls, OrbitControls } from "./three/OrbitControls";
import { DRACOLoader } from "./three/DRACOLoader";
import { GLTFLoader } from "./three/GLTFLoader";
import { CSS2DRenderer } from "./three/CSS2DRenderer";
import { DragControls } from "./three/DragControls";

import { Wall } from "./components/Wall";
import { BottomWall } from "./components/Bottom";
import { AXIS, DELTA_DIS, DIR, STORE, wallItems } from "./Constant";
import { AxesHelper, Vector3 } from "three";
import { render } from "@testing-library/react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Dimensions } from "./components/dimension";
import { SubHeader } from "./components/SubHeader";
import storage from "./components/Firebase/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import CreateDate from "./components/Firebase/Create";
import { readData } from "./components/Firebase/Read";
import { update } from "firebase/database";
import {
  savePositionData,
  clearPositionData,
  getPositionData,
} from "./utils/cacheData";

const Room_types = [1, 2, 3, 4, 5, 6];
const relative_ratio = 1000;

let walls_group = [];
let door = null;
let shower = null;
let bathtub = null;
let bathtub1 = null;
let bathtub2 = null;
let tapware = null;
let temp_bathtub = null;
let temp_bathtub1 = null;
let temp_bathtub2 = null;
let temp_tapware = null;
let temp_shower = null;
let model;
let temp_model;

let obtainedObjectColor = null;

let dims = [];

let isMouseDown = false;

let isDrag = false;

let updateTimeout;

const gltfLoader = new GLTFLoader();

let selectedItem = null;
let hoverItem;

let rayWalls = [];

let selectedObject;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("js/");
gltfLoader.setDRACOLoader(dracoLoader);

let objects = [];

const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster();
const mouseRemember = new THREE.Vector2();

const canvas = document.createElement("canvas");

let scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  50
);
function initCamera() {
  camera.position.y = 10;
  camera.position.z = 8;
  scene.add(camera);
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

const labelRenderer = new CSS2DRenderer();

renderer.outputEncoding = THREE.sRGBEncoding;

const orbitControls = new OrbitControls(camera, renderer.domElement);

function initOrbit() {
  orbitControls.minDistance = 3;
  orbitControls.maxDistance = 20;
  orbitControls.maxPolarAngle = 1.5;
  orbitControls.minAzimuthAngle = 0.1;
}

const frustum = 1000;
const orthoCam = new THREE.OrthographicCamera(
  -window.innerWidth / 2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  -window.innerHeight / 2,
  0,
  30
);

var mapControls;
var global_light;
var light_1;
var light_2;
var light_3;
var light_4;
var light_5;
var light_6;
var light_7;
var light_8;

function init() {
  // const orthoCam = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 30);
  console.log("I am here!");
  orthoCam.zoom = STORE.Scale * 100;
  mapControls = new MapControls(orthoCam, labelRenderer.domElement);

  mapControls.zoomSpeed = 0.1;
  mapControls.enableRotate = false;
  mapControls.screenSpacePanning = false;
  mapControls.minZoom = 100;
  mapControls.maxZoom = frustum;

  orthoCam.updateProjectionMatrix();
  camera.zoom = STORE.Scale;
  camera.updateProjectionMatrix();
}

window.addEventListener("wheel", function (event) {
  let maxWidth = 50;
  let xx = document.getElementsByClassName("roomsSideBar");
  for (let i = 0; i < xx.length; i++) {
    let rect = xx[i].getBoundingClientRect();
    if (rect.right > maxWidth) maxWidth = rect.right;
  }
  xx = document.getElementsByClassName("sidebar");
  for (let i = 0; i < xx.length; i++) {
    let rect = xx[i].getBoundingClientRect();
    if (rect.right > maxWidth) maxWidth = rect.right;
  }
  if (maxWidth > event.x) return;

  if (event.deltaY < 0) {
    STORE.scale += 0.1;
  } else if (event.deltaY > 0) {
    STORE.scale -= 0.1;
    //STORE.Scale -= 0.1;
  }
  init();
  GenerateMeasurements();
});

function initLight() {
  const Ambientlight = new THREE.AmbientLight("white", 0.1); // soft white light
  /*
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  scene.add( directionalLight );
  directionalLight.position.set(0,2,0);

  const light = new THREE.HemisphereLight( 0xffffff, "", 0.5 );
  scene.add( light );
  light.position.set(0,2,0);
  */
  global_light = new THREE.HemisphereLight("white", "", 0.5);
  global_light.position.set(0, STORE.Height, 0);

  light_1 = new THREE.PointLight("white", 0.1, 0, 1);
  light_2 = new THREE.PointLight("white", 0.2, 0, 1);
  light_3 = new THREE.PointLight("white", 0.2, 0, 1);
  light_4 = new THREE.PointLight("white", 0.2, 0, 1);
  light_5 = new THREE.PointLight("white", 0.2, 0, 1);
  light_6 = new THREE.PointLight("white", 0.2, 0, 1);
  light_7 = new THREE.PointLight("white", 0.2, 0, 1);
  light_8 = new THREE.PointLight("white", 0.2, 0, 1);

  light_1.position.set(0, STORE.Height / 2, 0);
  light_2.position.set(STORE.Width / 2, STORE.Height / 2, 0);
  light_3.position.set(STORE.Width, 1, 0);
  light_4.position.set(-STORE.Width, 1, 0);
  light_5.position.set(0, 1, STORE.Height);
  light_6.position.set(0, 1, -STORE.Height);
  light_7.position.set(0, 0, STORE.Height);
  light_8.position.set(0, 0, -STORE.Height);

  scene.add(
    global_light,
    light_1,
    light_2,
    light_3,
    light_4,
    light_5,
    light_6,
    light_7,
    light_8
  );
}

// const box = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ side: THREE.BackSide, transparent: true, color :'white' }));

let InvisibleMat;

// box.geometry.translate(0, .5, 0);
// // scene.add(box);

function adjustCorner(pos, corner, length) {
  if (pos + length > corner) {
    return [corner - length, pos - corner + length];
  }
  if (pos - length < -corner) {
    return [-corner + length, -corner + length - pos];
  }
  return [pos, 0];
}
function DragObject(vec3, object, selectedwall) {
  isDrag = true;

  let margin = 0;
  const xx = STORE.width / 2000;
  const zz = STORE.length / 2000;
  const yy = STORE.height / 1000;
  let ow = object.geometry.parameters.width / 2;
  let oz = object.geometry.parameters.depth / 2;
  let oy = object.geometry.parameters.height;
  if (object.userData.type === "door") oz = 0;

  switch (selectedwall.userData.normalAxis) {
    case AXIS.X:
      object.userData.normalAxis = AXIS.X;

      if (selectedwall.userData.dir == DIR.START) {
        object.rotation.y = Math.PI / 2;
        object.userData.dir = DIR.START;
      } else {
        object.rotation.y = -Math.PI / 2;
        object.userData.dir = DIR.END;
      }
      [object.position.x, margin] = adjustCorner(vec3.x, xx, oz);
      [object.position.z, margin] = adjustCorner(vec3.z, zz, ow);
      if (vec3.y + oy > yy) object.position.y = yy - oy;
      else object.position.y = vec3.y;
      break;
    case AXIS.Z:
      object.userData.normalAxis = AXIS.Z;
      if (selectedwall.userData.dir == DIR.START) {
        object.rotation.y = 0;
        object.userData.dir = DIR.START;
      } else {
        object.rotation.y = -Math.PI;
        object.userData.dir = DIR.END;
      }
      [object.position.x, margin] = adjustCorner(vec3.x, xx, ow);
      [object.position.z, margin] = adjustCorner(vec3.z, zz, oz);
      if (vec3.y + oy > yy) object.position.y = yy - oy;
      else object.position.y = vec3.y;
      break;
    case AXIS.Y:
      [object.position.x, margin] = adjustCorner(vec3.x, xx, ow);
      [object.position.z, margin] = adjustCorner(vec3.z, zz, oz);

      break;
    default:
      break;
  }
}

function isFacingCamera(object) {
  let v = new Vector3();
  // this is one way. adapt to your use case.
  if (
    v
      .subVectors(camera.position, object.position)
      .dot(object.userData.normalVector) < 0
  ) {
    object.geometry.setDrawRange(0, 0);
  } else {
    object.geometry.setDrawRange(0, Infinity);
    rayWalls.push(object);
  }
}

function animate() {
  rayWalls = [];
  for (let index = 0; index < walls_group.length; index++) {
    if (walls_group[index].material.visible) isFacingCamera(walls_group[index]);
  }
  // isFacingCamera(ceiling);

  if (STORE.view === 1) {
    renderer.render(scene, camera);
    orbitControls.update();
    // let isDoor = false;
    // for (let index = 0; index < rayWalls.length; index++) {
    //     if (temp_door.userData.normalAxis === rayWalls[index].userData.normalAxis && temp_door.userData.dir === rayWalls[index].userData.dir) {
    //         isDoor = true;
    //     }
    // }
    // temp_door.chlldren[0].children[0].material.visible = isDoor;
  } else {
    renderer.render(scene, orthoCam);
    labelRenderer.render(scene, orthoCam);
    mapControls.update();
  }
  requestAnimationFrame(animate);
}

function resize() {
  const container = document.getElementById("canvas-container");
  const goldcolor = new THREE.Color(0xbcbcbc);
  scene.background = goldcolor;
  container.innerHTML = "";
  container.append(canvas);
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(container.clientWidth, container.clientWidth);
}

window.addEventListener("resize", resize, false);

var selectedFlag = false;
var temp_object = null;
var temp_object_real = null;

const onmousedown = (e) => {
  isMouseDown = true;

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  if (e.touches) {
    mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
  }

  raycaster.setFromCamera(mouse, camera);

  var objectIntersects = raycaster.intersectObjects(objects);

  if (objectIntersects.length > 0 && isMouseDown) {
    selectedItem = objectIntersects[0].object;
    console.log("Mouse Down", selectedItem);
    savePositionData(0, selectedItem);
    orbitControls.enabled = false;
  }
};

function getObjectColor(object) {
  if (object.material !== undefined && object.material.color !== undefined) {
    if (object.userData.type !== "door" && obtainedObjectColor === null) {
      obtainedObjectColor = object.material.color;
    }
  }
  console.log(object);
  if (object.children !== []) {
    console.log(object.children.length);
    for (let i = 0; i < object.children.length; i++) {
      getObjectColor(object.children[i]);
    }
  }
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const onmouseup = (e) => {
  isMouseDown = false;
  isDrag = false;
  orbitControls.enabled = true;
  if (selectedItem !== null) {
    console.log("Mouse Up", selectedItem);
    savePositionData(1, selectedItem);
  }
  selectedItem = null;

  var objectIntersects = raycaster.intersectObjects(objects);

  if (
    objectIntersects.length > 0 &&
    objectIntersects[0].object.visible == true
  ) {
    hoverItem = objectIntersects[0].object;
    hoverItem.material.visible = true;

    if (selectedFlag) {
      temp_object.material.visible = false;
    } else {
      selectedFlag = true;
    }
    temp_object = hoverItem;
    temp_object_real = objectIntersects[1].object;

    $(".functionBoard").css({ display: "block" });
    if (temp_object.userData.type === "door") {
      console.log(temp_object);
      getObjectColor(temp_object);
      let redColor = parseInt(255 * obtainedObjectColor.r);
      let greenColor = parseInt(255 * obtainedObjectColor.g);
      let blueColor = parseInt(255 * obtainedObjectColor.b);
      $(".colorBoard").css({ display: "block" });
      document.getElementsByClassName("colorBoard")[0].value = rgbToHex(
        redColor,
        greenColor,
        blueColor
      );
      obtainedObjectColor = null;
    }
  } else if (hoverItem && !isDrag) {
    hoverItem.material.visible = false;
    selectedFlag = false;
    $(".functionBoard").css({ display: "none" });
    $(".colorBoard").css({ display: "none" });
  }

  Update();
};

const onmousemove = (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  let temp_camera;
  if (STORE.view == 1) temp_camera = camera;
  else temp_camera = orthoCam;
  raycaster.setFromCamera(mouse, temp_camera);
  var intersects = raycaster.intersectObjects(walls_group, false);

  if (intersects.length > 0) {
    selectedObject = intersects[0].object;
    if (isMouseDown && selectedItem) {
      DragObject(intersects[0].point, selectedItem, selectedObject);
    }
  } else {
    selectedObject = null;
  }
  mapControls.enabled = false;
};

$("body").keydown(function (event) {
  var letter = String.fromCharCode(event.which);
  if (event.keyCode == 46) {
    deleteObject();
  }
});

function deleteObject() {
  if (temp_object_real != null) {

    for(let i=0;i<objects.length;i++)
    {
      if (objects[i].uuid === temp_object.uuid)
      {
        objects.splice(i, 1);
        break;
      }
    }

    temp_object.parent.remove(temp_object);
  }
}

function changeColor(e) {
  e.preventDefault();
  let hexColor = document.getElementsByClassName("colorBoard")[0].value;
  hexColor = hexColor.slice(1);
  var aRgbHex = hexColor.match(/.{1,2}/g);
  let objColor = {
    r: parseInt(aRgbHex[0], 16) / 255,
    g: parseInt(aRgbHex[1], 16) / 255,
    b: parseInt(aRgbHex[2], 16) / 255,
    isColor: true,
  };
  objectTraverse(temp_object, objColor);
}

window.addEventListener("mousemove", onmousemove);
window.addEventListener("mousedown", onmousedown);
window.addEventListener("mouseup", onmouseup);

function Update() {
  if (updateTimeout) clearTimeout(updateTimeout);

  updateTimeout = setTimeout(() => {
    GenerateBathroom();
    GenerateMeasurements();
  }, 5);
}

function createWalls(type, material) {
  console.log("material: ", material);
  for (let index = 0; index < walls_group.length; index++) {
    scene.remove(walls_group[index]);
  }
  walls_group = [];
  switch (type) {
    case 1:
      walls_group.push(
        new Wall(
          STORE.Length,
          STORE.Height,
          new Vector3(-STORE.Width / 2, 0, 0),
          AXIS.X,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Length,
          STORE.Height,
          new Vector3(STORE.Width / 2, 0, 0),
          AXIS.X,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width,
          STORE.Height,
          new Vector3(0, 0, -STORE.Length / 2),
          AXIS.Z,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width,
          STORE.Height,
          new Vector3(0, 0, STORE.Length / 2),
          AXIS.Z,
          DIR.END,
          null,
          material
        )
      );
      break;
    case 2:
      walls_group.push(
        new Wall(
          STORE.Length,
          STORE.Height,
          new Vector3(-STORE.Width / 2, 0, 0),
          AXIS.X,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Length - STORE.CutOutLength,
          STORE.Height,
          new Vector3(STORE.Width / 2, 0, -STORE.CutOutLength / 2),
          AXIS.X,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width,
          STORE.Height,
          new Vector3(0, 0, -STORE.Length / 2),
          AXIS.Z,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width - STORE.CutOutWidth,
          STORE.Height,
          new Vector3(-STORE.CutOutWidth / 2, 0, STORE.Length / 2),
          AXIS.Z,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.CutOutWidth,
          STORE.Height,
          new Vector3(
            STORE.Width / 2 - STORE.CutOutWidth / 2,
            0,
            STORE.Length / 2 - STORE.CutOutLength
          ),
          AXIS.Z,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.CutOutLength,
          STORE.Height,
          new Vector3(
            STORE.Width / 2 - STORE.CutOutWidth,
            0,
            STORE.Length / 2 - STORE.CutOutLength / 2
          ),
          AXIS.X,
          DIR.END,
          null,
          material
        )
      );
      break;
    case 3:
      walls_group.push(
        new Wall(
          STORE.Length - STORE.CutOutLength,
          STORE.Height,
          new Vector3(-STORE.Width / 2, 0, -STORE.CutOutLength / 2),
          AXIS.X,
          DIR.START,
          true,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Length,
          STORE.Height,
          new Vector3(STORE.Width / 2, 0, 0),
          AXIS.X,
          DIR.END,
          false,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width,
          STORE.Height,
          new Vector3(0, 0, -STORE.Length / 2),
          AXIS.Z,
          DIR.START,
          false,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width - STORE.CutOutWidth,
          STORE.Height,
          new Vector3(STORE.CutOutWidth / 2, 0, STORE.Length / 2),
          AXIS.Z,
          DIR.END,
          true,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.CutOutWidth,
          STORE.Height,
          new Vector3(
            -STORE.Width / 2 + STORE.CutOutWidth / 2,
            0,
            STORE.Length / 2 - STORE.CutOutLength
          ),
          AXIS.Z,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.CutOutLength,
          STORE.Height,
          new Vector3(
            -STORE.Width / 2 + STORE.CutOutWidth,
            0,
            STORE.Length / 2 - STORE.CutOutLength / 2
          ),
          AXIS.X,
          DIR.START,
          null,
          material
        )
      );
      break;
    case 4:
      walls_group.push(
        new Wall(
          STORE.Length,
          STORE.Height,
          new Vector3(-STORE.Width / 2, 0, 0),
          AXIS.X,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Length - STORE.CutOutLength,
          STORE.Height,
          new Vector3(STORE.Width / 2, 0, STORE.CutOutLength / 2),
          AXIS.X,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width - STORE.CutOutWidth,
          STORE.Height,
          new Vector3(-STORE.CutOutWidth / 2, 0, -STORE.Length / 2),
          AXIS.Z,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width,
          STORE.Height,
          new Vector3(0, 0, STORE.Length / 2),
          AXIS.Z,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.CutOutWidth,
          STORE.Height,
          new Vector3(
            STORE.Width / 2 - STORE.CutOutWidth / 2,
            0,
            -STORE.Length / 2 + STORE.CutOutLength
          ),
          AXIS.Z,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.CutOutLength,
          STORE.Height,
          new Vector3(
            STORE.Width / 2 - STORE.CutOutWidth,
            0,
            -STORE.Length / 2 + STORE.CutOutLength / 2
          ),
          AXIS.X,
          DIR.END,
          null,
          material
        )
      );
      break;
    case 5:
      walls_group.push(
        new Wall(
          STORE.Length - STORE.CutOutLength,
          STORE.Height,
          new Vector3(-STORE.Width / 2, 0, STORE.CutOutLength / 2),
          AXIS.X,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Length,
          STORE.Height,
          new Vector3(STORE.Width / 2, 0, 0),
          AXIS.X,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width - STORE.CutOutWidth,
          STORE.Height,
          new Vector3(STORE.CutOutWidth / 2, 0, -STORE.Length / 2),
          AXIS.Z,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.Width,
          STORE.Height,
          new Vector3(0, 0, STORE.Length / 2),
          AXIS.Z,
          DIR.END,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.CutOutWidth,
          STORE.Height,
          new Vector3(
            -STORE.Width / 2 + STORE.CutOutWidth / 2,
            0,
            -STORE.Length / 2 + STORE.CutOutLength
          ),
          AXIS.Z,
          DIR.START,
          null,
          material
        )
      );
      walls_group.push(
        new Wall(
          STORE.CutOutLength,
          STORE.Height,
          new Vector3(
            -STORE.Width / 2 + STORE.CutOutWidth,
            0,
            -STORE.Length / 2 + STORE.CutOutLength / 2
          ),
          AXIS.X,
          DIR.START,
          null,
          material
        )
      );
      break;
    default:
      break;
  }
  walls_group.push(
    new BottomWall(
      new Vector3(0, 0, 0),
      AXIS.Y,
      DIR.START,
      STORE.type,
      STORE.view,
      null,
      material
    )
  );
  walls_group.push(
    new BottomWall(
      new Vector3(0, STORE.Height, 0),
      AXIS.Y,
      DIR.END,
      STORE.type,
      STORE.view,
      null,
      material
    )
  );
  for (let index = 0; index < walls_group.length; index++) {
    scene.add(walls_group[index]);
    // if(STORE.view ===1 ){
    //     walls_group[index].onBeforeRender = onBeforeRender;
    //     walls_group[index].onAfterRender = onAfterRender;
    // }
  }
}

function GenerateBathroom() {
  orthoCam.position.y = STORE.Height + DELTA_DIS;
  createWalls(STORE.type, STORE.material);
}

function GenerateMeasurements() {
  document.getElementById("measures").append(labelRenderer.domElement);

  for (let index = 0; index < dims.length; index++) {
    scene.remove(dims[index]);
  }
  dims = [];
  if (STORE.view !== 1)
    new Dimensions(
      scene,
      dims,
      orthoCam,
      labelRenderer.domElement,
      STORE.type,
      temp_object
    );
}

function objectTraverse(object, objColor) {
  if (object.material !== undefined && object.material.color !== undefined)
    object.material.color = objColor;

  if (object.children !== []) {
    for (let i = 0; i < object.children.length; i++) {
      objectTraverse(object.children[i], objColor);
    }
  }
}

function loadDoor(url, num, num1, objColor) {
  gltfLoader.load(
    // resource URL
    url,
    // called when the resource is loaded
    function (gltf) {
      InvisibleMat = new THREE.MeshBasicMaterial({
        color: "red",
        visible: false,
        transparent: true,
        opacity: 0.3,
      });
      let temp_door = new THREE.Mesh(
        new THREE.BoxGeometry(
          wallItems.door.width,
          wallItems.door.height,
          wallItems.door.depth / num1
        ),
        InvisibleMat
      );
      temp_door.geometry.translate(0, wallItems.door.height * 0.5, 0);
      temp_door.position.set(0, 0, -STORE.Length / 2 - 0.02);
      temp_door.userData.normalAxis = AXIS.Z;
      temp_door.userData.normalVector = new Vector3(0, 0, 1);
      temp_door.userData.dir = DIR.START;
      temp_door.userData.type = "door";
      temp_door.userData.url = url;
      door = gltf.scene;
      door.scale.x = num;
      door.scale.y = num;
      door.scale.z = num / 2;

      //let objColor = { r: 1, g: 0, b: 0, isColor: true };
      if (objColor !== undefined && objColor !== null)
        objectTraverse(door, objColor);

      temp_door.add(door);
      scene.add(temp_door);
      objects.push(temp_door);
    }
  );
}

function Window(url, num, num1) {
  gltfLoader.load(
    // resource URL
    url,
    // called when the resource is loaded
    function (gltf) {
      InvisibleMat = new THREE.MeshBasicMaterial({
        color: "red",
        visible: false,
        transparent: true,
        opacity: 0.3,
      });
      let temp_door = new THREE.Mesh(
        new THREE.BoxGeometry(
          wallItems.door.width,
          wallItems.door.height / 2,
          wallItems.door.depth / num1
        ),
        InvisibleMat
      );
      temp_door.geometry.translate(0, wallItems.door.height * 0.22, 0);
      temp_door.position.set(0, 1, -STORE.Length / 2 - 0.02);
      temp_door.userData.normalAxis = AXIS.Z;
      temp_door.userData.normalVector = new Vector3(0, 0, 1);
      temp_door.userData.dir = DIR.START;
      temp_door.userData.url = url;
      temp_door.userData.type = 'window';
      door = gltf.scene;
      door.scale.x = num;
      door.scale.y = num;
      door.scale.z = num / 2;
      temp_door.add(door);
      scene.add(temp_door);
      objects.push(temp_door);
    }
  );
}

function loadModel(URL) {
  gltfLoader.load(
    // resource URL
    URL,
    function (gltf) {
      model = gltf.scene;

      let bbox = new THREE.Box3().setFromObject(model);
      let size = bbox.getSize(new THREE.Vector3());

      model.position.y = size.y * 0.5;

      InvisibleMat = new THREE.MeshBasicMaterial({
        color: "red",
        visible: false,
        transparent: true,
        opacity: 0.3,
      });
      temp_model = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        InvisibleMat
      );
      temp_model.userData.normalAxis = AXIS.Y;
      temp_model.userData.url = URL;
      temp_model.geometry.translate(0, size.y * 0.5, 0);
      temp_model.userData.type = 'other';

      temp_model.add(model);
      console.log(temp_model);
      scene.add(temp_model);
      objects.push(temp_model);
      console.log('created',scene);
      animate();
    }
  );
}

const loadSavedModel = (object) => {
  gltfLoader.load(
    // resource URL
    object.url,
    function (gltf) {
      model = gltf.scene;
      
      model.position.x = object.inner.position.x;
      model.position.y = object.inner.position.y;
      model.position.z = object.inner.position.z;
      model.scale.x = object.inner.scale.x;
      model.scale.y = object.inner.scale.y;
      model.scale.z = object.inner.scale.z;
      
      InvisibleMat = new THREE.MeshBasicMaterial({
        color: "red",
        visible: false,
        transparent: true,
        opacity: 0.3,
      });
      temp_model = new THREE.Mesh(
        new THREE.BoxGeometry(
          object.outer.width,
          object.outer.height,
          object.outer.depth
        ),
        InvisibleMat
      );
      
      temp_model.userData = object.outer.userData;
      
      temp_model.position.x = object.outer.position.x;
      temp_model.position.y = object.outer.position.y;
      temp_model.position.z = object.outer.position.z;
      temp_model.scale.x = object.outer.scale.x;
      temp_model.scale.y = object.outer.scale.y;
      temp_model.scale.z = object.outer.scale.z;
      
      if (object.outer.userData.type === 'window')
      {
        temp_model.geometry.translate(0, wallItems.door.height * 0.22, 0);
      }
      else
      {
        temp_model.geometry.translate(0, object.outer.height/2, 0);
      }

      if (object.outer.color !== undefined && object.outer.color !== null)
      {
        let color1= {
          r: object.outer.color.r,
          g: object.outer.color.g,
          b: object.outer.color.b,
          isColor: true
        }
        objectTraverse(model, color1);
      }

      temp_model.add(model);
      scene.add(temp_model);
      objects.push(temp_model);
      animate();
    }
  );
};

const getObjectData = async () => {
  const q = query(collection(db, "object_data"));
  let userId = localStorage.getItem("userId");
  let objectData = [];

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    let data = doc.data();
    data = data.objectData.data;
    data = JSON.parse(data);
    data.id = doc.id;
    if (data.userId === userId) {
      objectData.push(data);
    }
  });
  STORE.fetchedObjectData = objectData;
};

const deleteSavedObject = async (e, id) => {
  e.preventDefault();
  const docRef = doc(db, "object_data", id);
  deleteDoc(docRef)
    .then(() => {
      console.log("Entire Document has been deleted successfully.");
    })
    .catch((error) => {
      console.log(error);
    });
  getObjectData();
  
};

const saveObjectData = async (title) => {
  let objectData = {};
  let userId = localStorage.getItem("userId");
  objectData.userId = userId;
  objectData.title = title;
  objectData.type = STORE.type;
  objectData.material = STORE.material;
  let rawData = [];
  for (let i = 0; i < scene.children.length; i++) {
    if (
      scene.children[i].userData.url !== undefined &&
      scene.children[i].userData.url !== null
    ) {
      let outer = {};
      let inner = {};
      let url = scene.children[i].userData.url;
      outer.userData = scene.children[i].userData;
      outer.position = scene.children[i].position;
      outer.scale = scene.children[i].scale;
      outer.width = scene.children[i].geometry.parameters.width;
      outer.height = scene.children[i].geometry.parameters.height;
      outer.depth = scene.children[i].geometry.parameters.depth;

      inner.position = scene.children[i].children[0].position;
      inner.scale = scene.children[i].children[0].scale;

      if (scene.children[i].userData.type === "door") {
        getObjectColor(scene.children[i]);
        outer.color = {};
        outer.color.r = obtainedObjectColor.r;
        outer.color.g = obtainedObjectColor.g;
        outer.color.b = obtainedObjectColor.b;

      }
      rawData.push({ outer: outer, inner: inner, url: url });
    }
  }
  objectData.data = rawData;
  objectData = JSON.stringify(objectData);
  objectData = { data: objectData };
  const docRef = await addDoc(collection(db, "object_data"), {
    objectData,
  });
  console.log("Document written with ID: ", docRef.id);

  toastr.options = {
    positionClass: "toast-top-right",
    hideDuration: 300,
    timeOut: 2000,
  };
  toastr.clear();
  setTimeout(() => toastr.success(`Sucessfully done`), 300);

  getObjectData();
};

const showSavedObjectData = (e, id) => {
  e.preventDefault();
  clearPositionData();
  let objectData = {};
  for (let i = 0; i < STORE.fetchedObjectData.length; i++) {
    if (STORE.fetchedObjectData[i].id === id) {
      objectData = STORE.fetchedObjectData[i];
    }
  }
  objects = [];
  scene = new THREE.Scene();
  STORE.type = objectData.type;
  STORE.material = objectData.material;
  scene.background = new THREE.Color(0x808080);

  initCamera();
  initOrbit();
  init();
  initLight();
  GenerateBathroom();

  for (let i = 0; i < objectData.data.length; i++) {
    loadSavedModel(objectData.data[i]);
  }

  animate();
};
const initThree = () => {
  objects = [];
  scene = new THREE.Scene();
  initCamera();
  initOrbit();
  init();
  initLight();
  GenerateBathroom();
  loadDoor("assets/doors/panel.glb", 1, 1);
  loadModel("assets/bathtub.glb");
  animate();
};
initThree();

const UI = observer(() => {
  useEffect(() => {
    //initThree();
    clearPositionData();
    resize();
  }, []);

  useEffect(() => {
    let current_position = localStorage.getItem("current_position");
    if (current_position === null) current_position = -1;
    else current_position = parseInt(current_position);
    setPosition(current_position);
    setCurrentPosition(current_position);
  }, [STORE.Change]);

  const [menuOption, setMenuOption] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [isCategory, setIsCategory] = useState(true);
  const { isAdd, setAdd } = useState(false);
  const [file, setFile] = useState("");
  const [file1, setFile1] = useState("");
  const [percent, setPercent] = useState(0);
  const [percent1, setPercent1] = useState(0);
  const [show, setShow] = useState(false);
  const [imageURL, setImageURL] = useState();
  const [modelURL, setModelURL] = useState();
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState(-1);
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [saveDialogShow, setSaveDialogShow] = useState(false);
  const [objectTitle, setObjectTitle] = useState("");

  const [header, setHeader] = useState("");
  const [category, setCategory] = useState("");

  const [uploadCount, setUploadCount] = useState(0);
  const [refresh, setRefresh] = useState(1);

  function AssignVal(e) {
    STORE[e.target.id] = e.target.value;
    if (door !== null) {
      if (door.children[0].userData.normalAxis === AXIS.X) {
        if (door.children[0].userData.dir === DIR.START)
          door.position.x = -STORE.Width / 2;
        else door.position.x = STORE.Width / 2;
      } else if (door.children[0].userData.normalAxis === AXIS.Z) {
        if (door.children[0].userData.dir === DIR.START)
          door.position.z = -STORE.Length / 2;
        else door.position.z = STORE.Length / 2;
      }
    }
  }

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function handleChange1(event) {
    setFile1(event.target.files[0]);
  }

  function handleUpload() {
    if (!file) {
      alert("Please choose a file first!");
    }

    const storageRef = ref(storage, `/Tapware & Accessories/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        //update progress
        setPercent(percent);
      },
      (err) => console.log(err),
      () => {
        //download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImageURL(url);
        });
      }
    );
  }

  function handleUpload1() {
    if (!file1) {
      alert("Please choose a file first!");
    }

    const storageRef = ref(storage, `/Tapware & Accessories(3D)/${file1.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file1);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        //update progress
        setPercent1(percent);
      },
      (err) => console.log(err),
      () => {
        //download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setModelURL(url);
        });
      }
    );
  }

  function onChangeTitle(e) {
    setTitle(e.target.value);
  }

  const saveData = async () => {
    let errorMessage = "";
    if (title === "") {
      errorMessage = "Please insert title!";
    }

    if (percent1 !== 100) {
      errorMessage = "Please upload 3D model file!";
    }

    if (percent !== 100) {
      errorMessage = "Please upload image file!";
    }

    if (errorMessage !== "") {
      toastr.options = {
        positionClass: "toast-top-right",
        hideDuration: 300,
        timeOut: 2000,
      };
      toastr.clear();
      setTimeout(() => toastr.error(errorMessage), 300);
    }

    const data = {
      imageUrl: imageURL,
      modelUrl: modelURL,
      title: title,
      category: header,
      subCategory: category,
    };
    try {
      const docRef = await addDoc(collection(db, "model_data"), {
        data,
      });
      console.log("Document written with ID: ", docRef.id);

      toastr.options = {
        positionClass: "toast-top-right",
        hideDuration: 300,
        timeOut: 2000,
      };
      toastr.clear();
      setTimeout(() => toastr.success(`Sucessfully done`), 300);

      setTitle("");
      setImageURL("");
      setModelURL("");
      setPercent(0);
      setPercent1(0);
      setFile("");
      setFile1("");
      setUploadCount(uploadCount + 1);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  function change(title) {
    setIsCategory(true);
    setHeader(title);
  }

  function handleRemember(e, flag) {
    e.preventDefault();
    let positionData;
    let positionVector;
    if (flag === 0) {
      if (currentPosition === -1) return;
      positionData = getPositionData(currentPosition);
      positionVector = positionData.from;
      localStorage.setItem("current_position", currentPosition - 1);
      setCurrentPosition(currentPosition - 1);
    }
    if (flag === 1) {
      if (currentPosition === position) return;
      positionData = getPositionData(currentPosition + 1);
      positionVector = positionData.to;
      localStorage.setItem("current_position", currentPosition + 1);
      setCurrentPosition(currentPosition + 1);
    }
    let selectedObject = scene.getObjectByProperty("uuid", positionData.uuid);
    selectedObject.position.x = positionVector.x;
    selectedObject.position.y = positionVector.y;
    selectedObject.position.z = positionVector.z;
  }
  return (
    <div className="container vh-100 overflow-auto">
      <Navbar init={initThree} />
      <Sidebar
        menuOption={menuOption}
        setMenuOption={setMenuOption}
        setIsCategory={setIsCategory}
        refresh={refresh}
        setRefresh={setRefresh}
        getObjectData={getObjectData}
      />
      <div className="row content">
        <div
          className="roomsSideBar"
          style={{ marginLeft: menuOption[0] && !isCategory ? 0 : -470 }}
        >
          <div className="d-flex r_title border-bottom">
            <h6
              className="trig-btn  py-3 w-100"
              style={{ color: "#555", marginTop: "0" }}
            >
              {" "}
              Room Layout
            </h6>
            <span className="close">X</span>
          </div>
          <div className="d-flex flex-wrap w-100">
            <h6
              className="trig-btn  w-100"
              style={{ color: "#555", paddingLeft: "20px", height: "30px" }}
            >
              {" "}
              Floor Plan
            </h6>
            <div className="d-flex flex-wrap w-100">
              {Room_types.map((type) => {
                return (
                  <div
                    onClick={(e) => {
                      STORE.cwidth = Math.min(STORE.width - 1000, STORE.cwidth);
                      STORE.clength = Math.min(
                        STORE.length - 1000,
                        STORE.clength
                      );
                      STORE.type = type;
                    }}
                    key={type}
                    className="px-4 py-3 bg-white rounded-1 m-2 hover shadow"
                  >
                    <img src={"assets/ui/" + type + ".svg"} alt="" />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="d-flex flex-wrap w-100">
            <h6
              className="trig-btn py-3 w-100"
              style={{ color: "#555", paddingLeft: "20px" }}
            >
              {" "}
              Room Dimensions
            </h6>
            <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
              <span style={{ width: "100%" }}>Room Width</span>
              <input
                onChange={AssignVal}
                type="range"
                id="width"
                value={STORE.width}
                min={2100}
                max={10000}
                className="form-range me-1"
              />
              <input
                onChange={AssignVal}
                type="text"
                id="width"
                value={STORE.width}
                className="sizeInput"
              ></input>
              <span>mm</span>
            </div>
            <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
              <span style={{ width: "100%" }}>Room Length</span>
              <input
                onChange={AssignVal}
                type="range"
                id="length"
                value={STORE.length}
                min={2100}
                max={10000}
                className="form-range"
              />
              <input
                onChange={AssignVal}
                type="text"
                id="length"
                value={STORE.length}
                className="sizeInput"
              ></input>
              <span>mm</span>
            </div>
            <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
              <span style={{ width: "100%" }}>Room Height </span>
              <input
                onChange={AssignVal}
                type="range"
                id="height"
                value={STORE.height}
                min={2000}
                max={10000}
                className="form-range"
              />
              <input
                onChange={AssignVal}
                type="text"
                id="height"
                value={STORE.height}
                className="sizeInput"
              ></input>
              <span>mm</span>
            </div>

            {STORE.type > 1 && (
              <div>
                <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
                  <span style={{ width: "100%" }}>Cutout width </span>
                  <input
                    onChange={AssignVal}
                    type="range"
                    id="cwidth"
                    value={STORE.cwidth}
                    min={1000}
                    max={STORE.width - 1000}
                    className="form-range"
                  />
                  <input
                    onChange={AssignVal}
                    type="text"
                    id="cwidth"
                    value={STORE.cwidth}
                    className="sizeInput"
                  ></input>
                  <span>mm</span>
                </div>
                <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
                  <span style={{ width: "100%" }}>Cutout length </span>
                  <input
                    onChange={AssignVal}
                    type="range"
                    id="clength"
                    value={STORE.clength}
                    min={1000}
                    max={STORE.length - 1000}
                    className="form-range"
                  />
                  <input
                    onChange={AssignVal}
                    type="text"
                    id="clength"
                    value={STORE.clength}
                    className="sizeInput"
                  ></input>
                  <span>mm</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="roomsSideBar"
          style={{ marginLeft: menuOption[1] && !isCategory ? 0 : -470 }}
        >
          <div className="d-flex r_title border-bottom">
            <h6
              className="trig-btn  py-3 w-100"
              style={{ color: "#555", marginTop: "0" }}
            >
              Bathroom Elements
            </h6>
            <span className="close">X</span>
          </div>
          <div className="d-flex flex-wrap w-100">
            <h6
              className="trig-btn  w-100"
              style={{ color: "#555", paddingLeft: "20px", height: "30px" }}
            >
              {" "}
              Add Room Elements
            </h6>
            <div className="height_vh">
              <div className="d-flex flex-wrap w-100 justify">
                <div
                  className="card m-2 d-flex align-items-center text-center p-2 rounded"
                  style={{ width: "45%" }}
                >
                  <span className="m-2">Door</span>
                  <img
                    style={{ width: "80px", height: "80px" }}
                    src="assets/ui/door.svg"
                  ></img>
                  <div
                    className="btn m-2 rounded-5 shadow-sm"
                    onClick={() => loadDoor("assets/doors/panel.glb", 1, 1)}
                  >
                    Add to Plan +
                  </div>
                </div>
                <div
                  className="card m-2 d-flex align-items-center text-center p-2 rounded"
                  style={{ width: "45%" }}
                >
                  <span className="m-2">Sliding window</span>
                  <img
                    style={{ width: "80px", height: "80px" }}
                    src="assets/ui/Sliding window.png"
                  ></img>
                  <div
                    className="btn m-2 rounded-5 shadow-sm"
                    onClick={() =>
                      Window("assets/doors/sliding.glb", 0.03, 0.9)
                    }
                  >
                    Add to Plan +
                  </div>
                </div>
                <div
                  className="card m-2 d-flex align-items-center text-center p-2 rounded"
                  style={{ width: "45%" }}
                >
                  <span className="m-2">Traditional door</span>
                  <img
                    style={{ width: "80px", height: "80px" }}
                    src="assets/ui/Traditional door.png"
                  ></img>
                  <div
                    className="btn m-2 rounded-5 shadow-sm"
                    onClick={() =>
                      loadDoor("assets/doors/Traditional door.gltf", 1, 0.5)
                    }
                  >
                    Add to Plan +
                  </div>
                </div>
                <div
                  className="card m-2 d-flex align-items-center text-center p-2 rounded"
                  style={{ width: "45%" }}
                >
                  <span className="m-2">Traditional door</span>
                  <img
                    style={{ width: "80px", height: "80px" }}
                    src="assets/ui/Traditional door.png"
                  ></img>
                  <div
                    className="btn m-2 rounded-5 shadow-sm"
                    onClick={() =>
                      loadDoor("assets/doors/Traditional door.gltf", 1, 0.5)
                    }
                  >
                    Add to Plan +
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="roomsSideBar"
          style={{ marginLeft: menuOption[2] ? 0 : -470 }}
        >
          <div className="d-flex r_title border-bottom">
            <h6
              className="trig-btn  py-3 w-100"
              style={{ color: "#555", marginTop: "0" }}
            >
              Bathroom Products
            </h6>
            <span
              className="close"
              onClick={(e) => {
                e.preventDefault();
                setIsCategory(1 - isCategory);
              }}
            >
              X
            </span>
          </div>
          {isCategory ? (
            <SubHeader
              loadModel={loadModel}
              setShow={setShow}
              setIsCategory={setIsCategory}
              header={header}
              category={category}
              setCategory={setCategory}
              keyRefresh={uploadCount}
            />
          ) : (
            <>
              <input
                placeholder="Search all products"
                type="search"
                className="d-flex w-100 rounded-4 shadow-sm search"
                style={{ height: 40, border: "none" }}
              />
              <div className="main_window">
                <div className="d-flex flex-wrap w-140">
                  <div className="d-flex flex-wrap w-140 cards">
                    <div
                      className="card  d-flex align-items-center text-center p-2 rounded card1"
                      onClick={() => change("Baths & Spas")}
                    >
                      <img src="assets/ui/e09acac1-fc05-4078-bd84-73b765c26c31.png"></img>
                      <span className="m-2">Baths & Spas</span>
                    </div>
                    <div
                      className="card d-flex align-items-center text-center p-2 rounded card1"
                      onClick={() => change("Vanities")}
                    >
                      <img src="assets/ui/Vanities.png"></img>
                      <span className="m-2">Vanities</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-wrap w-140">
                  <div className="d-flex flex-wrap w-140 cards">
                    <div
                      className="card  d-flex align-items-center text-center p-2 rounded card1"
                      onClick={() => change("Shavers & Mirrors")}
                    >
                      <img src="assets/ui/Shavers and Mirrors.png"></img>
                      <span className="m-2">Shavers & Mirrors</span>
                    </div>
                    <div
                      className="card d-flex align-items-center text-center p-2 rounded card1"
                      onClick={() => change("Basins")}
                    >
                      <img src="assets/ui/Basins.png"></img>
                      <span className="m-2">Basins</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-wrap w-140">
                  <div className="d-flex flex-wrap w-140 cards">
                    <div
                      className="card  d-flex align-items-center text-center p-2 rounded card1"
                      onClick={() => change("Showers")}
                    >
                      <img src="assets/ui/Showers.png"></img>
                      <span className="m-2">Showers</span>
                    </div>
                    <div
                      className="card d-flex align-items-center text-center p-2 rounded card1"
                      onClick={() => change("Tapware & Accessories")}
                    >
                      <img src="assets/ui/Tapware & Accessories.png"></img>
                      <span className="m-2">Tapware & Accessories</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-wrap w-140">
                  <div className="d-flex flex-wrap w-140 cards">
                    <div
                      className="card  d-flex align-items-center text-center p-2 rounded card1"
                      onClick={() => change("Toilets")}
                    >
                      <img src="assets/ui/Toilets.png"></img>
                      <span className="m-2">Toilets</span>
                    </div>
                    <div
                      className="card d-flex align-items-center text-center p-2 rounded card1"
                      onClick={() => change("Wastes & Plumbing")}
                    >
                      <img src="assets/ui/Wastes & Plumbing.png"></img>
                      <span className="m-2">Wastes & Plumbing</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className="roomsSideBar"
          style={{ marginLeft: menuOption[3] && !isCategory ? 0 : -470 }}
        >
          <div className="d-flex r_title border-bottom">
            <h6
              className="trig-btn  py-3 w-100"
              style={{ color: "#555", marginTop: "0" }}
            >
              Styling
            </h6>
            <span
              className="close"
              onClick={(e) => {
                e.preventDefault();
                setIsCategory(1 - isCategory);
              }}
            >
              X
            </span>
          </div>
          <div className="d-flex flex-wrap w-100">
            <h6
              className="trig-btn  w-100"
              style={{ color: "#555", paddingLeft: "20px", height: "30px" }}
            >
              {" "}
              Select New Tile
            </h6>
            <div className="height_vh">
              <div className="d-flex flex-wrap w-100 justify">
                <div
                  className="card m-2 p-4 d-flex align-items-center text-left p-2 rounded"
                  style={{ width: "45%" }}
                >
                  <img
                    style={{ width: "100px", height: "100px" }}
                    src="assets/tiles/tiled1.jpg"
                  ></img>
                  <span className="m-2" style={{ fontSize: "12px" }}>
                    Revival Penny Blu Title
                  </span>
                  <span className="m-2" style={{ fontSize: "12px" }}>
                    200x200mm
                  </span>
                  <div className="hover1">
                    <p
                      onClick={(e) => {
                        e.preventDefault();
                        STORE.material = 0;
                      }}
                    >
                      +
                    </p>
                  </div>
                </div>
                <div
                  className="card m-2 p-4 d-flex align-items-center text-left p-2 rounded"
                  style={{ width: "45%" }}
                >
                  <img
                    style={{ width: "100px", height: "100px" }}
                    src="assets/tiles/tiled2.png"
                  ></img>
                  <span className="m-2" style={{ fontSize: "12px" }}>
                    Revival Penny Blu Title
                  </span>
                  <span className="m-2" style={{ fontSize: "12px" }}>
                    200x200mm
                  </span>
                  <div className="hover1">
                    <p
                      onClick={(e) => {
                        e.preventDefault();
                        STORE.material = 1;
                      }}
                    >
                      +
                    </p>
                  </div>
                </div>
                <div
                  className="card m-2 p-4 d-flex align-items-center text-left p-2 rounded"
                  style={{ width: "45%" }}
                >
                  <img
                    style={{ width: "100px", height: "100px" }}
                    src="assets/tiles/tiled3.png"
                  ></img>
                  <span className="m-2" style={{ fontSize: "12px" }}>
                    Revival Penny Blu Title
                  </span>
                  <span className="m-2" style={{ fontSize: "12px" }}>
                    200x200mm
                  </span>
                  <div className="hover1">
                    <p
                      onClick={(e) => {
                        e.preventDefault();
                        STORE.material = 2;
                      }}
                    >
                      +
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="roomsSideBar"
          style={{ marginLeft: menuOption[4] && !isCategory ? 0 : -470 }}
        >
          <div className="d-flex r_title border-bottom">
            <h6
              className="trig-btn  py-3 w-100"
              style={{ color: "#555", marginTop: "0" }}
            >
              Product Summary
            </h6>
            <span
              className="close"
              onClick={(e) => {
                e.preventDefault();
                setIsCategory(1 - isCategory);
              }}
            >
              X
            </span>
          </div>
        </div>

        <div
          className="roomsSideBar"
          style={{ marginLeft: menuOption[5] && !isCategory ? 0 : -470 }}
        >
          <div className="d-flex r_title border-bottom">
            <h6
              className="trig-btn  py-3 w-100"
              style={{ color: "#555", marginTop: "0" }}
            >
              Consultation
            </h6>
            <span className="close">X</span>
          </div>
        </div>

        <div
          className="roomsSideBar"
          style={{ marginLeft: menuOption[6] && !isCategory ? 0 : -470 }}
        >
          <div className="d-flex r_title border-bottom">
            <h6
              className="trig-btn  py-3 w-100"
              style={{ color: "#555", marginTop: "0" }}
            >
              Exit Plan
            </h6>
            <span className="close">X</span>
          </div>
          <div className="flex flex-col w-100 justify-center">
            {STORE.fetchedObjectData.map((data) => {
              return (
                <div
                  key={uuid_v4()}
                  className="mx-[20px] rounded-[5px] p-[10px] mb-[10px] border-gray-200 border-[1px] flex flex-row justify-between items-center"
                >
                  <p
                    onClick={(e) => {
                      showSavedObjectData(e, data.id);
                    }}
                    className="cursor-pointer"
                  >
                    {data.title}
                  </p>
                  <div
                    className="functionBoard"
                    onClick={(e) => {
                      deleteSavedObject(e, data.id);
                    }}
                  >
                    <i className="fa fa-trash"></i>
                  </div>
                </div>
              );
            })}

            <div className="m-auto">
              <button
                className="py-[10px] px-[40px] border-[1px] border-gray-600 rounded-[5px]"
                onClick={(e) => {
                  e.preventDefault();
                  setSaveDialogShow(true);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div className="col-12 position-relative p-0 m-0">
          <div
            id="measures"
            style={{ display: STORE.view !== 1 ? "" : "none" }}
            className="top-0 start-0 position-absolute w-100 h-100"
          ></div>
          <div className="canvas">
            <div
              id="canvas-container"
              className="border col-12"
              style={{ backgroundColor: "#ddd" }}
            ></div>
            <div
              className="functionBoard"
              onClick={() => {
                deleteObject();
              }}
            >
              <i className="fa fa-trash"></i>
            </div>
            <input
              className="colorBoard"
              type="color"
              id="objectColor"
              name="objectColor"
              style={{
                width: "40px",
                height: "40px",
                padding: "10px",
                borderRadius: "40px",
                position: "absolute",
                top: "10%",
                left: "45%",
                cursor: "pointer",
                display: "none",
              }}
              onChange={(e) => {
                changeColor(e);
              }}
            ></input>
          </div>
          <div
            className="rightSideBar"
            style={{ left: window.innerWidth - 150 }}
          >
            <div>
              <img
                onClick={(e) => (STORE.view = 0)}
                className={
                  (STORE.view === 0 ? "active " : "") +
                  "btn p-2 bg-light m-3 rounded-1 padding"
                }
                src="assets/ui/2d.png"
                alt=""
              />
              <img
                onClick={(e) => (STORE.view = 1)}
                className={
                  (STORE.view === 1 ? "active " : "") +
                  "btn p-2 bg-light  m-3 rounded-1 padding"
                }
                src="assets/ui/3d.png"
                alt=""
              />
              <img
                className="btn p-2 bg-light  m-3 rounded-1 padding"
                src="assets/ui/VR.png"
                alt=""
              />
              <img
                onClick={(e) => {
                  STORE.scale += 0.1;
                  console.log(STORE.scale);
                  init();
                }}
                className="d-block shadow-focus btn p-2 bg-light  m-3 rounded-1 radius"
                src="assets/ui/zoomin.svg"
                alt=""
              />
              <img
                onClick={(e) => {
                  STORE.scale -= 0.1;
                  console.log(STORE.scale);
                  init();
                }}
                className="d-block shadow-focus btn p-2 bg-light  m-3 rounded-1 radius"
                src="assets/ui/zoomout.svg"
                alt=""
              />
              <img
                className="d-block shadow-focus btn p-2 bg-light  m-3 rounded-1 radius1"
                src="assets/ui/back.png"
                style={{
                  width: "37px",
                  opacity: `${currentPosition > -1 ? "1" : "0.5"}`,
                }}
                alt=""
                onClick={(e) => handleRemember(e, 0)}
              />
              <img
                className="d-block shadow-focus btn p-2 bg-light  m-3 rounded-1 radius1"
                src="assets/ui/forward.png"
                style={{
                  width: "37px",
                  opacity: `${position > currentPosition ? "1" : "0.5"}`,
                }}
                alt=""
                onClick={(e) => handleRemember(e, 1)}
              />
            </div>
          </div>
          {saveDialogShow && (
            <div className="modal h-[50%] block">
              <div className="create_window ">
                <div className="grid gird-col-1 w-[100%] gap-3">
                  <span
                    className="close1"
                    onClick={() => setSaveDialogShow(false)}
                  >
                    &times;
                  </span>
                  <label>
                    <small>Title </small>
                  </label>
                  <input
                    type="text"
                    name="title"
                    onChange={(e) => {
                      e.preventDefault();
                      setObjectTitle(e.target.value);
                    }}
                  />
                  <button
                    className="py-[10px] px-[40px] border-[1px] border-gray-600 rounded-[5px]"
                    onClick={(e) => {
                      e.preventDefault();
                      saveObjectData(objectTitle);
                      setSaveDialogShow(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          <div
            className="modal"
            style={{
              display: show ? "block" : "none",
              height: "90%",
              overflowY: "scroll",
            }}
          >
            <div className="create_window">
              <div className="main_window1">
                <span className="close1" onClick={() => setShow(false)}>
                  &times;
                </span>
                <label>
                  <small>Image file </small>
                </label>
                <input type="file" onChange={handleChange} accept="" />
                <br />
                <button onClick={handleUpload}>Upload to Firebase</button>
                <p>{percent} % done</p>
                <label>
                  <small>3D model file </small>
                </label>
                <input type="file" onChange={handleChange1} accept="" />
                <br />
                <button onClick={handleUpload1}>Upload to Firebase</button>
                <p>{percent1} % done</p>
                <div className="image_info">
                  <label>
                    Title:&nbsp;
                    <input
                      type="text"
                      value={title}
                      onChange={onChangeTitle}
                      required
                    />
                  </label>
                  <img className="uploadimage" src={imageURL} alt="" />
                  <button className="submit_button" onClick={saveData}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UI;

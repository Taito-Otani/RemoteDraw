var database;

var posx = 0;
var posy = 0;
var d = [];

var c = [];
var rootList;

function setup() {
  createCanvas(400, 400);
  var firebaseConfig = {
    apiKey: "AIzaSyDK1OpaC0vkaBmxLoOhH0Ir0ugPTYqaE58",
    authDomain: "yohashubstest.firebaseapp.com",
    databaseURL: "https://yohashubstest-default-rtdb.firebaseio.com",
    projectId: "yohashubstest",
    storageBucket: "yohashubstest.appspot.com",
    messagingSenderId: "21958553433",
    appId: "1:21958553433:web:b5fde35c34b0a158b7a648",
    measurementId: "G-MNMSPM0NDZ"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  database = firebase.database();
  c = [color(255, 0, 0), color(0, 255, 0), color(0, 0, 255)];
  frameRate(24);
  // noLoop();
  noStroke();
  getData();
  setInterval("getData()",10000); // 10秒に一回データを取得
}

function draw() {
  background(20, 50);
  // 必要に応じて描画する。
  if (rootList != null) {
    for (var i = 0; i < 3; i++) {
      if (d[i] < rootList[i].length) {
        posx = rootList[i][d[i]].posx;
        posy = rootList[i][d[i]].posy;
        fill(c[i]);
        ellipse(posx, posy, 10, 10);
        // push();
        // translate(posx-width*0.5,posy-height*0.5);
        // sphere(10);
        // pop();
      } else {
        d[i] = 0;
      }
      d[i]++;
    }
  }
}

function getData(){
  let pos = database.ref("pos/").once("value", (data) => {
    if (data) {
      rootList = data.val();
      console.log("pull data"+Date.now());
    }

  });
}

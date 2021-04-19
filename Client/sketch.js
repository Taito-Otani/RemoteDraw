var database;
var uid;

var pos = [];
var isDragg = false;

function setup() {
  createCanvas(400, 400);
  background(220);

  // You have to write firebase config
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "xxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "xxxxxxxxxxxxxxxxxxxxxx",
    databaseURL: "xxxxxxxxxxxxxxxxxxxxxx",
    projectId: "xxxxxxxxxxxxxxxxxxxxxx",
    storageBucket: "xxxxxxxxxxxxxxxxxxxxxx",
    messagingSenderId: "xxxxxxxxxxxxxxxxxxxxxx",
    appId: "xxxxxxxxxxxxxxxxxxxxxx",
    measurementId: "xxxxxxxxxxxxxxxxxxxxxx"
  };


  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  database = firebase.database();
  uid = int(random(3)).toString();
}

function draw() {
  if(!isDragg){
    background(220);
  }
  ellipse(mouseX, mouseY, 10, 10);
  text("user::"+uid, 10, 10);
}


function mouseDragged() {
  pos.push({
    posx: mouseX,
    posy: mouseY
  });
  isDragg = true;
}

function mouseReleased() {
  database.ref('pos/' + uid).set(pos, (error) => {
    if (error) {
      // The write failed...
    } else {
      pos = [];
      background(220);
      isDragg = false;
      // Data saved successfully!
    }
  });

}

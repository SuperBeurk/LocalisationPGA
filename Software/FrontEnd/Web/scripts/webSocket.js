let wSocket = null;


//---------Rooms coordinates--------------------
const floorN3 = new Map();
floorN3.set(319, "800:840");
floorN3.set(320, "630:840");

//var c2 = document.getElementById("tag2");
var state = "DISCONNECTED";

//Connects to the server whenever the page is loaded
function connect() {
	let conMes = document.getElementById("connectionMessage");

	wSocket = new WebSocket("ws://localhost:8888");             //Port à changer (ou pas)
	conMes.innerText = "Not connected";							//Status message displayed on webpage
	conMes.classList.add("error");
	console.log("Try connect");


	if (wSocket != null) {
		//Message from server received
		wSocket.onmessage = onMessage;

		//Connection established
		wSocket.onopen = function () {
			conMes.innerText = "Connected";
			conMes.classList.remove("error");
			conMes.classList.add("success");
			console.log("Connected\nSending regards to the server");
			wSocket.send('The client sends his regards');		//Handshake with the server
			state = "CONNECTED";
			requestTag('01');									//Requests info from tag01 -------Test---------
		};
		//Connection terminated
		wSocket.onclose = function (evt) {
			conMes.innerText = "Disconnected";
			conMes.classList.add("error");
			conMes.classList.remove("success")
			console.log('Disconnected');
			state = "DISCONNECTED";
		};
		//Error
		wSocket.onerror = function (evt) {
			conMes.innerText = "Error very 404";
			conMes.classList.add("error");
			conMes.classList.remove("success")
			console.log("Error very 404");
		};
	}
}

//Message from server received
//evt: the frame
function onMessage(evt) {
	let str = evt.data;
	console.log('message received: ' + str);

	var procMessage = str.split(":");

	if (procMessage[0] == 'The server also sends his regards') {
		poll();
	}

	switch (procMessage[0]) {
		case 'read': updateTag(procMessage[1], procMessage[2], procMessage [3], procMessage[4]);

			break;

		default:
			break;
	}
}

//Requesting info on a specified tag
//id: the id of the tag requested
function requestTag(id) {
	var str = "read:" + id;
	wSocket.send(str);
}

//Requesting the path history of a specified tag
//id: the id of the tag requested
//time: timespan to display
function requestHist(id, time) {
	var str = "hist:" + id + ":" + time;
	wSocket.send(str);
}


//Polling function used to updates selected tags every seconds
function poll() {
	if (state == "CONNECTED") {
		setTimeout(poll, 1000);
	}

	if(displayMode){
		requestTag('02');	//---------------------------Request tag 02 for testing----------------------
	}else{
		requestHist('02', 10);
	}

	
}




//Converts metric values into px to display on the map
//coordM: metric value to convert
//return: the corresponding value in px
function convertCoord(coordM) {
	var coordPx = 0;

	coordPx = coordM * (170 / 11.3);
	console.log('coordPx calculate: ' + coordPx);
	return coordPx;
}

//Modifies the tag with coordinates given
//id: the tag to update
//x: horizontal distance in px from the top left corner of the map
//y: vertical distance in px from the top left corner of the map
//return: none
function updateTag(id, x, y, room) {
	var baseX = 185;
	var baseY = 545;
	

	//Gérer les étages?
	if(room<100){

	}else if (100 >= room && room < 200) {
		
	}else if (200 >= room && room < 300) {
		
	}else if (300 < room) {

	}

	console.log('x received: ' + x);

	baseY = baseY + convertCoord(y);
	baseX = baseX + convertCoord(x);

	console.log('baseX offset: '+ baseX);


	

	c2.style.top = baseY + "px";
	c2.style.left = baseX + "px";
}
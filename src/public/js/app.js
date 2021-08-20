const socket = io(); 

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device =>device.kind==="videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera=>{
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label == camera.label)
            {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    }catch(e){
        console.log(e);
    }
}

async function getMedia(deviceId){
    const initialConstrains = {
        audio:true,
        video:{facingMode:"user"},
    };
    const cameraConstrains = {
        audio:true,
        video:{ deviceId: { exact: deviceId } },
    };
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstrains:initialConstrains
        );
        myFace.srcObject = myStream;
        if(!deviceId){
            await getCameras();
        }      
    }catch(e){
        console.log(e);
    }
}

function handleMuteClick(){
    myStream.getAudioTracks().forEach((track)=>(
        track.enabled = !track.enabled
    ));
    if(!muted){
        muteBtn.innerText ="Unmute";
        muted = true;
    }else{
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick(){
    myStream.getVideoTracks().forEach((track)=>(
        track.enabled = !track.enabled
    ));
    if(!cameraOff){
        cameraBtn.innerText ="Ture Camera Off";
        cameraOff = true;
    }else{
        cameraBtn.innerText = "Ture Camera On";
        cameraOff = false;
    }
}

async function handleCameraChangelick(){
   await getMedia(camerasSelect.value);
}
muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input",handleCameraChangelick);


/**
 * @title welcome Form(join Room)
 * @description room choice
 */

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(e){
    e.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room",input.value);
    roomName = input.value;
    input.value="";
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit);

/**
 * @title socket Code
 * 
 */
//peer A
socket.on("welcome",async ()=>{
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer",offer,roomName);
});
//peer B
socket.on("offer",async(offer)=>{
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("answer",answer);
});

/**
 * @title webRTC code
 * @description p2p
 */

function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    console.log(myStream);
    myStream
        .getTracks()
        .forEach((track)=>myPeerConnection.addTrack(track,myStream));
}




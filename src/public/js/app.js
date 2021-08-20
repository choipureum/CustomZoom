const socket = io(); 

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const chat = document.getElementById("chating");
call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

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
   if(myPeerConnection){
       const videoTrack = myStream.getVideoTracks()[0];
       const videoSender = myPeerConnection
        .getSenders()
        .find((sender)=>sender.track.kind === "video");
    videoSender.replacetrack(videoTrack);
   }
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
const msgForm = chat.querySelector("form");

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
async function handleMsgSubmit(e){
    e.preventDefault();
    const input = msgForm.querySelector("input");
    myDataChannel.send(input.value);
    input.value="";
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit);
msgForm.addEventListener("submit",handleMsgSubmit);

/**
 * @title socket Code
 * 
 */
//peer A
socket.on("welcome",async ()=>{
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message",(e)=>{
        addMessage(e.data);
    });
    console.log("made data channel");

    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer",offer,roomName);
});
//peer B
socket.on("offer",async(offer)=>{
    myPeerConnection.addEventListener("datachannel",(e)=>{
        myDataChannel = e.channel;
        myDataChannel.addEventListener("message",(e)=>{
            addMessage(e.data);
        });
    });
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer",answer,roomName);
});

socket.on("answer",(answer)=>{
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice",(ice)=>{
    myPeerConnection.addIceCandidate(ice);
})
/**
 * @title webRTC code
 * @description p2p
 */

function makeConnection(){
    myPeerConnection = new RTCPeerConnection({
        //test stun server : stun server -> 장치에 공용주소를 알려주는 서버 (p2p에서 필수)
        iceServers:[
           {
               urls:[
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
               ],
           }, 
        ],
    });
    myPeerConnection.addEventListener("icecandidate",handleIce);
    myPeerConnection.addEventListener("addstream",handleAddStream);
    myStream
        .getTracks()
        .forEach((track)=>myPeerConnection.addTrack(track,myStream));
}

function handleIce(data){
    socket.emit("ice",data.candidate,roomName);
}
function handleAddStream(data){
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}
function addMessage(msg){
    const ul = chat.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}


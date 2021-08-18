/**socket.io.use*/
const socket = io(); 

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;
let roomName;

form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",input.value,()=>{
        welcome.hidden = true;
        room.hidden = false;
        const h3 = room.querySelector("h3");
        h3.innerText = `Room ${roomName}`;
    });   
    roomName = input.value;
    input.value="";
});
/**socket.io.use*/
const socket = io(); 

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;
let roomName;

function addMessage(msg){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}
function handleMessageSubmit(e)
{
    e.preventDefault();
    const input = room.querySelector("#msg input");
    socket.emit("new_message",input.value,roomName,()=>{
        addMessage(`You: ${input.value}`);
        input.value="";
    });
}
function handleNicknameSubmit(e)
{
    e.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname",input.value);
}


form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",input.value,()=>{
        welcome.hidden = true;
        room.hidden = false;
        const h3 = room.querySelector("h3");
        h3.innerText = `Room ${roomName}`;
        const nameForm = room.querySelector("#name");
        const msgForm = room.querySelector("#msg");
        msgForm.addEventListener("submit",handleMessageSubmit);
        nameForm.addEventListener("submit",handleNicknameSubmit);
    });   
    roomName = input.value;
    input.value="";
});

socket.on("welcome",(user,newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} joined!`);
});
socket.on("bye",(user,newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} left ㅠㅠ!`);
});
socket.on("new_message",(msg)=>{addMessage(msg)});

socket.on("room_change",(rooms)=>{   
    if(rooms.length===0){
        roomList.innerHTML = "";
        return;
    }
    const roomList = welcome.querySelector("ul");
    rooms.forEach(room=>{
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
});
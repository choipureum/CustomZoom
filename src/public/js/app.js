const ul = document.querySelector("ul");
const messageForm = document.querySelector("form");
const socket = new WebSocket(`ws://${window.location.host}`); /*window.location에는 여러 주소값존재 다음은 localhost:3000 */

socket.addEventListener("open",()=>{
    console.log("Connected to Server");
});

socket.addEventListener("message",(message)=>{
    console.log(message.data);
});

socket.addEventListener("close",()=>{
    console.log("Disconnected from server");
});

messageForm.addEventListener("submit",(event)=>{
    event.preventDefault();   
    const input = messageForm.querySelector("input");
    socket.send(input.value);
    input.value="";
});
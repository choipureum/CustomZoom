import express from "express";
import SocketIO from "socket.io";
import WebSocket from "ws";
import http from "http";
import { parse } from "path";

const app = express();
app.set("view engine","pug");
app.set("views",__dirname + "/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(_,res) => res.render("home"));

const handleListen = () => console.log("Listening on http://localhost:3000")

/*app.listen(3000);*/
/*웹소켓 서버 + http 서버 둘다 사용 가능하게 합친다.(굳이 http프로토콜 서버가 필요없으면 안해도댐)*/ 
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);
/**socket.io방식*/
wsServer.on("connection",(socket)=>{
    socket.onAny((e)=>{
        console.log(`Socket room: ${e}`);
    });
    socket.on("enter_room",(roomName,done)=>{
        socket.join(roomName);
        done();
    });  
});


/**websocket 방식 */
/*
const wss = new WebSocket.Server({server});
const sockets = [];

wss.on(`connection`,(socket)=>{
    console.log("Connected to Browser");
    sockets.push(socket);
    socket["nickname"]="annonymous"
    socket.on("close",() => console.log("Disconnected to Browser"));
    socket.on("message",(message)=>{
        const msg = JSON.parse(message);

        switch(msg.type)
        {
            case "newMessage":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${msg.payload}`));
                break;
            case "nickname":
                socket["nickname"] = msg.payload;
        }      
    });
})
*/
httpServer.listen(3000, handleListen);

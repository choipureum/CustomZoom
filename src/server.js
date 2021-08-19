import express from "express";
import {Server} from "socket.io";
import WebSocket from "ws";
import http from "http";
import { parse } from "path";
import {instrument} from "@socket.io/admin-ui";

const app = express();
app.set("view engine","pug");
app.set("views",__dirname + "/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(_,res) => res.render("home"));

const handleListen = () => console.log("Listening on http://localhost:3000")

/*app.listen(3000);*/
/*웹소켓 서버 + http 서버 둘다 사용 가능하게 합친다.(굳이 http프로토콜 서버가 필요없으면 안해도댐)*/ 
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer,{
    cors:{
        origin:["https://admin.socket.io"],
        credentials:true
    }
});
instrument(wsServer,{
    auth:false,
})
//const wsServer = SocketIO(httpServer);

function publicRooms()
{   
    const {
        sockets:{
            adapter:{
                sids,rooms},
            },
        } = wsServer;
    //const sids = wsServer.sockets.adapter.sids;
    //const rooms = wsServer.sockets.adapter.rooms;
    const publicRooms =[];
    rooms.forEach((_,key)=>{
        if(sids.get(key)=== undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}



/**socket.io방식*/
wsServer.on("connection",(socket)=>{
    socket["nickname"]= "Anonymous"; 
    socket.onAny((e)=>{
        console.log(`Socket room: ${e}`);
    });
    //방 들어옴
    socket.on("enter_room",(roomName,done)=>{
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName));
        wsServer.sockets.emit("room_change",publicRooms());
    }); 
    //방 나감
    socket.on("disconnecting",()=>{
        socket.rooms.forEach((room) => 
            socket.to(room).emit("bye",socket.nickname,countRoom(room)-1)
        );
    });
    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message",`${socket.nickname} : ${msg}`);
        done();
    }); 
    socket.on("nickname",(nickname)=>socket["nickname"]=nickname);
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

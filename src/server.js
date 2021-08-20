import express from "express";
import SocketIO from "socket.io";
import WebSocket from "ws";
import http from "http";
import { parse } from "path";
import {instrument} from "@socket.io/admin-ui";

const app = express();
app.set("view engine","pug");
app.set("views",__dirname + "/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(_,res) => res.render("home"));

const handleListen = () => console.log("Listening on http://localhost:3000");
 
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection",(socket)=>{
    socket.on("join_room",(roomName)=>{
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer",(offer,roomName)=>{
       socket.to(roomName).emit("offer",offer); 
    });
    socket.on("answer",(answer,roomName)=>{
        socket.to(roomName).emit("answer",answer);
    });
    socket.on("ice",(ice,roomName)=>{
        socket.to(roomName).emit("ice",ice)
    });
});

httpServer.listen(3000, handleListen);

import express from "express";
import WebSocket from "ws";
import http from "http";

const app = express();
app.set("view engine","pug");
app.set("views",__dirname + "/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/*",(_,res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000")

/*app.listen(3000);*/
/*웹소켓 서버 + http 서버 둘다 사용 가능하게 합친다.(굳이 http프로토콜 서버가 필요없으면 안해도댐)*/ 
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
/*접속자 수*/
const sockets = [];

wss.on(`connection`,(socket)=>{
    console.log("Connected to Browser");
    sockets.push(socket);
    socket.on("close",() => console.log("Disconnected to Browser"));
    socket.on("message",(message)=>{
        sockets.forEach(aSocket => aSocket.send("New Message : "+message));
    });
})

server.listen(3000, handleListen);

import "dotenv/config";
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import SocketIO from 'socket.io';
import socketIOJWT from 'socketio-jwt';


import schema from './app/grapghql';
import ExpressGraphQL from 'express-graphql';
import routerAPI from './app/router.api';
import routerAUTH from './app/router.auth';
import message from './app/messages';
import middleware from './app/middleware';
import socket from './app/socket';

const app = express(),
    server = http.createServer(app),
    io = SocketIO(server);

app.use(require('cors')());
app.use(bodyParser.json());

app.use('/account', routerAUTH);
app.use('/api', routerAPI);
app.use("/api/graph", ExpressGraphQL({
    schema: schema.public,
    graphiql: true
}));
app.get("/api/private/graph", middleware.auth, middleware.permission(['admin', 'superadmin']), ExpressGraphQL({
    schema: schema.private,
    graphiql: true
}));


io.on('connection',  socketIOJWT.authorize({
    secret: process.env.AUTH_KEY,
    timeout: 15000
})).on('authenticated', SOCKET=>{
    socket(io, SOCKET);
});

app.all('*', (req, res) => {
    res.status(404).json({ status: false, code: 404, message: message.error.notfount });
})

server.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`))
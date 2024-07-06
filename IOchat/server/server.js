// 1
const { Server } = require("socket.io");

// 2
const io = new Server("5000", {
    cors: {
        orgin: "http://localhost:3000",
    },
});

// p-1
const clients = new Map();

// 3
io.sockets.on("connection", (socket) => {
    // 4
    socket.on("message", (res) => {
        const { target } = res;
        // 5
        // p-2
        const toUser = clients.get(target)
        // r-1
        if (target) {
            const toUser = clients.get(target)
            io.sockets.to(toUser).emit('sMessage', res);
            return;
        }

        // r-1
        const myRooms = Array.from(socket.rooms);
        if (myRooms.length > 0) {
            socket.broadcast.in(myRooms[1]).emit("sMessage", res);
            return;
        }
        socket.broadcast.emit('sMessage', res);

    });
    socket.on("login", (data) => {
        // r-2
        const { userId, roomNumber } = data;
        socket.join(roomNumber);
        // p-3
        clients.set(userId, socket.id);
        socket.broadcast.emit("sLogin", userId);
    });
    // 6
    socket.on("disconnect", () => {
        console.log("user disconnected");
    })
})
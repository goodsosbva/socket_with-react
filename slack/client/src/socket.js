import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
    autoConnect: false,
});
// 1 - private 와 group 네임페이스 생성
export const socketPrivate = io("http://localhost:5000/private", {
    autoConnect: false,
});
// 2
export const socketGroup = io("http://localhost:5000/group", {
    autoConnect: false,
});
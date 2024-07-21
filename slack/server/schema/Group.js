const { Schema, model } = require("mongoose");

// 1 - groupUserList는 그룹 채팅 관련된 사용자를 따로 관리하기 위해 생성. 기존에 User 도큐먼트를 그대로 사용하게 된다면
// 다른 그룹 채팅을 구분할 수 없기 때문에 아예 그룹 채팅만을 위한 관리 포인트를 만듬
const groupUserList = new Schema({
    status: Boolean,
    userId: String,
    socketId: String,
});

// 2 - groupRoom은 그룹 채팅을 위한 스키마. 하나의 방에는 여러 명의 사용자가 속해 있기 때문에 동일한 객체가 생성되자만 loginUserId는
// 각각 다르게 만들어 집니다.
const groupRoom = new Schema({
    loginUserId: String,
    status: Boolean,
    userId: String,
    socketId: String,
    type: String,
});

// 3 - 그룹 채팅 메세지를 저장하기 위한 스키마
const msg = new Schema({
    roomNumber: String,
    msg: String,
    toUserId: String,
    fromUserId: String,
    time: String,
});

module.exports = {
    GroupUserList: model("Group-user", groupUserList),
    GroupRoom: model("Group-room", groupRoom),
    GroupMsg: model("Group-msg", msg),
};
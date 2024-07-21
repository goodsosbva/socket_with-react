import React, { useState, useContext, useEffect, useRef } from "react";
import { css } from "@emotion/react";
import { Context } from "../../../context";
import {
    chatRoomWrapCss,
    subTitleCss,
    chatBoxCss,
    chatBoxGuidCss,
    chatCss,
} from "./ChatRoom.style";
import { TextEditor, GroupTextInput } from "../../index";
import { socketPrivate, socketGroup } from "../../../socket";
import logo from "../../../images/logo.png";
import dayjs from "dayjs";

const ChatRoom = () => {
    // 1 - 전역 변수로 관리되고 있는 채팅 관련 변수들을 불러온다. chatRoom 컴포넌트는 채팅의 메인 영역에
    // 자리잡고 있기 때문에 노출해야 될 정보가 많다. 그 만큼 많은 정보 필요
    const {
        state: { currentChat, loginInfo, groupChat, userList },
    } = useContext(Context);
    const reactQuillRef = useRef(null);
    const [text, setText] = useState("");
    const [groupUser, setGroupUser] = useState("");
    const [msgList, setMsgList] = useState([]);
    const [groupChatUsers, setGroupChatUsers] = useState([]);

    // 2 - private-msg 는 다른 상대가 1:1로 대화한 메세지를 받는 이벤트. useEffect() 훅의 콜백으로 방 번호를 설정
    useEffect(() => {
        function setPrivateMsgListHandler(data) {
            const { msg, fromUserId, toUserId, time } = data;
            if (
                currentChat.roomNumber === `${fromUserId}-${toUserId}` ||
                currentChat.roomNumber === `${toUserId}-${fromUserId}`
            ) {
                setMsgList((prev) => [
                    ...prev,
                    {
                        msg: msg,
                        userId: fromUserId,
                        time,
                    },
                ]);
            }
        }
        socketPrivate.on("private-msg", setPrivateMsgListHandler);
        return () => {
            socketPrivate.off("private-msg", setPrivateMsgListHandler);
        };
    }, [currentChat.roomNumber]);

    // 3 - 그룹 메세지를 불러오는 함수. 개인 메세지와 동일하게 'group-msg'라는 이벤트를 통해서 서버의 그룹 메세지 정보를 가져옴.
    useEffect(() => {
        function setGroupMsgListHandler(data) {
            const { msg, toUserSocketId, fromUserId, time } = data;
            if (currentChat.roomNumber === toUserSocketId) {
                setMsgList((prev) => [
                    ...prev,
                    {
                        msg: msg,
                        userId: fromUserId,
                        time,
                    },
                ]);
            }
        }
        socketGroup.on("group-msg", setGroupMsgListHandler);
        return () => {
            socketGroup.off("group-msg", setGroupMsgListHandler);
        };
    }, [currentChat.roomNumber]);

    // 4 - 처음 개인 대화방에 들어가면 과거에 대화했던 내역을 가져오는 함수. "private-msg-init" 라는 이벤트가 해당 역할을 한다.
    useEffect(() => {
        function setMsgListInit(data) {
            setMsgList(
                data.msg.map((m) => ({
                    msg: m.msg,
                    userId: m.fromUserId,
                    time: m.time,
                }))
            );
        }
        socketPrivate.on("private-msg-init", setMsgListInit);
        return () => {
            socketPrivate.off("private-msg-init", setMsgListInit);
        };
    }, []);

    // 5 - 4번과 마찬가지의 원리
    useEffect(() => {
        function setGroupMsgListInit(data) {
            setMsgList(
                data.msg.map((m) => ({
                    msg: m.msg,
                    userId: m.fromUserId,
                    time: m.time,
                }))
            );
        }
        socketGroup.on("group-msg-init", setGroupMsgListInit);
        return () => {
            socketGroup.off("group-msg-init", setGroupMsgListInit);
        };
    }, []);

    // 6 - 현재 대화하고 있는 방을 나가면 setMsgList()라는 함수를 초기화합니다.
    useEffect(() => {
        return () => {
            setMsgList([]);
        };
    }, [currentChat.roomNumber]);

    // 7 - 내가 작성한 개인 메세지를 서버로 전송하는 함수
    const onPrivateMsgSendHandler = () => {
        // react-quill을 이용했기 때문에 quill 에서 제공하는 getText() 메소드로 글자를 불러올 수 있다.
        const msg = reactQuillRef.current.unprivilegedEditor.getText();
        // dayjs()를 이용하여 현재시 간을 설정
        const currentTime = dayjs().format("HH:mm a");
        setMsgList((prev) => [
            ...prev,
            {
                msg: msg,
                userId: loginInfo.userId,
                time: currentTime,
            },
        ]);
        // 'privateMsg' 이벤트에 이용해서 서버로 메세지 내용을 전송. 메세지 내용과 함께 누구로부터 어디로 보내야 하는지에 대한 정보도 함께 전송
        socketPrivate.emit("privateMsg", {
            msg: msg,
            toUserId: currentChat.targetId[0],
            toUserSocketId: currentChat.targetSocketId,
            fromUserId: loginInfo.userId,
            time: currentTime,
        });
        setText("");
    };

    // 8 - 그룹 대화방을 만들기 위해 Direct Messages 라는 버튼을 클릭하면 나오는 input 박스입니다. input 박스에는
    // 접속한 사용자를 입력하면 자동으로 그룹 대회에 초대할 사용자 리스트를 저장
    const onGroupSendHandler = (e) => {
        e.preventDefault();

        // 두 가지 유효성 검사가 있다.
        // 1) 없는 사용자를 초대하는 경우 2) 자신 스스로를 초대하는 경우
        // 정상적으로 추가하면 setGroupChatUsers() 상태에 추가 된다
        if (!userList.filter((v) => v.userId === groupUser).length > 0) {
            alert("The user does not exist.");
            setGroupUser("");
            return;
        }
        if (groupUser === loginInfo.userId) {
            alert("Please, Choose someone else.");
            setGroupUser("");
            return;
        }
        setGroupChatUsers([...groupChatUsers, groupUser]);
        setGroupUser("");
    };

    // 9 - 그륩 대화 초대를 위한 input 박스 핸들러
    const onChangeGroupTextHandler = (e) => {
        setGroupUser(e.target.value);
    };

    // 10 - 초대한 사람의 X 버튼을 클릭하면 실행. X를 클릭하면 초대 리스트에서 제거된다.
    const groupChatUserCloseClick = (e) => {
        const { id } = e.target.dataset;
        setGroupChatUsers(groupChatUsers.filter((v) => v !== id));
    };

    // 11 - 그룹 채팅에서 join 버튼을 클릭하면 실행. join 버튼을 누르면 'reqGroupJoinRoom'이라는 이벤트를 실행 해서
    // 해당하는 사용자에게 초대장을 발송
    const onJoinClick = () => {
        if (groupChatUsers.length <= 0) return;
        const socketId = [...groupChatUsers, loginInfo.userId].join(",");
        const user = {
            socketId: socketId,
            status: true,
            userId: socketId,
            type: "group",
        };
        socketGroup.emit("reqGroupJoinRoom", user);
        setGroupChatUsers([]);
    };

    // 12 - 개인 메세지와 동일하게 그룹 메세지를 작성하는 input 박스 핸들러
    const onGroupMsgSendHandler = () => {
        const msg = reactQuillRef.current.unprivilegedEditor.getText();
        const currentTime = dayjs().format("HH:mm a");
        setMsgList((prev) => [
            ...prev,
            {
                msg: msg,
                userId: loginInfo.userId,
                time: currentTime,
            },
        ]);
        socketGroup.emit("groupMsg", {
            toUserId: currentChat.targetSocketId,
            toUserSocketId: currentChat.targetSocketId,
            fromUserId: loginInfo.userId,
            msg: msg,
            time: currentTime,
        });
        setText("");
    };
    return (
        <article css={chatRoomWrapCss}>
            <div css={subTitleCss}>
                {groupChat.textBarStatus ? (
                    <GroupTextInput
                        groupText={groupUser}
                        onChangeGroupTextHandler={onChangeGroupTextHandler}
                        groupChatUserList={groupChatUsers}
                        onGroupSendHandler={onGroupSendHandler}
                        groupChatUserCloseClick={groupChatUserCloseClick}
                        onJoinClick={onJoinClick}
                    />
                ) : (
                    currentChat.targetId.map((v) => (
                        <span className="user">{v}</span>
                    ))
                )}
            </div>
            {currentChat.roomNumber ? (
                <ul css={chatBoxCss}>
                    {msgList.map((v, i) => (
                        <li css={chatCss} key={`${i}-chat`}>
                            <div className="userBox">
                                <span className="user">{v.userId}</span>
                                <span className="date">{v.time}</span>
                            </div>
                            <div className="textBox">{v.msg}</div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div css={chatBoxGuidCss}>
                    <img src={logo} width="100px" height="auto" alt="logo" />
                    <div className="guide">Please, Choose a conversation.</div>
                </div>
            )}
            {currentChat.roomNumber && (
                <TextEditor
                    onSendHandler={
                        currentChat.targetId.length > 1
                            ? onGroupMsgSendHandler
                            : onPrivateMsgSendHandler
                    }
                    text={text}
                    reactQuillRef={reactQuillRef}
                    onChangeTextHandler={setText}
                />
            )}
        </article>
    );
};

export default ChatRoom;
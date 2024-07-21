import React, { useContext, useEffect } from "react";
import { css } from "@emotion/react";
import { Context } from "../../../context";
import { CURRENT_CHAT, GROUP_CHAT } from "../../../context/action";
import {
    navBarWrapCss,
    titleCss,
    userListCss,
    directMsgCss,
} from "./SideBar.style";
import { User } from "../../index";
import { BiChevronDown } from "react-icons/bi";
import { socketPrivate, socketGroup } from "../../../socket";

const SideBar = () => {
    // 1 - 사이드바에 필요한 사용자 리스트와 그룹 리스틀를 가져온다.
    const {
        state: { userList, loginInfo, currentChat, groupList },
        dispatch,
    } = useContext(Context);

    // 2 - 현재 클릭한 userId를 'msgInit' 이라는 이벤트에 보냅니다.
    useEffect(() => {
        // 1보다 큰 겨우는 그룹채팅을 의미
        if (currentChat.targetId.length > 1) {
            socketGroup.emit("msgInit", {
                targetId: currentChat.targetId,
            });
        } else {
            socketPrivate.emit("msgInit", {
                targetId: currentChat.targetId,
            });
        }
    }, [currentChat.targetId]);

    // 3 - 개인 초대를 받으면 실행 됩니다. 만약 a라는 사람이 먼저 b와 개인 대화를 시작하면 b는 'msg-alert'라는 이벤트를 이용해서
    // a의 초대 방 번호를 받는다. a는 'resJoinRoom'이라는 이벤트로 해당 방 번호를 서버로 전송해서 스스로 방에 입장한다.
    useEffect(() => {
        function setMsgAlert(data) {
            socketPrivate.emit("resJoinRoom", data.roomNumber);
        }
        socketPrivate.on("msg-alert", setMsgAlert);
        return () => {
            socketPrivate.off("msg-alert", setMsgAlert);
        };
    }, []);

    // 4 - 3번과 같은 원리
    useEffect(() => {
        function setGroupChat(data) {
            socketGroup.emit("resGroupJoinRoom", {
                roomNumber: data.roomNumber,
                socketId: data.socketId,
            });
        }
        socketGroup.on("group-chat-req", setGroupChat);
        return () => {
            socketGroup.off("group-chat-req", setGroupChat);
        };
    }, []);

    // 5 - 사이드바에 노출된 개인을 클릭하면 실행 된다.
    // CURRENT_CHAT 이라는 액션 값을 이용해서 현 자신이 대화하고 있는 방에 정보를 전역 변수로 저장
    const onUserClickHandler = (e) => {
        const { id } = e.target.dataset;
        dispatch({
            type: CURRENT_CHAT,
            payload: {
                targetId: [id],
                roomNumber: `${loginInfo.userId}-${id}`,
                targetSocketId: e.target.dataset.socket,
            },
        });
        // 대화 하고 싶은 상대방에게 초대장을 보내는 부분
        socketPrivate.emit("reqJoinRoom", {
            targetId: id,
            targetSocketId: e.target.dataset.socket,
        });

        // 그룹 메세지를 초기화하여 개인 메세지에서 그룹 메세지를 안보이게 하기 위함.
        dispatch({
            type: GROUP_CHAT,
            payload: {
                textBarStatus: false,
                groupChatNames: [],
            },
        });
    };

    // 6 - 사이드바에 있는 Direct Messages 를 클릭하면 실행. 클릭 이후 그룹 대화를 만들 수 있는 input 박스가 활성화
    // 해당 변수는 물론 전역 변수로 관리
    const onMakeGroupChat = () => {
        dispatch({
            type: GROUP_CHAT,
            payload: {
                textBarStatus: true,
                groupChatNames: [],
            },
        });
    };

    // 7- 개인 채팅과 동일하게 그룹 채팅을 클릭하면 실행되는 함수
    const onGroupUserClickHandler = (e) => {
        const { id } = e.target.dataset;
        dispatch({
            type: CURRENT_CHAT,
            payload: {
                // 개인 채팅과는 다르게 그룹 채팅이다 보니 대화하는 상대를 ","로 구분지어 문자열로 관리
                targetId: [...id.split(",")],
                roomNumber: id,
                targetSocketId: e.target.dataset.socket,
            },
        });
        socketGroup.emit("joinGroupRoom", {
            roomNumber: id,
            socketId: e.target.dataset.socket,
        });
        dispatch({
            type: GROUP_CHAT,
            payload: {
                textBarStatus: false,
                groupChatNames: [],
            },
        });
    };
    return (
        <nav css={navBarWrapCss}>
            <div css={titleCss}> Slack</div>
            <ul css={userListCss}>
                <li css={directMsgCss} onClick={onMakeGroupChat}>
                    <BiChevronDown size="20" /> Direct Messages +
                </li>
                {userList.map((v, i) => (
                    <li key={`${i}-user`}>
                        <User
                            id={v.userId}
                            status={v.status}
                            socket={v.socketId}
                            type={v.type}
                            onClick={
                                v.type === "group"
                                    ? onGroupUserClickHandler
                                    : onUserClickHandler
                            }
                        />
                    </li>
                ))}
                {groupList.map((v, i) => (
                    <li key={`${i}-user`}>
                        <User
                            id={v.userId}
                            status={v.status}
                            socket={v.socketId}
                            type={v.type}
                            onClick={
                                v.type === "group"
                                    ? onGroupUserClickHandler
                                    : onUserClickHandler
                            }
                        />
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SideBar;
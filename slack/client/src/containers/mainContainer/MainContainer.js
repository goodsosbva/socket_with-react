import React, { useEffect, useState, useContext } from "react";
import { css } from "@emotion/react";
import {
    mainContainerCss,
    slackMainCss,
    slackHeaderCss,
    slackWindowCss,
    mainContentCss,
} from "./MainContainer.style";
import { socket, socketPrivate, socketGroup } from "../../socket";
import { SideBar, ChatRoom } from "../../components";
import { USER_LIST, AUTH_INFO, GROUP_LIST } from "../../context/action";
import { Context } from "../../context";

const MainContainer = () => {
    // 1 - useContext() 훅을 이용해서 전역 변수로 선언된 loginInfo 변수를 불러온다.
    const {
        state: { loginInfo },
        dispatch,
    } = useContext(Context);
    // 2 - 소켓이 연결되면 'connect'라는 이벤트로 콜백을 받는다.
    useEffect(() => {
        socket.on("connect", () => {
            dispatch({
                type: AUTH_INFO,
                payload: {
                    userId: socket.auth.userId,
                    socketId: socket.id,
                },
            });
        });
        // 콜백 안에는 socket 객체에 선언된 userId 값을 가지고 있다. 이 값을 전역 변수에 선언할 예정
        // 마지막으로 MainContainer가 언마운트되면 소켓 연결을 해체
        return () => {
            socket.disconnect();
            socketPrivate.disconnect();
            socketGroup.disconnect();
        };
    }, []);
    // 3 - 'user-list'라는 소켓 이벤트로 mongoDB에 저장된 사용자 리스트를 받아온다.
    // 사용자 리스트 또한 전역 변수에 저장.
    useEffect(() => {
        function setUserListHandler(data) {
            dispatch({
                type: USER_LIST,
                payload: data || [],
            });
        }
        socket.on("user-list", setUserListHandler);
        return () => {
            socket.off("user-list", setUserListHandler);
        };
    }, []);
    // 4 - 'group-list' 소켓 이벤트로 그룹 대화방에 해당하는 그룹 리스트르 받아온다.
    useEffect(() => {
        function setGroupListHandler(data) {
            dispatch({
                type: GROUP_LIST,
                payload: data || [],
            });
        }
        socketGroup.on("group-list", setGroupListHandler);
        return () => {
            socketGroup.off("group-list", setGroupListHandler);
        };
    }, []);
    return (
        <div css={mainContainerCss}>
            <div css={slackMainCss}>
                <header css={slackHeaderCss}>
                    <ul css={slackWindowCss}>
                        <li className="red"></li>
                        <li className="orange"></li>
                        <li className="green"></li>
                    </ul>
                    <div className="user">{loginInfo.userId}</div>
                </header>
                <article css={mainContentCss}>
                    <SideBar />
                    <ChatRoom />
                </article>
            </div>
        </div>
    );
};

export default MainContainer;
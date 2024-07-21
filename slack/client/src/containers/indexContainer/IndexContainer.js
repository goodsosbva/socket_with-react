import React, { useState, useEffect } from "react";
import { css } from "@emotion/react";
import {
    indexContainerCss,
    loginWrapCss,
    headerCss,
    loginFormCss,
    inputCss,
    btnCss,
} from "./IndexContainer.style";
// 1 - 미리 설저아한 socket.io의 네임스페이스 객체를 불러온다. 또한 sign in 버튼을 클릭하면 메인 페이지로 이동하기 위해 useNavigate라는 훅을 추가
import { socket, socketPrivate, socketGroup } from "../../socket";
import { useNavigate } from "react-router-dom";
import logo from "../../images/logo.png";

const IndexContainer = () => {
    const [user, setUser] = useState("");
    const navigate = useNavigate();
    // 2 - userId를 서버에 넘기지 않고 로그인했다면 오류 콜백을 받을 수 있느 함수를 정의
    useEffect(() => {
        socket.on("connect_error", (err) => {
            if (err.message === "invalid userId") {
                console.log("err");
            }
        });
    }, []);
    // 3 - 각각의 네임스페이스에 동일한 userId를 추가. 이렇게 설정한 이유는 네임스페이스마다 고유한
    // socketId가 부여되는 별개의 환경이기 때문에 이렇게 설정
    const onLoginHandler = (e) => {
        e.preventDefault();
        if (!user) return;
        socket.auth = { userId: user };
        socket.connect();
        socketPrivate.auth = { userId: user };
        socketPrivate.connect();
        socketGroup.auth = { userId: user };
        socketGroup.connect();
        navigate("/main");
    };
    // 4
    const onUserNameHandler = (e) => {
        setUser(e.target.value);
    };
    return (
        <div css={indexContainerCss}>
            <div css={loginWrapCss}>
                <h1 css={headerCss}>
                    <img src={logo} width="100px" height="auto" alt="logo" />
                </h1>
                <form css={loginFormCss} onSubmit={onLoginHandler}>
                    <input
                        css={inputCss}
                        type="text"
                        value={user}
                        placeholder="Enter your ID"
                        onChange={onUserNameHandler}
                    />
                    <button onClick={onLoginHandler} css={btnCss}>
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
};

export default IndexContainer;
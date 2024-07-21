import { createContext, useReducer } from "react";
import {
    AUTH_INFO,
    USER_LIST,
    CURRENT_CHAT,
    GROUP_CHAT,
    GROUP_LIST,
} from "./action";

// 1 - 전역 변서의 초기값. 전역 변수로는 현재 접속한 사용자의 정보, 사용자 리스트, 그룹 채팅 활성화 등이 있다.
const initialState = {
    loginInfo: {
        userId: "",
        socketId: "",
    },
    userList: [],
    groupList: [],
    currentChat: {
        targetId: [],
        roomNumber: "",
        targetSocketId: "",
    },
    groupChat: {
        textBarStatus: false,
        groupChatNames: [],
    },
};

const Context = createContext({});

// 2 - 전역 변수 업데이트를 위한 switch 문
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AUTH_INFO:
            return {
                ...state,
                loginInfo: action.payload,
            };
        case USER_LIST:
            return {
                ...state,
                userList: action.payload,
            };
        case GROUP_LIST:
            return {
                ...state,
                groupList: action.payload,
            };
        case CURRENT_CHAT:
            return {
                ...state,
                currentChat: action.payload,
            };
        case GROUP_CHAT:
            return {
                ...state,
                groupChat: action.payload,
            };
        default:
            return state;
    }
};

const StoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const value = { state, dispatch };
    return <Context.Provider value={value}>{children}</Context.Provider>;
};

export { Context, StoreProvider };
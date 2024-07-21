import { css } from "@emotion/react";
import { userCss } from "./User.style";

// 1 - User 컴포넌트는 접속 상태를 표현하기 위한 status 값을 받는다. 또한 각각의 socket 아이디 값을 할당 받아 클릭하면 어떤 채팅 방에
// 속해 있는지 여부를 확인할 수 있다.
const User = ({ id, status, onClick, socket, type }) => {
    return (
        <div
            css={userCss}
            data-id={id}
            data-type={type}
            data-socket={socket}
            data-status={status}
            onClick={onClick}
        >
            <span className={status ? "active" : "deactive"} />
            <span
                data-type={type}
                className="user"
                data-id={id}
                data-socket={socket}
                data-status={status}
            >
        {id}
      </span>
        </div>
    );
};

export default User;
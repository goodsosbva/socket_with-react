import { css } from "@emotion/react";
import {
    groupTextContainerCss,
    titleCss,
    inputCss,
    groupFormCss,
    nameBoxCss,
    tagCss,
    joinBtnCss,
} from "./GroupTextInput.style";

// 1 (1-2) - 그룹 채팅은 많은 사용자가 참여하기 때문에 사용자 값을 리스트로 전달.
// 그 리스트를 순회하면서 추가한 사용자의 아디 값을 노출 하게 했다.
const GroupTextInput = ({
                            groupText,
                            onChangeGroupTextHandler,
                            onGroupSendHandler,
                            groupChatUserList,
                            groupChatUserCloseClick,
                            onJoinClick,
                        }) => {
    return (
        <div css={groupTextContainerCss}>
            <span css={titleCss}>to:</span>
            <ul css={nameBoxCss}>
                {
                    // 2
                    groupChatUserList.map((v, i) => (
                        <li css={tagCss} key={`${i}-${v}`}>
                            {v}
                            <span
                                className="close"
                                data-id={v}
                                onClick={groupChatUserCloseClick}
                            >
                X
              </span>
                        </li>
                    ))
                }
            </ul>
            <form onSubmit={onGroupSendHandler} css={groupFormCss}>
                <input
                    type="text"
                    value={groupText}
                    css={inputCss}
                    onChange={onChangeGroupTextHandler}
                    onChangeGroupTextHandler={onChangeGroupTextHandler}
                />
            </form>
            <button css={joinBtnCss} onClick={onJoinClick}>
                Join
            </button>
        </div>
    );
};

export default GroupTextInput;
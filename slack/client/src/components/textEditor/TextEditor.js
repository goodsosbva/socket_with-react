// 1 - input 박스를 만들기 위한 react-quill 을 불러옵니다. 또한 quill의 snow 스타일을 적용하기 위해 quill.snow.css 적용
import { css } from "@emotion/react";
import { containerCss, sendCss } from "./TextEditor.style";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { HiPaperAirplane } from "react-icons/hi2";

// 2 - react-quill 박스에 포함될 모듈을 설정. 슬랙과 비슷한 모양만을 만들기 위해 간단하게 설정
const modules = {
    toolbar: {
        containers: [
            [{ list: "ordered" }, { list: "bullet" }],
            ["bold", "italic", "underline", "strike"],
            [{ script: "sub" }, { script: "super" }],
        ],
    },
};

const TextEditor = ({
                        text,
                        onChangeTextHandler,
                        reactQuillRef,
                        onSendHandler,
                    }) => {
    return (
        <div css={containerCss}>
            <HiPaperAirplane css={sendCss} onClick={onSendHandler} />
            <ReactQuill
                theme="snow"
                modules={modules}
                value={text}
                onChange={onChangeTextHandler}
                ref={(el) => {
                    reactQuillRef.current = el;
                }}
            ></ReactQuill>
        </div>
    );
};

export default TextEditor;
import React, { ReactNode, useState } from "react";

interface InlineHintProps {
    children: ReactNode;
}

export const InlineHint: React.FC<InlineHintProps> = ({ children }) => {
    const [show, setShow] = useState(false);

    return (
        <div
            style={{
                position: "relative",
                display: "block",
                width: "100%",
            }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}

            {show && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "100%",
                        left: 4,
                        marginBottom: 4,
                        padding: "2px 6px",
                        fontSize: "11px",
                        background: "#333",
                        color: "#fff",
                        borderRadius: 4,
                        whiteSpace: "nowrap",
                        opacity: 0.8,
                        pointerEvents: "none",
                        zIndex: 1000,
                    }}
                >
                    Ctrl / Cmd + click to edit
                </div>
            )}
        </div>
    );
};

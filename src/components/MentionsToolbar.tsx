import React from "react";

interface MentionUser {
    key: string;
    value: string;
}

interface MentionToolbarProps {
    users: MentionUser[];
    onInsert: (userKey: string) => void;
}

export const MentionsToolbar: React.FC<MentionToolbarProps> = ({ users, onInsert }) => {
    if (!users.length) return null;

    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            padding: 6,
            marginTop: 8,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 4
        }}>
            {users.map(user => (
                <div
                    key={user.key}
                    onClick={() => onInsert(user.key)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        padding: "2px 6px",
                        background: "#f5f5f5",
                        cursor: "pointer",
                        fontSize: 12
                    }}
                >
                    <i className="fa fa-plus" style={{ marginRight: 4 }} />
                    {user.value}
                </div>
            ))}
        </div>
    );
};

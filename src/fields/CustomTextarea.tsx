import { Field } from "../types/types";
import { Actions } from "../components/Actions";
import "@toast-ui/editor/dist/toastui-editor.css";
import { getUsersForMention } from "../utils/utils";
import { Editor, Viewer } from "@toast-ui/react-editor";
import { sendAjaxUpdate } from "../utils/ajaxUpdateField";
import React, { useState, useRef, useEffect } from "react";
import { MentionsToolbar } from "../components/MentionsToolbar";

interface CustomTextareaProps {
    field: Field;
}

export const CustomTextarea: React.FC<CustomTextareaProps> = ({ field }) => {
    const [currentValue, setCurrentValue] = useState(field.value || "");
    const [editingValue, setEditingValue] = useState(currentValue);
    const [visible, setVisible] = useState(false);
    const [mentionUsers, setMentionUsers] = useState<{ key: string; value: string }[]>([]);

    const editorRef = useRef<Editor>(null);

    const handleSave = async () => {
        const newValue = editorRef.current?.getInstance().getMarkdown() ?? "";
        const response = await sendAjaxUpdate((formData) => {
            formData.append("value", newValue);
            formData.append("field", field.field);
            formData.append("type", field.type);
            if (field.field_id) {
                formData.append("custom_field_id", field.field_id.toString());
            }
        });

        if (response.success) {
            setCurrentValue(newValue);
            setEditingValue(newValue);
            setVisible(false);
        } else {
            alert(`Chyba pri ukladaní: ${response.message}`);
        }
    };

    const handleCancel = () => {
        setEditingValue(currentValue);
        setVisible(false);
    };

    useEffect(() => {
        if (!visible) return;
        setMentionUsers(getUsersForMention());
    }, [visible]);

    return (
        <>
            {!visible ? (
                <div
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) setVisible(true);
                    }}
                >
                    <Viewer initialValue={currentValue} />
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <Editor
                        ref={editorRef}
                        initialValue={editingValue}
                        initialEditType="markdown"
                        previewStyle="tab"
                        height="350px"
                        usageStatistics={false}
                    />

                    <MentionsToolbar
                        users={mentionUsers}
                        onInsert={(userKey) => {
                            const editor = editorRef.current?.getInstance();
                            if (!editor) return;

                            editor.replaceSelection(`@${userKey} `);
                            editor.focus();
                        }}
                    />

                    <Actions onSave={handleSave} onCancel={handleCancel} />
                </div>
            )}
        </>
    );
};

import { Field } from "../types/types";
import { Actions } from "../components/Actions";
import { Editor, Viewer } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import { InlineHint } from "../components/InlineHint";
import { sendAjaxUpdate } from "../utils/ajaxUpdateField";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { MentionsToolbar } from "../components/MentionsToolbar";
import { getUsersForMention, autoLinkMarkdown } from "../utils/utils";

interface CustomTextareaProps {
    field: Field;
    tdElement: HTMLElement;
}

const isHtmlEmail = (text: string): boolean => {
    return /<html[\s>]/i.test(text) || /<body[\s>]/i.test(text) || /<head[\s>]/i.test(text);
};

export const CustomTextarea: React.FC<CustomTextareaProps> = ({ field, tdElement }) => {
    const [storedValue, setStoredValue] = useState(field.value || "\u00A0");
    const [displayValue, setDisplayValue] = useState(autoLinkMarkdown(storedValue));

    const htmlEmailParts = useMemo(() => {
        if (!isHtmlEmail(storedValue)) return null;
        const match = storedValue.match(/([\s\S]*?)(<html[\s\S]*)/i);
        return {
            prefix: match ? match[1].trim() : '',
            html: match ? match[2] : storedValue,
        };
    }, [storedValue]);
    const [editingValue, setEditingValue] = useState(storedValue);
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
            setStoredValue(newValue);
            setDisplayValue(autoLinkMarkdown(newValue));
            setEditingValue(newValue);
            setVisible(false);
        } else {
            alert(`Chyba pri ukladaní: ${response.message}`);
        }
    };

    const handleCancel = () => {
        setEditingValue(storedValue);
        setVisible(false);
    };

    useEffect(() => {
        if (!visible) return;
        setMentionUsers(getUsersForMention());
    }, [visible]);

    useEffect(() => {
        (window as any).imaticFormsRender?.();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (e.ctrlKey || e.metaKey) setVisible(true);
        };
        tdElement.addEventListener("click", handler);
        return () => tdElement.removeEventListener("click", handler);
    }, [tdElement]);

    return (
        <>
            {!visible ? (
                <InlineHint>
                    <div
                        style={{
                            cursor: "pointer",
                            width: "100%",
                            minHeight: "1.4em",
                            display: "block",
                        }}
                        onClick={(e) => {
                            if (e.ctrlKey || e.metaKey) setVisible(true);
                        }}
                    >
                        {htmlEmailParts ? (
                            <>
                                {htmlEmailParts.prefix && <Viewer initialValue={htmlEmailParts.prefix} />}
                                <iframe
                                    srcDoc={htmlEmailParts.html}
                                    style={{ width: "100%", minHeight: "500px", border: "1px solid #ccc", borderRadius: "4px", display: "block" }}
                                    sandbox="allow-same-origin"
                                    loading="lazy"
                                />
                            </>
                        ) : (
                            <Viewer initialValue={displayValue} />
                        )}
                    </div>
                </InlineHint>
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
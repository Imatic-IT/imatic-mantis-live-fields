import {Field} from "../types/types";
import {Editor} from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import {InlineHint} from "../components/InlineHint";
import {InlineLoader} from "../components/InlineLoader";
import {sendAjaxUpdate} from "../utils/ajaxUpdateField";
import React, {useState, useEffect, useRef} from "react";
import {MentionsToolbar} from "../components/MentionsToolbar";
import {getSelectOptionsNew, cloneCheckboxLabel, getUsersForMention} from "../utils/utils";

interface CustomChangeStatusProps {
    field: Field;
    tdElement: HTMLElement;
}

export const CustomChangeStatus: React.FC<CustomChangeStatusProps> = ({field, tdElement}) => {
    const initialValue = field.value ?? "";
    const [visible, setVisible] = useState(false);
    const [currentValue, setCurrentValue] = useState(tdElement.textContent);

    const [selectedStatus, setSelectedStatus] = useState(initialValue);
    const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]);
    const [privateNote, setPrivateNote] = useState(false);
    const editorRef = useRef<Editor>(null);
    const divRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);

    const [mentionUsers, setMentionUsers] = useState<{ key: string; value: string }[]>([]);

    const privateNoteLabelRef = useRef<HTMLLabelElement | null>(null);
    const tdRef = useRef<HTMLTableCellElement>(tdElement as HTMLTableCellElement);

    useEffect(() => {
        const opts = getSelectOptionsNew("new_status");
        setStatusOptions(opts);

        const clonedLabel = cloneCheckboxLabel('label[for="bugnote_add_view_status"]');
        if (clonedLabel) {
            privateNoteLabelRef.current = clonedLabel;

            const input = clonedLabel.querySelector<HTMLInputElement>('input[type="checkbox"]');
            if (input) setPrivateNote(input.checked);
        }

    }, []);


    useEffect(() => {
        if (!visible) return;
        setMentionUsers(getUsersForMention());
    }, [visible]);

    const handleSave = async (value: string, noteValue: string) => {
        setLoading(true);
        setVisible(false);

        try {
            const resp = await sendAjaxUpdate((data) => {
                data.append("field", field.field);
                data.append("type", field.type);
                data.append("value", value);
                data.append("bugnote", noteValue);
                data.append("bugnote_view_state", privateNote ? "50" : "10");
            });

            if (!resp.success) {
                throw new Error(resp.message);
            }

            setCurrentValue(
                statusOptions.find(s => s.value === value)?.label || value
            );
            setSelectedStatus(value);
            setVisible(false);
        } catch (e) {
            alert((e as Error).message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setVisible(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!tdRef.current) return;
            if (!tdRef.current.contains(event.target as Node)) {
                handleCancel();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [tdRef, handleCancel]);

    return (
        <>
            {/* VIEW stav */}
            {!visible && !loading && (
                <InlineHint>
                    <div
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            if (e.ctrlKey || e.metaKey) {
                                setVisible(true);
                            }
                        }}
                        style={{
                            cursor: "pointer",
                            width: "100%",
                            minHeight: "1.4em",
                            display: "block",
                        }}
                        ref={divRef}
                    >
                        <i className={`mx-3 fa fa-square fa-status-box status-${selectedStatus}-fg`}/>
                        {currentValue || "\u00A0"}
                    </div>
                </InlineHint>
            )}

            {/* LOADING stav */}
            {!visible && loading && (
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <InlineLoader/>
                </div>
            )}

            {/* EDIT stav */}
            {visible && (
                <div style={{width: 900}}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                        }}
                    >
                        <select
                            value={selectedStatus}
                            onChange={async (e) => {
                                const value = (e.target as HTMLSelectElement).value;
                                setSelectedStatus(value);
                                const noteValue =
                                    editorRef.current?.getInstance().getMarkdown() ?? '';
                                await handleSave(value, noteValue);
                            }}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <span
                            ref={(el) => {
                                if (!el || !privateNoteLabelRef.current) return;
                                if (!el.contains(privateNoteLabelRef.current)) {
                                    el.appendChild(privateNoteLabelRef.current);
                                }
                            }}
                        />
                    </div>

                    {/* Editor */}
                    <Editor
                        ref={editorRef}
                        initialEditType="markdown"
                        previewStyle="tab"
                        height="500px"
                        usageStatistics={false}
                    />

                    {/* Mentions */}
                    <MentionsToolbar
                        users={mentionUsers}
                        onInsert={(userKey) => {
                            const editor = editorRef.current?.getInstance();
                            if (!editor) return;

                            editor.replaceSelection(`@${userKey} `);
                            editor.focus();
                        }}
                    />

                </div>
            )}
        </>

    );
};

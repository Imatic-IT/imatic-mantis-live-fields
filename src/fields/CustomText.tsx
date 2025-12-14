import React, { useState, useRef, useEffect } from "react";
import { Field } from "../types/types";
import { sendAjaxUpdate } from "../utils/ajaxUpdateField";

interface CustomTextProps {
    field: Field;
    tdElement?: HTMLElement;
}

function stripIssuePrefix(summary: string): string {
    const match = summary.match(/^(\d+:)\s*/);
    return match ? summary.replace(match[0], '') : summary;
}

function getIssuePrefix(summary: string): string {
    const match = summary.match(/^(\d+:)\s*/);
    return match ? match[1] : '';
}

function addIssuePrefix(summary: string, prefix: string): string {
    return `${prefix} ${summary}`;
}

export const CustomText: React.FC<CustomTextProps> = ({ field, tdElement }) => {
    const initialValue = tdElement?.textContent?.trim() || "";
    const [visible, setVisible] = useState(false);
    const [currentValue, setCurrentValue] = useState(initialValue);
    const [editingValue, setEditingValue] = useState(
        field.field === "summary" ? stripIssuePrefix(initialValue) : initialValue
    );

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (visible) inputRef.current?.focus();
    }, [visible]);

    const handleSave = async () => {
        const valueToSave = editingValue;
        const response = await sendAjaxUpdate((formData) => {
            formData.append("field", field.field);
            formData.append("type", field.type);
            formData.append("value", valueToSave);
        });

        if (response.success) {
            let finalValue = valueToSave;

            if (field.field === "summary") {
                const prefix = getIssuePrefix(currentValue); 
                finalValue = addIssuePrefix(valueToSave, prefix);
            }

            setCurrentValue(finalValue);
        } else {
            alert(`Chyba pri ukladaní: ${response.message}`);
        }

        setVisible(false);
    };

    const handleCancel = () => {
        let cancelValue = editingValue;
        if (field.field === "summary") {
            const prefix = getIssuePrefix(currentValue);
            cancelValue = addIssuePrefix(stripIssuePrefix(currentValue), prefix);
        }

        setEditingValue(stripIssuePrefix(cancelValue));
        setVisible(false);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.ctrlKey || e.metaKey) {
            setEditingValue(
                field.field === "summary" ? stripIssuePrefix(currentValue) : currentValue
            );
            setVisible(true);
        }
    };

    return (
        <>
            {!visible ? (
                <div style={{ cursor: "pointer" }} onClick={handleClick}>
                    {currentValue || ""}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <input
                        type="text"
                        ref={inputRef}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        style={{ width: "100%" }}
                    />
                    <div style={{ display: "flex", gap: "4px" }}>
                        <button
                            className="btn btn-xs btn-success rounded"
                            title="Uložiť"
                            onClick={handleSave}
                        >
                            <i className="fa fa-check" />
                        </button>
                        <button
                            className="btn btn-xs btn-secondary rounded"
                            title="Zrušiť"
                            onClick={handleCancel}
                        >
                            <i className="fa fa-times" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

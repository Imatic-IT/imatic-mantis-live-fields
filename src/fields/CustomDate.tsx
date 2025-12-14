import React, { useState, useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Czech } from "flatpickr/dist/l10n/cs.js";
import { Field } from "../types/types";
import { Actions } from "../components/Actions";
import { sendAjaxUpdate } from "../utils/ajaxUpdateField";

interface CustomDateProps {
    field: Field;
    tdElement: HTMLElement;
}

export const CustomDate: React.FC<CustomDateProps> = ({ field, tdElement }) => {
    const initialValue = tdElement.textContent?.trim() || "–";

    const [currentValue, setCurrentValue] = useState(initialValue);
    const [editingValue, setEditingValue] = useState(initialValue);
    const [visible, setVisible] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const fpRef = useRef<flatpickr.Instance | null>(null);

    useEffect(() => {
        if (!visible || !inputRef.current) return;

        if (fpRef.current) {
            fpRef.current.destroy();
            fpRef.current = null;
        }

        field;
        fpRef.current = flatpickr(inputRef.current, {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            time_24hr: true,
            locale: Czech,
            defaultDate: editingValue !== "–" ? editingValue : undefined,
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    const d = selectedDates[0];
                    const formatted = d.toISOString().slice(0, 16).replace("T", " ");
                    setEditingValue(formatted);
                }
            },
        });

        return () => {
            if (fpRef.current) {
                fpRef.current.destroy();
                fpRef.current = null;
            }
        };
    }, [visible]);

    const handleSave = async () => {
        const response = await sendAjaxUpdate((formData) => {

            formData.append('value', editingValue || "");
            formData.append('field', field.field);
            formData.append('type', field.type);

            if (field.field_id) formData.append('custom_field_id', field.field_id.toString());
        });

        if (response.success) {
            setCurrentValue(editingValue || "–");
            setVisible(false);
        } else {
            alert(`Chyba pri ukladaní: ${response.message}`);
            setEditingValue(currentValue);
        }
    };

    const handleCancel = () => {
        setEditingValue(currentValue);
        setVisible(false);
    };

    return (
        <>
            {!visible ? (
                <div
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        if (e.ctrlKey || e.metaKey) {
                            setVisible(true);
                        }
                    }}
                    style={{ cursor: "pointer" }}
                >
                    {currentValue}
                </div>

            ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="datetimepicker input-sm"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        style={{ fontSize: "1rem", width: "160px", padding: "0.25rem 0.5rem" }}
                        autoFocus
                    />
                    <Actions onSave={handleSave} onCancel={handleCancel} />
                </div>
            )}
        </>
    );
};

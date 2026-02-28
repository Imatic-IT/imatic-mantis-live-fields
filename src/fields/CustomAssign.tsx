import React, {useEffect, useRef, useState} from "react";
import {Field} from "../types/types";
import {sendAjaxUpdate} from "../utils/ajaxUpdateField";
import {InlineLoader} from "../components/InlineLoader";
import { InlineHint } from "../components/InlineHint";

interface CustomAssignProps {
    field: Field;
    tdElement: HTMLElement;
}

export const CustomAssign: React.FC<CustomAssignProps> = ({field, tdElement}) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentValue, setCurrentValue] = useState<string>(tdElement.textContent!);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    const originalValue = useRef<string>(currentValue);

    useEffect(() => {

        if (!visible) return;

        const original = document.querySelector('select[name="handler_id"]') as HTMLSelectElement | null;
        if (!original) return;

        const clone = original.cloneNode(true) as HTMLSelectElement;
        clone.value = currentValue;
        clone.style.width = "100%";

        selectRef.current = clone;
        wrapperRef.current?.appendChild(clone);
        clone.focus();
        const onChange = async () => {
            setLoading(true);

            const value = clone.value;
            const label = clone.selectedOptions[0]?.textContent || value;

            clone.style.display = "none";

            const resp = await sendAjaxUpdate(data => {
                data.append("field", field.field);
                data.append("type", field.type);
                data.append("value", value);
            });

            setLoading(false);

            if (resp.success) {
                setCurrentValue(label);
                originalValue.current = label;
            } else {
                setCurrentValue(originalValue.current);
            }

            setVisible(false);
        };

        clone.addEventListener("change", onChange);

        return () => {
            clone.removeEventListener("change", onChange);
            wrapperRef.current?.removeChild(clone);
        };
    }, [visible, field, currentValue]);

    useEffect(() => {
        if (!visible) return;

        const onClickOutside = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setCurrentValue(originalValue.current);
                setVisible(false);
            }
        };

        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [visible]);

    return (
        <>
            {!visible && !loading && (
                <InlineHint>
                    <div
                        onClick={e => {
                            if (e.ctrlKey || e.metaKey) setVisible(true);
                        }}
                        style={{
                            cursor: "pointer",
                            width: "100%",
                            minHeight: "1.4em",
                            display: "block",
                        }}
                    >
                        {currentValue || "\u00A0"}
                    </div>
                </InlineHint>
            )}

            {visible && (
                <div ref={wrapperRef} style={{position: "relative"}}>
                    {loading && <InlineLoader/>}
                </div>
            )}
        </>
    );
};

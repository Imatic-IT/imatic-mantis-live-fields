import React, {useEffect, useRef, useState} from "react";
import {Field} from "../types/types";
import {sendAjaxUpdate} from "../utils/ajaxUpdateField";
import {InlineLoader} from "../components/InlineLoader";
import { InlineHint } from "../components/InlineHint";
import {getConfig} from "../utils/utils";

interface CustomPriorityProps {
    field: Field;
    tdElement: HTMLElement;
}

export const CustomPriority: React.FC<CustomPriorityProps> = ({field, tdElement}) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentValue, setCurrentValue] = useState<string>(tdElement.textContent!);
    const [priorities, setPriorities] = useState<{value: string; label: string}[]>([]);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    const originalValue = useRef<string>(currentValue);

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


    useEffect(() => {
        const config = getConfig();
        if (!config?.priorities) return;

        const mapped = Object.entries(config.priorities).map(
            ([value, label]) => ({ value, label: String(label) })
        );

        setPriorities(mapped);
    }, []);


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
                    <select
                        ref={selectRef}
                        value={currentValue}
                        onChange={async e => {
                            const value = e.target.value;
                            setLoading(true);

                            const resp = await sendAjaxUpdate(data => {
                                data.append("field", field.field);
                                data.append("type", field.type);
                                data.append("value", value);
                            });

                            setLoading(false);

                            if (resp.success) {
                                const label = priorities.find(p => p.value === value)?.label || '';
                                setCurrentValue(label);
                                originalValue.current = value;
                            } else {
                                const label = priorities.find(p => p.value === originalValue.current)?.label || '';
                                setCurrentValue(label);
                            }
                            setVisible(false);
                        }}
                    >
                        <option></option>
                        {priorities.map(p => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </>
    );
};

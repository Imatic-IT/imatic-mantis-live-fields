import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {Field, SelectOption} from "../types/types";
import {sendAjaxUpdate} from "../utils/ajaxUpdateField";
import {InlineLoader} from "../components/InlineLoader";
import {InlineHint} from "../components/InlineHint";

interface CustomSelectProps {
    field: Field;
    tdElement: HTMLElement;
}

/**
 * Generic inline editor for any enum / list field (priority, severity,
 * reproducibility, view state, projection, eta, category, ...).
 *
 * The selectable options and the current value are provided per-field from
 * PHP (`field.options`, `field.value`), so the component is not tied to a
 * single Mantis enum.
 */
export const CustomSelect: React.FC<CustomSelectProps> = ({field, tdElement}) => {
    const options: SelectOption[] = field.options ?? [];

    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [label, setLabel] = useState<string>(tdElement.textContent!.trim());
    const [selectedValue, setSelectedValue] = useState<string>(field.value != null ? String(field.value) : "");

    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    const lastValue = useRef<string>(selectedValue);
    const lastLabel = useRef<string>(label);

    useLayoutEffect(() => {
        if (!visible) return;
        (selectRef.current as any)?.showPicker?.();
    }, [visible]);

    useEffect(() => {
        if (!visible) return;

        const onClickOutside = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
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
                        {label || " "}
                    </div>
                </InlineHint>
            )}

            {visible && (
                <div ref={wrapperRef} style={{position: "relative"}}>
                    {loading && <InlineLoader/>}
                    <select
                        ref={selectRef}
                        value={selectedValue}
                        onChange={async e => {
                            const value = e.target.value;

                            // Ignore the empty placeholder — never clear a value here.
                            if (value === "") {
                                setVisible(false);
                                return;
                            }

                            setSelectedValue(value);
                            setLoading(true);

                            const resp = await sendAjaxUpdate(data => {
                                data.append("field", field.field);
                                data.append("type", field.type);
                                data.append("value", value);
                            });

                            setLoading(false);
                            setVisible(false);

                            if (resp.success) {
                                const newLabel = options.find(o => o.value === value)?.label ?? "";
                                setLabel(newLabel);
                                lastValue.current = value;
                                lastLabel.current = newLabel;
                            } else {
                                setSelectedValue(lastValue.current);
                                setLabel(lastLabel.current);
                            }
                        }}
                    >
                        <option value=""></option>
                        {options.map(o => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </>
    );
};

import {showEditIcon} from "../utils/utils";
import {getConfig} from "../utils/utils";
import {setupInlineDateField} from "../fields/dateField"
import {Field} from '../types/types'
import {setupInlineTextareaField} from "../fields/textArea";

function applyInlineEditComponent(
    cell: HTMLElement,
    field: Field,
) {

    if (field.type === 'date') {
        const {title} = field;
        const th = cell.closest('tr')?.querySelector('th.bug-custom-field.category');
        const label = th?.textContent?.trim().toLowerCase();

        if (field.field === 'bug-custom-field' && label !== title?.toLowerCase()) return;

        const editIcon = showEditIcon(cell);
        setupInlineDateField(editIcon, field);

    } else if (field.type === 'textarea') {
        const editIcon = showEditIcon(cell);
        setupInlineTextareaField(editIcon, field);
    }
}

function getCells(selector: string) {
    return document.querySelectorAll<HTMLElement>(selector);
}

export function initInlineFields() {
    const config = getConfig();

    if (!config || !config.fields) {
        console.warn('Inline edit config not found or empty');
        return;
    }

    for (const key in config.fields) {
        const fieldConfig = config.fields[key];

        if (Array.isArray(fieldConfig)) {

            for (const field of fieldConfig) {
                const selector = `td.${field.field}`;
                const cells = getCells(selector);

                cells.forEach(cell => {

                    if (cell.querySelector("p")) {
                        const p = cell.querySelector("p")!;
                        p.style.display = "inline-block";
                        p.style.margin = "0 0 0 6px";
                    }
                    applyInlineEditComponent(cell, field)

                });
            }
        } else {
            const field = config.fields[key];
            const selector = `td.${key}`;
            const cells = getCells(selector);

            cells.forEach(cell => {
                if (cell.querySelector("p")) {
                    const p = cell.querySelector("p")!;
                    p.style.display = "inline-block";
                    p.style.margin = "0 0 0 6px";
                }

                applyInlineEditComponent(cell, field)
            });
        }
    }
}


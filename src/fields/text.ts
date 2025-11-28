import {Field} from '../types/types';
import {hover} from '../utils/utils';
import {ajaxUpdateField} from "../utils/ajaxUpdateField";

function stripIssuePrefix(summary: string): string {
    const match = summary.match(/^(\d+:)\s*/);
    return match ? summary.replace(match[0], '') : summary;
}

function addIssuePrefix(summary: string, prefix: string): string {
    return `${prefix} ${summary}`;
}

export function setupInlineTextField(td: HTMLElement, field: Field) {
    hover(td);

    const fullValue = td.textContent?.trim() || '';
    const match = fullValue.match(/^(\d+:)\s*/);
    td.dataset.issuePrefix = match ? match[1] : '';

    td.addEventListener('click', () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;

        if (td.querySelector('input')) return;

        let currentValue = td.textContent?.trim() || '';

        let editableText = currentValue;
        if (field.field === 'summary') {
            editableText = stripIssuePrefix(currentValue);
        }

        td.innerHTML = `
            <input type="text" style="width: 100%;" value="${editableText}" />
            <div style="margin-top: 4px;">
                <button class="inline-save btn btn-xs btn-success rounded" title="Uložiť">
                    <i class="fa fa-check"></i>
                </button>
                <button class="inline-cancel btn btn-xs btn-secondary rounded" title="Zrušiť">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        `;

        const input = td.querySelector('input') as HTMLInputElement;
        const saveBtn = td.querySelector('.inline-save') as HTMLButtonElement;
        const cancelBtn = td.querySelector('.inline-cancel') as HTMLButtonElement;

        input.focus();

        saveBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            let  value = input.value;

            const response = await ajaxUpdateField(field, value);

            if (field.field === 'summary' && td.dataset.issuePrefix) {
                value = addIssuePrefix(value, td.dataset.issuePrefix);
            }

            if (response.success) {
                td.textContent = value;
                td.classList.add('inline-feedback-success');
                setTimeout(() => td.classList.remove('inline-feedback-success'), 1000);
            } else {
                td.classList.add('inline-feedback-error');
                setTimeout(() => td.classList.remove('inline-feedback-error'), 1000);
                td.textContent = currentValue;
            }
        });

        cancelBtn.addEventListener('click', (event) => {
            event.stopPropagation();

            let cancelValue = currentValue;
            if (field.field === 'summary' && td.dataset.issuePrefix) {
                cancelValue = addIssuePrefix(stripIssuePrefix(currentValue), td.dataset.issuePrefix);
            }

            td.textContent = cancelValue;
        });
    });
}

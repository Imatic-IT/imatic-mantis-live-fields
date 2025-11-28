import {Field} from '../types/types';
import {ajaxUpdateField} from "../utils/ajaxUpdateField";

function hover(td: HTMLElement) {
    td.addEventListener('mouseenter', () => {
        td.style.backgroundColor = '#f0f8ff';
    });
    td.addEventListener('mouseleave', () => {
        td.style.backgroundColor = '';
    });
}

export function setupInlineTextareaField(
    td: HTMLElement,
    field: Field
) {

    hover(td);

    td.addEventListener('click', () => {

        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return;
        }

        if (td.querySelector('textarea')) return;

        const currentValue = td.textContent?.trim() || '';

        td.innerHTML = `
            <textarea style="width: 100%; resize: both;" rows="4">${currentValue}</textarea>
            <div style="margin-top: 4px;">
                <button class="inline-save btn btn-xs btn-success rounded" title="Uložiť">
                    <i class="fa fa-check"></i>
                </button>
                <button class="inline-cancel btn btn-xs btn-secondary rounded" title="Zrušiť">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        `;

        const textarea = td.querySelector('textarea') as HTMLTextAreaElement;
        const saveBtn = td.querySelector('.inline-save') as HTMLButtonElement;
        const cancelBtn = td.querySelector('.inline-cancel') as HTMLButtonElement;

        textarea.focus();

        saveBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            const value = textarea.value;

            const response = await ajaxUpdateField(field, value);

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
            td.textContent = currentValue;
        });

        textarea.focus();
    });
}

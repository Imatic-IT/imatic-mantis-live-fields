import {initDatepicker} from "../utils/datepicker";
import {ajaxUpdateField} from "../utils/ajaxUpdateField";
import {Field} from '../types/types'

function toggleDueLevel(td: HTMLElement, level: number | string) {
    td.classList.remove(`due-false`);
    for (let i = 0; i < 3; i++) {
        td.classList.remove(`due-${i}`);
    }
    td.classList.add(`due-${level}`);
}

export function setupInlineDateField(
    editIcon: HTMLSpanElement,
    field: Field,
) {
    const td = editIcon.parentElement as HTMLElement;
    editIcon.addEventListener('click', () => {

        if (td.querySelector('input')) return;

        const currentValue = td.textContent?.trim() || '';

        td.innerHTML = `
            <input tabindex="4" type="text" class="datetimepicker input-sm"
                data-picker-locale="cs" data-picker-format="Y-MM-DD HH:mm"
                size="16" maxlength="16" value="${currentValue}" />

            <button class="inline-save btn btn-xs btn-success rounded" title="Uložiť">
                <i class="fa fa-check"></i>
            </button>

            <button class="inline-cancel btn btn-xs btn-secondary rounded" title="Zrušiť">
                <i class="fa fa-times"></i>
            </button>
        `;


        const input = td.querySelector('input') as HTMLInputElement;
        const saveBtn = td.querySelector('.inline-save') as HTMLButtonElement;
        const cancelBtn = td.querySelector('.inline-cancel') as HTMLButtonElement;

        initDatepicker(input);

        saveBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            const value = input.value;

            const response = await ajaxUpdateField(
                field,
                value,
            );

            if (response.success) {
                td.textContent = value;
                td.prepend(editIcon);

                td.classList.add('inline-feedback-success');
                setTimeout(() => {
                    td.classList.remove('inline-feedback-success');

                    toggleDueLevel(td, response.overdue_level!);
                }, 1000);

            } else {
                td.classList.add('inline-feedback-error');
                setTimeout(() => td.classList.remove('inline-feedback-error'), 1000);

                td.textContent = currentValue;
                td.prepend(editIcon);
            }
        });

        cancelBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            td.textContent = currentValue;
            td.prepend(editIcon);
        });

        input.focus();
    });
}

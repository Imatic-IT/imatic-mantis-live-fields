export function getConfig() {
    const scriptTag = document.getElementById('imatic-inline-edit');
    if (!scriptTag) return;

    return JSON.parse(scriptTag.dataset.inlineConfig || '{}');
}

export function getBugIdFromUrl(): number | null {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id ? parseInt(id) : null;
}

export function hover(td: HTMLElement) {
    td.addEventListener('mouseenter', () => {
        td.style.backgroundColor = '#f0f8ff';
    });
    td.addEventListener('mouseleave', () => {
        td.style.backgroundColor = '';
    });
}

export function cloneCheckboxLabel(selector: string): HTMLLabelElement | null {
    const original = document.querySelector<HTMLLabelElement>(selector);
    if (!original) return null;

    const clone = original.cloneNode(true) as HTMLLabelElement;

    const input = clone.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (input) {
        const newId = `${input.id}_imatic_live_field`;
        input.id = newId;
        clone.setAttribute('for', newId);
    }

    clone.style.marginLeft = '10px';

    return clone;
}

export function getSelectOptionsNew(name: string) {
    const select = document.querySelector(`select[name="${name}"]`) as HTMLSelectElement | null;
    if (!select) return [];

    select.querySelectorAll('option[selected]').forEach(opt =>
        opt.removeAttribute('selected')
    );

    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = "";
    select.insertBefore(emptyOpt, select.firstChild);

    return Array.from(select.options).map(opt => ({
        value: opt.value,
        label: opt.textContent || opt.value
    }));
}

export const getUsersForMention = () => {
    const blocked = ["[Myself]", "[Reporter]", "[Já sám]", "[Reportér]", ""];
    const selects = document.querySelectorAll<HTMLSelectElement>('select[name="handler_id"]');

    return Array.from(selects).flatMap(select =>
        Array.from(select.options)
            .map(o => ({
                key: o.textContent?.replace(/^[^\w\[]+\s*/, '') || '',
                value: o.textContent || ''
            }))
            .filter(u => !blocked.includes(u.key))
    );
};

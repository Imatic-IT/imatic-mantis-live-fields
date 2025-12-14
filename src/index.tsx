import {createRoot} from 'react-dom/client';
import {getConfig} from './utils/utils';
import {InlineField} from './components/InlineField';

document.addEventListener('DOMContentLoaded', () => {

    const config = getConfig();

    for (const key in config.fields) {
        const fieldConfig = config.fields[key];
        const elements = document.querySelectorAll(`td.${key}`);

        elements.forEach(el => {
            if (!(el instanceof HTMLElement)) return;

            const fieldsArray = Array.isArray(fieldConfig) ? fieldConfig : [fieldConfig];

            const filtered = fieldsArray.filter(f => {
                if (f.field !== 'bug-custom-field') return true;

                const th = el.closest('tr')?.querySelector('th.bug-custom-field.category');
                if (!th) return false;

                const label = th.textContent?.trim().toLowerCase();
                const title = f.title?.toLowerCase();

                return label === title;
            });

            if (filtered.length === 0) return;

            const root = createRoot(el);
            root.render(<InlineField field={filtered} tdElement={el} />);
        });
    }
})
;

import { getConfig, getBugIdFromUrl } from "./utils";
import { Field } from '../types/types'

interface AjaxUpdateResponse {
    success: boolean;
    message?: string;
    value?: string;
    overdue_level?: string | number;
}

export async function sendAjaxUpdate(
    setDataFn: (data: FormData) => void
): Promise<AjaxUpdateResponse> {
    const config = getConfig();

    if (!config || !config.ajaxUpdatePage) {
        console.error('AJAX update page URL not found in config');
        return { success: false, message: 'AJAX update page URL not configured' };
    }

    const ajaxUpdatePage = config.ajaxUpdatePage;

    const data = new FormData();
    setDataFn(data);

    const bugId: number | null = getBugIdFromUrl();

    if (bugId) {
        data.append('bug_id', bugId.toString());
    }

    try {
        const response = await fetch(ajaxUpdatePage, {
            method: 'POST',
            body: data,
            credentials: 'same-origin',
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const json = await response.json() as AjaxUpdateResponse;

        if (!json.success) {
            console.error('Update failed:', json.message);
        }

        return json;

    } catch (error) {
        console.error('AJAX update error:', error);
        return { success: false, message: String(error) };
    }
}

export async function ajaxUpdateField(
    field: Field,
    value?: string | null,
    bugnote?: string | null
): Promise<AjaxUpdateResponse> {
    const config = getConfig();

    if (!config || !config.ajaxUpdatePage) {
        console.error('AJAX update page URL not found in config');
        return { success: false, message: 'AJAX update page URL not configured' };
    }

    const ajaxUpdatePage = config.ajaxUpdatePage;

    const data = new FormData();
    data.append('field', field.field);
    data.append('type', field.type);
    data.append('value', value ?? '');
    data.append('bugnote', bugnote ?? '');

    if (field.field_id) data.append('custom_field_id', field.field_id.toString());

    const bugId: number | null = getBugIdFromUrl();

    if (bugId) {
        data.append('bug_id', bugId.toString());
    }

    try {
        const response = await fetch(ajaxUpdatePage, {
            method: 'POST',
            body: data,
            credentials: 'same-origin',
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const json = await response.json() as AjaxUpdateResponse;

        if (!json.success) {
            console.error('Update failed:', json.message);
        }

        return json;
    } catch (error) {
        console.error('AJAX update error:', error);
        return { success: false, message: String(error) };
    }
}

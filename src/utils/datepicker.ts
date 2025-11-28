import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Czech } from "flatpickr/dist/l10n/cs.js";

export function initDatepicker(input: HTMLInputElement) {
    flatpickr(input, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        locale: Czech
    });
}

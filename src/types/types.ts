export type SelectOption = {
    value: string;
    label: string;
};

export type Field = {
    field: string;
    type: string;
    value?: string;
    label?: string;
    title?: string;
    field_id?: number;
    options?: SelectOption[];
}

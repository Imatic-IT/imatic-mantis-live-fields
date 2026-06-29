import React, { Suspense, lazy } from 'react';
import { Field } from '../types/types';
import { CustomAssign } from '../fields/CustomAssign';
import { CustomSelect } from '../fields/CustomSelect';
import { CustomText } from '../fields/CustomText';
import { InlineLoader } from './InlineLoader';

// Heavy editors (toast-ui markdown editor, flatpickr) are split into separate
// chunks and only downloaded once the user actually activates such a field.
const CustomDate = lazy(() =>
    import('../fields/CustomDate').then(m => ({ default: m.CustomDate })));
const CustomTextarea = lazy(() =>
    import('../fields/CustomTextarea').then(m => ({ default: m.CustomTextarea })));
const CustomChangeStatus = lazy(() =>
    import('../fields/CustomChangeStatus').then(m => ({ default: m.CustomChangeStatus })));

enum FieldType {
    DATE = 'date',
    TEXTAREA = 'textarea',
    TEXT = 'text',
    SELECT = 'select',
    BUG_UPDATE_TYPE_ASSIGN = 'assign',
    BUG_UPDATE_TYPE_CHANGE_STATUS = 'change_status'
}
export const InlineField: React.FC<{ field: Field | Field[], tdElement: HTMLElement }> = ({ field, tdElement }) => {

    const fields = Array.isArray(field) ? field : [field];

    return (
        <div className="inline-fields-wrapper">
            <Suspense fallback={<InlineLoader />}>
                {fields.map((f, i) => {
                    switch (f.type) {
                        case FieldType.DATE:
                            return <CustomDate field={f} tdElement={tdElement} key={i} />;
                        case FieldType.TEXT:
                            return <CustomText field={f} tdElement={tdElement} key={i} />;
                        case FieldType.TEXTAREA:
                            return <CustomTextarea field={f} key={i} tdElement={tdElement} />;
                        case FieldType.BUG_UPDATE_TYPE_CHANGE_STATUS:
                            return <CustomChangeStatus field={f} tdElement={tdElement} key={i} />;
                        case FieldType.BUG_UPDATE_TYPE_ASSIGN:
                            return <CustomAssign field={f} tdElement={tdElement} key={i} />;
                        case FieldType.SELECT:
                            return <CustomSelect field={f} tdElement={tdElement} key={i}/>;
                        default:
                            return null;
                    }
                })}
            </Suspense>
        </div>
    );
};


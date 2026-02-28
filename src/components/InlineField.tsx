import React from 'react';
import { Field } from '../types/types';
import { CustomDate } from "../fields/CustomDate";
import { CustomTextarea } from "../fields/CustomTextarea";
import { CustomChangeStatus } from "../fields/CustomChangeStatus"
import { CustomAssign } from '../fields/CustomAssign';
import { CustomPriority } from '../fields/CustomPriority';
import { CustomText } from '../fields/CustomText';

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
                        return <CustomPriority field={f} tdElement={tdElement} key={i}/>;
                    default:
                        return null;
                }
            })}
        </div>
    );
};


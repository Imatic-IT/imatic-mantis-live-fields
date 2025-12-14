import React from 'react';

interface ActionsProps {
    onSave: () => void;
    onCancel: () => void;
}

export const Actions: React.FC<ActionsProps> = ({onSave, onCancel}) => {
    return (
        <div style={{marginTop: 4}}>
            <button
                style={{marginRight: 4}}
                className="inline-save btn btn-xs btn-success rounded"
                title="Uložiť"
                onClick={onSave}
            >
                <i className="fa fa-check"></i>
            </button>

            <button
                className="inline-cancel btn btn-xs btn-secondary rounded"
                title="Zrušiť"
                onClick={onCancel}
            >
                <i className="fa fa-times"></i>
            </button>
        </div>
    )
};

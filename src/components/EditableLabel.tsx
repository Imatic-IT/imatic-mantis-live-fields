interface EditableLabelProps {
    value: string;
    onClick: () => void;
}

export const EditableLabel: React.FC<EditableLabelProps> = ({ value, onClick }) => (
    <span onClick={onClick} style={{ cursor: "pointer" }}>
    <i className="fa fa-pencil ms-1"></i> {value || "–"}
  </span>
);

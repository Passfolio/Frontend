import { useState, type KeyboardEvent } from 'react';

type EditableFieldProps = {
    value: string;
    onSave: (nextValue: string) => void;
    wrapperClassName: string;
    textClassName: string;
    inputClassName: string;
};

export const EditableField = ({
                                  value,
                                  onSave,
                                  wrapperClassName,
                                  textClassName,
                                  inputClassName,
                              }: EditableFieldProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draftValue, setDraftValue] = useState(value);

    const commitValue = () => {
        const trimmedValue = draftValue.trim();
        if (trimmedValue.length > 0) {
            onSave(trimmedValue);
            setDraftValue(trimmedValue);
        } else {
            setDraftValue(value);
        }
        setIsEditing(false);
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            commitValue();
        }
        if (event.key === 'Escape') {
            setDraftValue(value);
            setIsEditing(false);
        }
    };

    return (
        <div className={wrapperClassName}>
            {isEditing ? (
                        <input
                            autoFocus
                    className={inputClassName}
                value={draftValue}
                onBlur={commitValue}
                onChange={(event) => setDraftValue(event.target.value)}
    onKeyDown={handleInputKeyDown}
    />
) : (
        <button type="button" className={textClassName} onClick={() => setIsEditing(true)}>
    {value}
    </button>
)}
    </div>
);
};
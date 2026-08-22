import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { usePageEdit } from '../../context/PageEditContext';

const EditableSection = ({ id, label, children }) => {
    const { isEditMode, selectedSectionId, setSelectedSectionId } = usePageEdit();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    if (!isEditMode) return <>{children}</>;

    const isSelected = selectedSectionId === id;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => { e.stopPropagation(); setSelectedSectionId(id); }}
            className={`relative rounded-2xl transition-all duration-150 group
                ${isSelected
                    ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-100'
                    : 'ring-1 ring-dashed ring-orange-300 hover:ring-orange-400'}
            `}
        >
            {/* Drag handle + label */}
            <div
                className={`absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-t-lg text-xs font-semibold select-none z-20
                    ${isSelected ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 opacity-0 group-hover:opacity-100'}
                    transition-opacity duration-150`}
            >
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing touch-none"
                    onClick={e => e.stopPropagation()}
                    title="Drag to reorder"
                >
                    <GripVertical className="w-3.5 h-3.5" />
                </button>
                {label}
            </div>

            {/* Section content */}
            <div className="pointer-events-none select-none">
                {children}
            </div>
        </div>
    );
};

export default EditableSection;

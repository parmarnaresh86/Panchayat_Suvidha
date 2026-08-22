import { Edit3, Save, X, Loader2, GripVertical, CheckCircle2, LogOut } from 'lucide-react';
import { usePageEdit } from '../../context/PageEditContext';

const LivePageEditor = ({ pageName, defaultSections }) => {
    const { isEditMode, isAdmin, dirty, saving, enterEditMode, exitEditMode, saveChanges } = usePageEdit();

    if (!isAdmin) return null;

    if (!isEditMode) {
        return (
            <button
                onClick={() => enterEditMode(pageName, defaultSections)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg shadow-orange-200 transition-all duration-200 font-semibold text-sm"
            >
                <Edit3 className="w-4 h-4" />
                Edit Page
            </button>
        );
    }

    const handleSaveAndExit = async () => {
        await saveChanges();
        exitEditMode();
    };

    return (
        <>
            {/* Top edit-mode bar */}
            <div className="fixed top-16 left-0 right-72 z-50 bg-gray-900 text-white flex items-center justify-between px-5 py-2.5 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                        <span className="text-sm font-semibold">Edit Mode</span>
                    </div>
                    <span className="text-gray-500 text-xs hidden sm:block">
                        Drag sections to reorder · Click a section to edit its content
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <GripVertical className="w-3 h-3" />
                        <span className="hidden sm:block">Drag handle appears on hover</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    {saving && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                        </span>
                    )}
                    {!saving && dirty && (
                        <span className="text-xs text-yellow-400 font-medium">● Unsaved changes</span>
                    )}
                    {!saving && !dirty && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> All saved
                        </span>
                    )}

                    {/* Save — stays in edit mode */}
                    <button
                        onClick={saveChanges}
                        disabled={saving || !dirty}
                        title="Save changes and keep editing"
                        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Save
                    </button>

                    {/* Save & Exit */}
                    <button
                        onClick={handleSaveAndExit}
                        disabled={saving}
                        title="Save changes and exit edit mode"
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Save & Exit
                    </button>

                    {/* Exit without saving */}
                    <button
                        onClick={exitEditMode}
                        title="Exit without saving"
                        className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                        Exit
                    </button>
                </div>
            </div>

            {/* Spacer so content doesn't hide under the bar */}
            <div className="h-10" />
        </>
    );
};

export default LivePageEditor;

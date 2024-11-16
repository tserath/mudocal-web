// src/components/sidebar/FileList.jsx
import React, { useState } from 'react';
import { Edit2, Trash, ExternalLink } from 'lucide-react';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import ConfirmationDialog from '../shared/ConfirmationDialog';

const FileList = ({ date, entries, onOpenEntry, onRenameEntry, onDeleteEntry }) => {
    const [contextMenu, setContextMenu] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Filter entries for the selected date
    const filteredEntries = Array.from(entries.entries()).filter(([_, entry]) => {
        const entryDate = new Date(entry.created);
        return entryDate.toDateString() === date.toDateString();
    }).map(([_, entry]) => entry);

    return (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">Files for {date.toDateString()}</h3>
            <div className="mt-2 space-y-2">
                {filteredEntries.length === 0 ? (
                    <div className="bg-secondary dark:bg-secondary-dark p-2 rounded">
                        <p className="text-text-muted dark:text-text-muted-dark">No files for this date</p>
                    </div>
                ) : (
                    filteredEntries.map(entry => (
                        <div 
                            key={entry.id}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setContextMenu({
                                    x: e.pageX,
                                    y: e.pageY,
                                    entry
                                });
                            }}
                            className="bg-primary dark:bg-primary-dark p-2 rounded cursor-pointer 
                                     hover:bg-secondary dark:hover:bg-secondary-dark
                                     border border-border dark:border-border-dark
                                     transition-smooth"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenEntry(entry);
                            }}
                        >
                            <div className="font-medium">{entry.title || 'Untitled'}</div>
                            <div className="text-sm text-text-muted dark:text-text-muted-dark">
                                Modified: {new Date(entry.modified).toLocaleString()}
                            </div>
                            {entry.tags?.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {entry.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full
                                            bg-accent/10 dark:bg-accent-dark/10
                                            text-accent dark:text-text-dark">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}>
                    <ContextMenuItem 
                        icon={ExternalLink}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenEntry(contextMenu.entry);
                            setContextMenu(null);
                        }}
                    >Open</ContextMenuItem>
                    <ContextMenuItem 
                        icon={Edit2}
                        onClick={(e) => {
                            e.stopPropagation();
                            const newTitle = prompt('Enter new name:', contextMenu.entry.title);
                            if (newTitle && newTitle !== contextMenu.entry.title) {
                                onRenameEntry(contextMenu.entry.id, newTitle);
                            }
                            setContextMenu(null);
                        }}
                    >Rename</ContextMenuItem>
                    <ContextMenuItem 
                        icon={Trash}
                        variant="danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(contextMenu.entry);
                            setContextMenu(null);
                        }}
                    >Delete</ContextMenuItem>
                </ContextMenu>
            )}

            <ConfirmationDialog
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => {
                    onDeleteEntry(showDeleteConfirm.id);
                    setShowDeleteConfirm(null);
                }}
                title="Confirm Delete"
                message={`Are you sure you want to delete "${showDeleteConfirm?.title || 'Untitled'}"?`}
                variant="danger"
            />
        </div>
    );
};

export default FileList;
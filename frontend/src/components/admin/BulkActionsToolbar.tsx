// components/admin/BulkActionsToolbar.tsx
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ban, Trash2, Download, Mail, X, CheckSquare, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSuspend: () => void;
  onDelete: () => void;
  onExport: () => void;
  isSuspending?: boolean;
  isDeleting?: boolean;
}

export const BulkActionsToolbar = ({
  selectedCount,
  onClearSelection,
  onSuspend,
  onDelete,
  onExport,
  isSuspending,
  isDeleting,
}: BulkActionsToolbarProps) => {
  const [actionType, setActionType] = useState<'suspend' | 'delete' | null>(null);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="bg-foreground text-background rounded-xl shadow-2xl p-2 flex items-center justify-between gap-4 border border-border/20">
          <div className="flex items-center gap-3 pl-2">
            <div className="bg-primary text-primary-foreground font-bold h-8 w-8 rounded-lg flex items-center justify-center text-sm">
              {selectedCount}
            </div>
            <span className="font-medium text-sm hidden sm:inline">Selected</span>
            <div className="h-4 w-px bg-background/20 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-background/70 hover:text-background hover:bg-background/10 h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
              className="h-9 bg-background/10 hover:bg-background/20 text-background border-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-9 bg-background text-foreground hover:bg-background/90">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setActionType('suspend')}>
                  <Ban className="h-4 w-4 mr-2 text-orange-500" />
                  Suspend Selected
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setActionType('delete')}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'suspend' ? 'Suspend Users?' : 'Delete Users?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to {actionType} <strong>{selectedCount} users</strong>.
              {actionType === 'delete' 
                ? ' This action cannot be undone and will permanently remove their data.'
                : ' They will lose access to the platform until unsuspended.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionType === 'suspend') onSuspend();
                if (actionType === 'delete') onDelete();
                setActionType(null);
              }}
              className={actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : 'bg-orange-500 hover:bg-orange-600'}
            >
              {(isSuspending || isDeleting) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Confirm ${actionType === 'suspend' ? 'Suspend' : 'Delete'}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

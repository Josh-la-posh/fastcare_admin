import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  entityName: string;
  isActive: boolean;
  loading: boolean;
  onConfirm: () => void;
};

export default function StatusConfirmation({
  open,
  setOpen,
  entityName,
  isActive,
  loading,
  onConfirm,
}: Props) {
  const action = isActive ? 'Deactivate' : 'Activate';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{action} {entityName}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Are you sure you want to {action.toLowerCase()} this {entityName.toLowerCase()}?
        </p>
        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            No, cancel
          </Button>
          <Button
            variant={isActive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? `${action}...` : `Yes, ${action}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

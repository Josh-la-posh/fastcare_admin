import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import success from '/svg/success.png';
import { X } from "lucide-react";



type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  title?: string;
  onClose?: () => void; // optional callback when modal closes
};

export default function Success({ open, setOpen, text, title, onClose }: Props) {
 

  // handle closing modal
  const handleClose = () => {
    setOpen(false);

    // Call optional callback for refetch or other actions
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col gap-3">
        <VisuallyHidden>
          <DialogTitle>{title || 'Success'}</DialogTitle>
        </VisuallyHidden>
        <DialogHeader className="flex items-end justify-end gap-4">
          <button
            onClick={handleClose}
            type="button"
            className="border border-gray-600 rounded-full "
          >
            <X className="text-neutral-600 hover:text-neutral-600" />
          </button>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-12">
          <img src={success} />
          <h1 className="text-center text-xl text-green-500 font-[500]">
            {title || 'Congratulations!'}
          </h1>
          <p className="text-md text-center text-[#15322d] font-[400] w-80">
            {text}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

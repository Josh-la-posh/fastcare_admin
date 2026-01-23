
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import deactivate from '/svg/deactivate.svg';

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";


type Props = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    text: string;
};



export default function Deactivate({ open, setOpen, text }: Props) {


    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="flex flex-col gap-3 py-10">
            <VisuallyHidden>
              <DialogTitle>Deactivate Confirmation</DialogTitle>
            </VisuallyHidden>
            <DialogHeader className="flex items-end justify-end gap-4">
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="border border-gray-600 rounded-full "
              >
                <X className="text-neutral-600  hover:text-neutral-600" />
              </button>
            </DialogHeader>

            <div className="flex flex-col items-center gap-5 py-6  ">
              <img src={deactivate} />
              <h1 className="text-center text-xl text-[#15322d] font-[500] ">
                 Oh wait
              </h1>
              <p className="text-md text-center font-medium text-[#15322d] w-96">
                {text}
              </p>
            </div>

            <DialogFooter className=" flex items-center justify-between">
              <Button className="py-3" variant="link" onClick={() => setOpen(false)}>
                No, cancel
              </Button>
              <Button  className="py-3" variant="destructive" >
                Yes, deactivate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
}

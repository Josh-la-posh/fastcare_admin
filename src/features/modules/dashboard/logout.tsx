import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { X } from "lucide-react";

import { logout } from "@/services/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/services/store";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LogOut({ open, setOpen }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); 
    setOpen(false);
    navigate("/"); 
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col gap-6">
        <VisuallyHidden>
          <DialogTitle>Log out</DialogTitle>
        </VisuallyHidden>
        <DialogHeader className="flex items-end justify-end gap-4">
          <button
            onClick={() => setOpen(false)}
            type="button"
            className="border border-gray-600 rounded-full"
          >
            <X className="text-neutral-600 hover:text-neutral-600" />
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-8 mt-8">
          <h1 className="text-center text-xl font-semibold text-gray-700">
            Log out
          </h1>
          <p className="text-lg text-[#15322d] font-[500]">
            Logging out now will require you to input your email and password in
            your next sign in. Do you wish to continue?
          </p>
        </div>

        <DialogFooter className="mt-24 flex items-center justify-between gap-6">
          <Button className="py-3" variant="link" onClick={() => setOpen(false)}>
            No, cancel
          </Button>
          <Button className="py-3" variant="destructive" onClick={handleLogout}>
            Yes, log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import {X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import Success from '../../../features/modules/dashboard/success';
import { createRole } from '@/services/thunks';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store';

export default function NewRole() {
  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

  const [role, setRole] = useState("");

  const handleSubmit = async () => {
     try {
          await dispatch(createRole({ role })).unwrap();
          setOpenSuccess(true);
          setOpen(false);
          setRole("");
        } catch (error) {
          console.error("Failed to create admin:", error);
        }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="py-3 w-36 rounded-md">Create new role</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b">
            <span className="text-gray-800 text-2xl font-normal py-3">
              New role
            </span>

            <button
              onClick={() => setOpen(false)}
              type="button"
              className="p-1 border border-gray-300 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-primary" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-scroll">
          <div>
            <div className="grid grid-cols-1 gap-2 mt-6">
              <div>
                <label className="text-gray-800">Role name</label>
                <input 
                   value={role}
                  onChange={(e) => setRole(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none" />
              </div>

              {/* <div>
                <label className="text-gray-800">Role Permission</label>
                <textarea rows={6} className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none" />
              </div> */}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 mt-8">
          <Button onClick={handleSubmit} className="py-3 w-48 rounded-md">
             Submit
          </Button>
        </div>
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text="You've successfully added a new role."
      />
    </Dialog>
  );
}

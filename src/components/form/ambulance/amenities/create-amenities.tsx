import { X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';

import {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Success from '../../../../features/modules/dashboard/success';
import { AppDispatch, RootState } from '@/services/store';
import { createAmenity } from '@/services/thunks';


export default function CreateAmenities() {
  const dispatch = useDispatch<AppDispatch>();
  const { createLoading } = useSelector((state: RootState) => state.amenities);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Equipment name is required');
      return;
    }

    const result = await dispatch(
      createAmenity({
        name: name.trim(),
        description: description.trim(),
      })
    );

    if (createAmenity.fulfilled.match(result)) {
      setOpen(false);
      setOpenSuccess(true);
      setName('');
      setDescription('');
      return;
    }

    toast.error((result.payload as string) || 'Failed to create amenity');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="py-3 w-36 rounded-md">Create Amenities</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-xl font-normal py-3">
              Create Amenities
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

        <div className="overflow-scroll  ">
          <div>
            <div className="mt-4">
              <div>
                <label className="text-gray-800">Equipment Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border-gray-300 border  rounded-lg px-3 py-3 mt-1 outline-none"
                />
              </div>
              <div className="mt-4">
                <label className="text-gray-800">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none min-h-[120px]"
                />
              </div>   
            </div>  
          </div>
        </div>

       
          <Button onClick={handleSubmit} className="py-3 w-full rounded-md mt-5" disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Add'}
          </Button>
      
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text="You've successfully added a new equipment"
      />
    </Dialog>
  );
}

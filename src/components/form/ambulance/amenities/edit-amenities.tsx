import { EditIcon, X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Success from '../../../../features/modules/dashboard/success';
import { AppDispatch, RootState } from '@/services/store';
import { updateAmenity } from '@/services/thunks';
import { Amenity } from '@/types';


type Props = {
  data?: Amenity;
};

export default function EditAmenities({ data }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { updateLoading } = useSelector((state: RootState) => state.amenities);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setName(data?.name ?? data?.equipmentName ?? '');
      setDescription(data?.description ?? '');
    }
  }, [open, data]);

  const handleSubmit = async () => {
    if (!data?.id) {
      toast.error('Amenity id is missing');
      return;
    }
    if (!name.trim()) {
      toast.error('Equipment name is required');
      return;
    }

    const result = await dispatch(
      updateAmenity({
        id: data.id,
        name: name.trim(),
        description: description.trim(),
      })
    );

    if (updateAmenity.fulfilled.match(result)) {
      setOpen(false);
      setOpenSuccess(true);
      return;
    }

    toast.error((result.payload as string) || 'Failed to update amenity');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <EditIcon className='w-4 h-4 cursor-pointer' />
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-2xl font-normal py-3">
              Edit Amenities
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

       
          <Button onClick={handleSubmit} className="py-3 w-full rounded-md mt-5" disabled={updateLoading}>
            {updateLoading ? 'Updating...' : 'Update'}
          </Button>
      
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text="You've successfully edit an equipment"
      />
    </Dialog>
  );
}

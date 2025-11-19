import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Success from '../dashboard/success';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store';
import { activateDoctor, deactivateDoctor, fetchDoctorById } from '@/services/thunks';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  doctorId: number | string;
  doctorUserId: string;
  isActive: boolean | null | undefined;
  doctorName?: string;
};

export default function ToggleDoctorStatus({ open, setOpen, doctorId, doctorUserId, isActive, doctorName }: Props) {
  const [openSuccess, setOpenSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isActive) {
        await dispatch(deactivateDoctor(doctorId)).unwrap();
      } else {
        await dispatch(activateDoctor(doctorId)).unwrap();
      }
      setOpen(false);
      setOpenSuccess(true);
      setTimeout(() => {
        setOpenSuccess(false);
        // refresh selected doctor detail
        dispatch(fetchDoctorById(String(doctorUserId)));
      }, 2000);
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const actionWord = isActive ? 'Deactivate' : 'Activate';
  const successText = isActive ? 'Doctor was deactivated successfully' : 'Doctor was activated successfully';
  const bodyText = isActive
    ? "Deactivating this doctor will prevent them from accepting consultations until reactivated. Do you want to continue?"
    : "Activating this doctor will allow them to accept consultations. Proceed?";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col gap-3 py-10">
          <DialogHeader className="flex items-end justify-end gap-4">
            <button
              onClick={() => setOpen(false)}
              type="button"
              className="border border-gray-600 rounded-full "
            >
              <X className="text-neutral-600 hover:text-neutral-600" />
            </button>
          </DialogHeader>
          <div className="flex flex-col gap-8 mt-8">
            <h1 className="text-center text-xl font-semibold text-gray-900">{actionWord} Doctor</h1>
            {doctorName && <p className="text-center text-gray-600 font-medium">{doctorName}</p>}
            <p className="text-lg text-center text-gray-800">{bodyText}</p>
          </div>
          <DialogFooter className="flex items-center justify-between mt-24">
            <Button className="py-3" variant="link" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="py-3" variant={isActive ? 'destructive' : 'default'} disabled={loading}>
              {loading ? 'Processing...' : `Yes, ${actionWord.toLowerCase()}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Success open={openSuccess} setOpen={setOpenSuccess} title="Successful" text={successText} />
    </>
  );
}

import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Success from './success';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store';
import { activateHospital, deactivateHospital, fetchHospitalById } from '@/services/thunks';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hospitalId: number | string;
  isActive: boolean | null | undefined;
};

export default function ToggleHospitalStatus({ open, setOpen, hospitalId, isActive }: Props) {
  const [openSuccess, setOpenSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wasDeactivation, setWasDeactivation] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async () => {
    setLoading(true);
    // Capture current action before state changes
    const deactivating = isActive;
    try {
      if (isActive) {
        await dispatch(deactivateHospital(hospitalId)).unwrap();
      } else {
        await dispatch(activateHospital(hospitalId)).unwrap();
      }
      // refresh selected hospital detail
      dispatch(fetchHospitalById(String(hospitalId)));
      setWasDeactivation(!!deactivating);
      setOpen(false);
      setOpenSuccess(true);
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const actionWord = isActive ? 'Deactivate' : 'Activate';
  const successText = wasDeactivation ? 'Hospital was deactivated successfully' : 'Hospital was activated successfully';
  const bodyText = isActive
    ? "Deactivating this hospital will prevent further patient interactions until reactivated. Do you want to continue?"
    : "Activating this hospital will allow it to receive patient interactions. Proceed?";

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
            <h1 className="text-center text-xl font-semibold text-gray-900">{actionWord} Hospital</h1>
            <p className="text-lg text-gray-800">{bodyText}</p>
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

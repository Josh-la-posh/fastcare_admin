import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';


import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Success from '../dashboard/success';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store';
import { disapproveDoctor, fetchPendingDoctors } from '@/services/thunks';
import toast from 'react-hot-toast';

import { Doctor } from '@/types';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: Doctor;
};

export default function Reject({ open, setOpen, data }: Props) {
  const [openSuccess, setOpenSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const reasonValid = reason.trim().length > 2; // minimal length validation

  const handleReject = async () => {
    if (!data?.userId) return;
    setTouched(true);
    if (!reasonValid) return; // don't proceed if invalid
    setLoading(true);
    try {
      await dispatch(disapproveDoctor({ doctorId: data.id, reason: reason.trim() })).unwrap();
      setOpenSuccess(true);
      setOpen(false);
      setReason('');
      setTouched(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rejection failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset reason when dialog is newly opened/closed
  useEffect(() => {
    if (!open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col gap-6">
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
            <h1 className="text-center text-xl font-semibold text-gray-700">
              Reject {data?.name || ''}
            </h1>
            <p className="text-lg text-center text-[#15322d]">
              You are about to reject this doctor’s verification request. A reason is required and will be communicated to the doctor.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="reject-reason">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reject-reason"
                className={`min-h-28 resize-y rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${touched && !reasonValid ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter clear reason (e.g. License number mismatch, missing documentation, etc.)"
                value={reason}
                onChange={e => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                maxLength={500}
              />
              <div className="flex justify-between text-xs">
                <span className={touched && !reasonValid ? 'text-red-500' : 'text-gray-500'}>
                  {touched && !reasonValid ? 'Reason must be at least 3 characters.' : 'Provide a concise, helpful explanation (max 500 chars).'}
                </span>
                <span className="text-gray-400">{reason.length}/500</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-10 flex items-center justify-between">
            <Button
              className="py-3"
              variant="link"
              onClick={() => setOpen(false)}
            >
              No, cancel
            </Button>
            <Button
              variant="destructive"
              className="py-3"
              onClick={handleReject}
              disabled={loading || !reasonValid}
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text="Doctor was rejected successfully"
        onClose={() => dispatch(fetchPendingDoctors({ page: 1, pageSize: 5 }))}
      />
    </>
  );
}

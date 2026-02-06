import {Download, X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';

import {useEffect, useState} from 'react';
import Success from '../../../features/modules/dashboard/success';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { createRefund } from '@/services/thunks';

interface FormState {
  transactionId: string;
  patientName: string;
  refundAmount: string; // keep as string for input control
  refundReason: string;
  document: File | null;
}

export default function InitiateARefund() {
  const dispatch = useDispatch<AppDispatch>();
  const { creating, createError } = useSelector((s: RootState) => s.refunds);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    transactionId: '',
    patientName: '',
    refundAmount: '',
    refundReason: '',
    document: null,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isValid = () => {
    return (
      form.transactionId.trim() !== '' &&
      form.patientName.trim() !== '' &&
      !!Number(form.refundAmount) &&
      form.refundReason.trim() !== ''
    );
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, document: e.target.files![0] }));
    }
  };

  const handleChange = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({ transactionId: '', patientName: '', refundAmount: '', refundReason: '', document: null });
    setTouched({});
  };

  const handleSubmit = () => {
    setTouched({ transactionId: true, patientName: true, refundAmount: true, refundReason: true });
    if (!isValid() || creating) return;
    dispatch(createRefund({
      TransactionId: form.transactionId.trim(),
      RefundAmount: Number(form.refundAmount),
      RefundReason: form.refundReason.trim(),
      PatientName: form.patientName.trim(),
      Document: form.document || undefined,
    })).then((res) => {
      type RTKAction = { type: string; payload?: unknown; error?: unknown };
      const action = res as RTKAction;
      if (!action.error) {
        resetForm();
        setOpen(false);
        setOpenSuccess(true);
      }
    });
  };

  // Close success modal after a short timeout optionally
  useEffect(() => {
    if (openSuccess) {
      const t = setTimeout(() => setOpenSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [openSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="py-3 w-36 rounded-md">Initiate a refund</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl h-[98%] overflow-hidden">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-2xl font-normal py-3">
              Initiate a refund
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

        <div className="overflow-scroll h-[450px] ">
          <div>
            {/* 2-column form */}
            <div className="grid grid-cols-1   gap-6 mt-6  ">
              <div>
                <label className="text-gray-800">Transaction ID</label>
                <input
                  value={form.transactionId}
                  onChange={e => handleChange('transactionId', e.target.value)}
                  onBlur={() => setTouched(p => ({...p, transactionId: true}))}
                  placeholder="Enter"
                  className="w-full border-gray-300 border  rounded-lg px-3 py-3 mt-2 outline-none"
                />
                {touched.transactionId && !form.transactionId && <p className="text-xs text-red-600 mt-1">Transaction ID is required</p>}
              </div>

              <div>
                <label className="text-gray-800">Patient name</label>
                <input
                  value={form.patientName}
                  onChange={e => handleChange('patientName', e.target.value)}
                  onBlur={() => setTouched(p => ({...p, patientName: true}))}
                  placeholder="Enter"
                  className="w-full border-gray-300 border  rounded-lg px-3 py-3 mt-2 outline-none"
                />
                {touched.patientName && !form.patientName && <p className="text-xs text-red-600 mt-1">Patient name is required</p>}
              </div>

              <div>
                <label className="text-gray-800">Refund amount</label>
                <input
                  value={form.refundAmount}
                  onChange={e => handleChange('refundAmount', e.target.value.replace(/[^0-9.]/g, ''))}
                  onBlur={() => setTouched(p => ({...p, refundAmount: true}))}
                  placeholder="#0.00"
                  className="w-full border-gray-300 border  rounded-lg px-3 py-3 mt-2 outline-none"
                />
                {touched.refundAmount && !Number(form.refundAmount) && <p className="text-xs text-red-600 mt-1">Valid amount required</p>}
              </div>

              <div>
                <label className="text-gray-800">Reason for refund</label>
                <textarea
                  rows={4}
                  value={form.refundReason}
                  onChange={e => handleChange('refundReason', e.target.value)}
                  onBlur={() => setTouched(p => ({...p, refundReason: true}))}
                  placeholder="write..."
                  className="w-full border-gray-300 border  rounded-lg px-3 py-3 mt-2 outline-none"
                />
                {touched.refundReason && !form.refundReason && <p className="text-xs text-red-600 mt-1">Reason is required</p>}
              </div>
            </div>

            <div>
              <label className="text-gray-800">Extra document</label>

              <div className="flex  mt-2 ">
                <label
                  htmlFor="passport-upload"
                  className="border-2 border-dashed border-primary rounded-lg w-full py-6 flex flex-col items-center justify-center text-center cursor-pointer  transition"
                >
                  <Download className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-4 font-medium text-lg text-gray-700">
                    Drag and Drop to upload a passport photo
                  </p>
                  <p className="text-lg  text-gray-700 ">
                    or{' '}
                    <span className="text-primary font-semibold">browse</span>{' '}
                    to select a PNG file
                  </p>
                  <input
                    id="passport-upload"
                    type="file"
                    accept="image/png,application/pdf,image/jpeg"
                    onChange={handleFile}
                    className="hidden"
                  />
                  {form.document && <p className="text-xs mt-2 text-gray-600">File: {form.document.name}</p>}
                </label>
              </div>
            </div>

            <div className="bg-gray-200  px-4 mt-4 rounded-md mb-6">
              <div className=''>
                <h1 className='text-gray-900 text-xl  py-4'>Important</h1>

                <p className='text-gray-700 text-md font-normal pb-4'>
                  Refunding this transaction will credit the patient wallet.
                  This will take between 2-5 working days for the patient to
                  recieve the money in their wallet.
                </p>
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex justify-between items-center gap-4 mt-8">
            <Button
              variant="link"
              onClick={() => setOpen(false)}
              className="py-3 w-48 rounded-md bg-gray-300 border-none"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid() || creating} className="py-3 w-48 rounded-md disabled:opacity-50">
              {creating ? 'Processing...' : 'Refund'}
            </Button>
          </div>
        </div>

        {createError && <p className="text-center text-red-600 text-sm mt-2">{createError}</p>}
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text="You've successfully submitted a refund request"
      />
    </Dialog>
  );
}

import {EditIcon, X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import toast from 'react-hot-toast';
import Success from '../../../../features/modules/dashboard/success';
import {AppDispatch} from '@/services/store';
import {fetchDrivers, updateDriver} from '@/services/thunks';
import {Driver} from '@/types';

type Props = {
  data?: Driver;
};

const CERTIFICATION_STATUS_OPTIONS = ['Verified', 'Pending', 'Unverified'];

export default function EditDriver({data}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [certificationStatus, setCertificationStatus] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!open || !data) return;
    setName(data.name || '');
    setLicenseNumber(data.licenseNumber || '');
    setCertificationStatus(data.certificationStatus || '');
    setPhoneNumber(data.phoneNumber || '');
    setEmail(data.email || '');
    setAddress(data.address || '');
  }, [open, data]);

  const handleSubmit = async () => {
    if (!data?.id) return toast.error('Driver id is missing');
    if (!name.trim()) return toast.error('Name is required');
    if (!certificationStatus) return toast.error('License status is required');
    if (!licenseNumber.trim()) return toast.error('License number is required');
    if (!phoneNumber.trim()) return toast.error('Phone number is required');
    if (!email.trim()) return toast.error('Email is required');
    if (!address.trim()) return toast.error('Address is required');

    setSubmitting(true);
    const result = await dispatch(
      updateDriver({
        id: data.id,
        name: name.trim(),
        certificationStatus,
        licenseNumber: licenseNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        address: address.trim(),
      }),
    );
    setSubmitting(false);

    if (updateDriver.fulfilled.match(result)) {
      setOpen(false);
      setOpenSuccess(true);
      dispatch(fetchDrivers({Page: 1, PageSize: 10, paginated: true}));
      return;
    }

    toast.error((result.payload as string) || 'Failed to update driver');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <EditIcon className="w-4 h-4 cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-xl font-normal py-3">
              Edit Driver Information
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

        <div className="overflow-scroll h-[400px] ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-gray-800">Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-800">Driver's License Number</label>
              <input
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-800">License Status</label>
              <Select value={certificationStatus} onValueChange={setCertificationStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option." />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATION_STATUS_OPTIONS.map(item => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-800">Phone Number</label>
              <input
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-800">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>

            <div className="col-span-2 w-full">
              <label className="text-gray-800">Address</label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 mt-8">
          <Button onClick={handleSubmit} className="py-3 w-48 rounded-md" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text="You've successfully edited the driver"
      />
    </Dialog>
  );
}

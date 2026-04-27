import {X} from 'lucide-react';
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
import {useState} from 'react';
import {useDispatch} from 'react-redux';
import toast from 'react-hot-toast';
import Success from '../../../../features/modules/dashboard/success';
import {AppDispatch} from '@/services/store';
import {createRespondent, fetchRespondents} from '@/services/thunks';

const CERTIFICATION_STATUS_OPTIONS = ['Verified', 'Pending', 'Unverified'];

export default function AddResponder() {
  const dispatch = useDispatch<AppDispatch>();
  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [professionalLicense, setProfessionalLicense] = useState('');
  const [certificationStatus, setCertificationStatus] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const resetForm = () => {
    setName('');
    setProfessionalLicense('');
    setCertificationStatus('');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Name is required');
    if (!professionalLicense.trim()) return toast.error('Professional license is required');
    if (!certificationStatus) return toast.error('Certification status is required');
    if (!phoneNumber.trim()) return toast.error('Phone number is required');
    if (!email.trim()) return toast.error('Email is required');
    if (!address.trim()) return toast.error('Address is required');

    setSubmitting(true);
    const result = await dispatch(
      createRespondent({
        name: name.trim(),
        professionalLicense: professionalLicense.trim(),
        certificationStatus,
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        address: address.trim(),
      }),
    );
    setSubmitting(false);

    if (createRespondent.fulfilled.match(result)) {
      setOpen(false);
      setOpenSuccess(true);
      resetForm();
      dispatch(fetchRespondents({Page: 1, PageSize: 10, paginated: true}));
      return;
    }

    toast.error((result.payload as string) || 'Failed to create responder');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="py-3 w-36 rounded-md">Add Responder</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-xl font-normal py-3">
              Add New Responder
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
              <label className="text-gray-800">Professional License</label>
              <input
                value={professionalLicense}
                onChange={e => setProfessionalLicense(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-800">Certificate Status</label>
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
        text="You've successfully added a new responder"
      />
    </Dialog>
  );
}

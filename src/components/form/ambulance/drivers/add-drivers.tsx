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
import {PhoneInput} from '@/components/ui/phone-input';
import {useState} from 'react';
import {useDispatch} from 'react-redux';
import toast from 'react-hot-toast';
import Success from '../../../../features/modules/dashboard/success';
import {AppDispatch} from '@/services/store';
import {addDriver, fetchDrivers} from '@/services/thunks';

const CERTIFICATION_STATUS_OPTIONS = ['Verified', 'Pending', 'Unverified'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DriverFormErrors = {
  name?: string;
  licenseNumber?: string;
  certificationStatus?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
};

export default function AddDriver() {
  const dispatch = useDispatch<AppDispatch>();
  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [certificationStatus, setCertificationStatus] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<DriverFormErrors>({});

  const validateName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Name is required';
    if (trimmed.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Name contains invalid characters';
    return '';
  };

  const validateCertificationStatus = (value: string) => {
    if (!value) return 'Certification status is required';
    return '';
  };

  const validateLicenseNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'License number is required';
    if (trimmed.length < 5) return 'License number must be at least 5 characters';
    if (!/^[a-zA-Z0-9/-]+$/.test(trimmed)) return 'License number contains invalid characters';
    return '';
  };

  const validatePhoneNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Phone number is required';
    if (trimmed.length < 7) return 'Invalid phone number';
    return '';
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required';
    if (!EMAIL_REGEX.test(trimmed)) return 'Invalid email address';
    return '';
  };

  const validateAddress = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Address is required';
    if (trimmed.length < 8) return 'Address must be at least 8 characters';
    return '';
  };

  const validateForm = () => {
    const nextErrors: DriverFormErrors = {
      name: validateName(name),
      licenseNumber: validateLicenseNumber(licenseNumber),
      certificationStatus: validateCertificationStatus(certificationStatus),
      phoneNumber: validatePhoneNumber(phoneNumber),
      email: validateEmail(email),
      address: validateAddress(address),
    };

    setErrors(nextErrors);
    return nextErrors;
  };

  const resetForm = () => {
    setName('');
    setLicenseNumber('');
    setCertificationStatus('');
    setCountryCode('+234');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
    setErrors({});
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    const firstError = Object.values(formErrors).find(Boolean);
    if (firstError) return toast.error(firstError);

    setSubmitting(true);
    const result = await dispatch(
      addDriver({
        name: name.trim(),
        certificationStatus,
        licenseNumber: licenseNumber.trim(),
        countryCode,
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        address: address.trim(),
      }),
    );
    setSubmitting(false);

    if (addDriver.fulfilled.match(result)) {
      setOpen(false);
      setOpenSuccess(true);
      resetForm();
      dispatch(fetchDrivers({Page: 1, PageSize: 10, paginated: true}));
      return;
    }

    toast.error((result.payload as string) || 'Failed to create driver');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="py-3 w-36 rounded-md">Add Driver</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-xl font-normal py-3">
              Add New Driver
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
                onChange={e => {
                  const next = e.target.value;
                  setName(next);
                  setErrors(prev => ({...prev, name: validateName(next)}));
                }}
                onBlur={() => setErrors(prev => ({...prev, name: validateName(name)}))}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </div>

            <div>
              <label className="text-gray-800">Driver's License Number</label>
              <input
                value={licenseNumber}
                onChange={e => {
                  const next = e.target.value;
                  setLicenseNumber(next);
                  setErrors(prev => ({...prev, licenseNumber: validateLicenseNumber(next)}));
                }}
                onBlur={() =>
                  setErrors(prev => ({...prev, licenseNumber: validateLicenseNumber(licenseNumber)}))
                }
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
              {errors.licenseNumber ? (
                <p className="mt-1 text-xs text-red-600">{errors.licenseNumber}</p>
              ) : null}
            </div>

            <div>
              <label className="text-gray-800">Certification Status</label>
              <Select
                value={certificationStatus}
                onValueChange={val => {
                  setCertificationStatus(val);
                  setErrors(prev => ({...prev, certificationStatus: validateCertificationStatus(val)}));
                }}
              >
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
              {errors.certificationStatus ? (
                <p className="mt-1 text-xs text-red-600">{errors.certificationStatus}</p>
              ) : null}
            </div>

            <div>
              <PhoneInput
                value={{countryCode, phoneNumber}}
                onChange={val => {
                  setCountryCode(val.countryCode);
                  setPhoneNumber(val.phoneNumber);
                  setErrors(prev => ({...prev, phoneNumber: validatePhoneNumber(val.phoneNumber)}));
                }}
                required
                error={errors.phoneNumber}
              />
            </div>

            <div>
              <label className="text-gray-800">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  const next = e.target.value;
                  setEmail(next);
                  setErrors(prev => ({...prev, email: validateEmail(next)}));
                }}
                onBlur={() => setErrors(prev => ({...prev, email: validateEmail(email)}))}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>

            <div className="col-span-2 w-full">
              <label className="text-gray-800">Address</label>
              <input
                value={address}
                onChange={e => {
                  const next = e.target.value;
                  setAddress(next);
                  setErrors(prev => ({...prev, address: validateAddress(next)}));
                }}
                onBlur={() => setErrors(prev => ({...prev, address: validateAddress(address)}))}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
              {errors.address ? <p className="mt-1 text-xs text-red-600">{errors.address}</p> : null}
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
        text="You've successfully added a new driver"
      />
    </Dialog>
  );
}

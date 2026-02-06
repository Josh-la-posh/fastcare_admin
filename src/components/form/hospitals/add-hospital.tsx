import { ImageIcon, X, Pencil, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import Success from '../../../features/modules/dashboard/success';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store';
import { createHospital, fetchHospitals } from '@/services/thunks';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PhoneInput } from '@/components/ui/phone-input';
import { BankSelect } from '@/components/ui/bank-select';

// Inline schema aligned with backend contract (camelCase in form, PascalCase when sending)
const addHospitalSchema = z.object({
  hospitalName: z.string().min(2, 'Required'),
  hospitalCode: z.string().min(2, 'Required'),
  hospitalAddresses: z.string().min(5, 'Required'),
  address: z.string().min(5, 'Required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')), // optional
  phoneNumber: z.string().min(7, 'Invalid phone'),
  countryCode: z.string().min(1),
  email: z.string().email('Invalid email'),
  accountNumber: z.string().length(10, 'Must be 10 digits'),
  invoiceAccountNumber: z.string().length(10, 'Must be 10 digits'),
  bankCode: z.string().min(1, 'Required'),
  invoiceBankCode: z.string().min(1, 'Required'),
});

type HospitalFormValues = z.infer<typeof addHospitalSchema>;

// Service charge types
type ServiceChargeType = 'registration' | 'virtual' | 'physical';

interface ServiceCharge {
  id: string;
  type: ServiceChargeType;
  amount: string;
}

const SERVICE_CHARGE_LABELS: Record<ServiceChargeType, string> = {
  registration: 'Registration Charge',
  virtual: 'Virtual Consultation Charge',
  physical: 'Physical Consultation Charge',
};


export default function AddHospital() {
  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Service charges state
  const [serviceCharges, setServiceCharges] = useState<ServiceCharge[]>([]);
  const [selectedChargeType, setSelectedChargeType] = useState<ServiceChargeType | ''>('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [editingChargeId, setEditingChargeId] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const {
  register,
  handleSubmit,
  setValue,
  reset,
  watch,
  formState: { errors },
  } = useForm<HospitalFormValues>({
    resolver: zodResolver(addHospitalSchema),
    defaultValues: {
      hospitalName: '',
      hospitalCode: '',
      hospitalAddresses: '',
      address: '',
      website: '',
      phoneNumber: '',
      countryCode: '+234',
      email: '',
      accountNumber: '',
      invoiceAccountNumber: '',
      bankCode: '',
      invoiceBankCode: '',
    },
    mode: 'onChange',
  });

  // Ensure fees & numeric fields respect max length constraints on change
  const clampDigits = (val: string, maxLen: number) => val.replace(/\D/g, '').slice(0, maxLen);

  // Scroll to first error field when validation fails
  const scrollToError = () => {
    const firstErrorKey = Object.keys(errors)[0] as keyof HospitalFormValues | undefined;
    if (firstErrorKey) {
      const element = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  // Get available charge types (ones not already added)
  const availableChargeTypes = (['registration', 'virtual', 'physical'] as ServiceChargeType[]).filter(
    type => !serviceCharges.some(sc => sc.type === type) || (editingChargeId && serviceCharges.find(sc => sc.id === editingChargeId)?.type === type)
  );

  // Add or update service charge
  const handleAddOrUpdateCharge = () => {
    if (!selectedChargeType || !chargeAmount) {
      toast.error('Please select a service type and enter an amount');
      return;
    }

    if (editingChargeId) {
      // Update existing charge
      setServiceCharges(prev => prev.map(sc => 
        sc.id === editingChargeId 
          ? { ...sc, type: selectedChargeType, amount: chargeAmount }
          : sc
      ));
      setEditingChargeId(null);
    } else {
      // Add new charge
      const newCharge: ServiceCharge = {
        id: Date.now().toString(),
        type: selectedChargeType,
        amount: chargeAmount,
      };
      setServiceCharges(prev => [...prev, newCharge]);
    }
    
    setSelectedChargeType('');
    setChargeAmount('');
  };

  // Edit a service charge
  const handleEditCharge = (charge: ServiceCharge) => {
    setEditingChargeId(charge.id);
    setSelectedChargeType(charge.type);
    setChargeAmount(charge.amount);
  };

  // Delete a service charge
  const handleDeleteCharge = (id: string) => {
    setServiceCharges(prev => prev.filter(sc => sc.id !== id));
    if (editingChargeId === id) {
      setEditingChargeId(null);
      setSelectedChargeType('');
      setChargeAmount('');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingChargeId(null);
    setSelectedChargeType('');
    setChargeAmount('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: HospitalFormValues) => {
    // Validate service charges - require at least virtual and physical consultation fees
    const hasVirtual = serviceCharges.some(sc => sc.type === 'virtual');
    const hasPhysical = serviceCharges.some(sc => sc.type === 'physical');
    
    if (!hasVirtual || !hasPhysical) {
      toast.error('Please add both Virtual and Physical Consultation Charges');
      return;
    }

    setIsLoading(true);
    try {
      const payload = new FormData();
      // Build FormData 1:1 with backend keys
      const map: Record<keyof HospitalFormValues, string> = {
        hospitalName: 'HospitalName',
        hospitalCode: 'HospitalCode',
        hospitalAddresses: 'HospitalAddresses',
        address: 'Address',
        website: 'Website',
        phoneNumber: 'PhoneNumber',
        countryCode: 'CountryCode',
        email: 'Email',
        accountNumber: 'AccountNumber',
        invoiceAccountNumber: 'InvoiceAccountNumber',
        bankCode: 'BankCode',
        invoiceBankCode: 'InvoiceBankCode',
      };

      Object.entries(values).forEach(([k, raw]) => {
        const key = k as keyof HospitalFormValues;
        const apiKey = map[key];
        if (!apiKey) return;
        const valStr = (raw ?? '').toString().trim();
        if (!valStr) return; // skip empty optional fields
        payload.append(apiKey, valStr);
      });
      if (logoFile) payload.append('LogoContent', logoFile);
      
      // Add service charges to payload
      const registrationCharge = serviceCharges.find(sc => sc.type === 'registration');
      const virtualCharge = serviceCharges.find(sc => sc.type === 'virtual');
      const physicalCharge = serviceCharges.find(sc => sc.type === 'physical');
      
      const registrationFeeAmount = registrationCharge ? Number(registrationCharge.amount) : 0;
      payload.append('RegistrationFee', String(registrationFeeAmount));
      payload.append('IsRegistrationFeeEnabled', String(registrationFeeAmount > 0));
      payload.append('VirtualConsultationFee', String(virtualCharge ? Number(virtualCharge.amount) : 0));
      payload.append('PhysicalConsultationFee', String(physicalCharge ? Number(physicalCharge.amount) : 0));

  await dispatch(createHospital(payload)).unwrap();
  // Refetch hospitals list with reset pagination and empty search
  dispatch(fetchHospitals({ page: 1, pageSize: 10, search: '' }));

      // Close the add hospital dialog first, then show success
      setOpen(false);
      setOpenSuccess(true);

      reset();
      setLogoFile(null);
      setPreviewUrl(null);
      setServiceCharges([]);
      setSelectedChargeType('');
      setChargeAmount('');
      setEditingChargeId(null);
    } catch (error: unknown) {
      console.error('Error adding hospital:', error);
      interface WithMessage { message: string }
      const message = ((): string => {
        if (typeof error === 'string') {
          return error;
        }
        if (typeof error === 'object' && error && 'message' in error) {
          const maybe = error as Partial<WithMessage>;
            if (maybe.message) return maybe.message;
        }
        return 'Failed to add hospital';
      })();
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="py-2 w-36 rounded-md">Add Hospital</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[95%]">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-xl font-normal py-2">
              Add Hospital
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
        <form
          className="overflow-scroll h-full"
          onSubmit={handleSubmit(onSubmit, scrollToError)}
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Input
              label="Hospital Code"
              required
              requiredIndicator
              maxLength={30}
              {...register('hospitalCode')}
              error={errors.hospitalCode?.message}
            />
            <Input
              label="Hospital Name"
              required
              requiredIndicator
              minLength={2}
              maxLength={50}
              {...register('hospitalName')}
              error={errors.hospitalName?.message}
            />
            <PhoneInput
              value={{ countryCode: watch('countryCode') || '+234', phoneNumber: watch('phoneNumber') || '' }}
              onChange={(val) => {
                setValue('countryCode', val.countryCode); // no validation needed
                setValue('phoneNumber', val.phoneNumber, { shouldValidate: true });
              }}
              required // only phone number is effectively required
              error={errors.phoneNumber?.message || undefined}
            />
            <Input
              label="Email"
              type="email"
              required
              maxLength={50}
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="IP Address"
              required
              minLength={5}
              maxLength={150}
              {...register('hospitalAddresses')}
              error={errors.hospitalAddresses?.message as string}
            />
            <Input
              label="Hospital Address"
              required
              minLength={5}
              maxLength={100}
              placeholder="Primary address"
              {...register('address')}
              error={errors.address?.message}
            />
            <Input
              label="Website"
              placeholder="https://example.com"
              {...register('website', {
                onBlur: e => {
                  let val = e.target.value.trim();
                  if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                    val = 'https://' + val;
                    setValue('website', val, { shouldValidate: true });
                  }
                },
              })}
              error={errors.website?.message}
            />
          </div>

          {/* Service Charge Section */}
          <div className="mt-8 border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Service Charges</h3>
            
            {/* Add/Edit Service Charge Form */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <Select
                  value={selectedChargeType}
                  onValueChange={(value) => setSelectedChargeType(value as ServiceChargeType)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChargeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {SERVICE_CHARGE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Input
                  label="Charge Amount"
                  type="number"
                  min={0}
                  max={999999}
                  inputMode="numeric"
                  placeholder="e.g. 5000"
                  value={chargeAmount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setChargeAmount(v);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAddOrUpdateCharge}
                  className="flex items-center gap-2"
                  disabled={!selectedChargeType || !chargeAmount}
                >
                  {editingChargeId ? (
                    <>
                      <Pencil className="w-4 h-4" />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add
                    </>
                  )}
                </Button>
                {editingChargeId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* List of Added Service Charges */}
            {serviceCharges.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Added Charges:</h4>
                <div className="space-y-2">
                  {serviceCharges.map((charge) => (
                    <div
                      key={charge.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        editingChargeId === charge.id ? 'border-primary bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-medium">{SERVICE_CHARGE_LABELS[charge.type]}</span>
                        <span className="ml-4 text-gray-600">₦{Number(charge.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditCharge(charge)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCharge(charge.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-md transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help text */}
            <p className="mt-4 text-sm text-gray-500">
              * Virtual Consultation Charge and Physical Consultation Charge are required.
              Registration Charge is optional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <BankSelect
              label="Bank"
              required
              value={watch('bankCode')}
              onChange={code => setValue('bankCode', code, { shouldValidate: true })}
              error={errors.bankCode?.message}
            />
            <Input
              label="Account Number"
              placeholder="0123456789"
              required
              maxLength={10}
              {...register('accountNumber', {
                onChange: e => {
                  const v = clampDigits(e.target.value, 10);
                  setValue('accountNumber', v, { shouldValidate: true });
                },
              })}
              error={errors.accountNumber?.message}
            />
            <BankSelect
              label="Invoice Bank"
              required
              value={watch('invoiceBankCode')}
              onChange={code => setValue('invoiceBankCode', code, { shouldValidate: true })}
              error={errors.invoiceBankCode?.message}
            />
            <Input
              label="Invoice Account Number"
              placeholder="0123456789"
              required
              maxLength={10}
              {...register('invoiceAccountNumber', {
                onChange: e => {
                  const v = clampDigits(e.target.value, 10);
                  setValue('invoiceAccountNumber', v, { shouldValidate: true });
                },
              })}
              error={errors.invoiceAccountNumber?.message}
            />
          </div>

          <div className="mt-8">
            <label className="text-gray-800">Logo Content</label>
            <div className="flex">
              <label
                htmlFor="logo-upload"
                className="border-2 border-gray-300 rounded-lg w-full lg:w-[500px] h-64 flex flex-col items-center justify-center text-center cursor-pointer transition"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo Preview"
                    className="h-full object-contain p-4"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-14 h-14 mb-4 text-gray-500" />
                    <p className="mb-4 font-medium text-lg text-gray-700">
                      Drag and Drop to upload logo
                    </p>
                  </>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 mt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="py-2 w-48 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isLoading ? 'Adding...' : 'Add hospital'}
            </Button>
          </div>
        </form>
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text="You've successfully added a new Hospital"
         //onClose={() => dispatch(fetchHospitals())}
      />
    </Dialog>
  );
}

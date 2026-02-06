import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { AppDispatch } from '@/services/store';
import { updateHospitalFormData, fetchHospitalById } from '@/services/thunks';
import { Hospital } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PhoneInput } from '@/components/ui/phone-input';
import { BankSelect } from '@/components/ui/bank-select';

// Inline schema for edit form (camelCase fields). RegistrationFee conditional.
const editSchema = z.object({
  hospitalName: z.string().min(2, 'Required'),
  hospitalCode: z.string().min(2, 'Required'),
  physicalConsultationFee: z.string().regex(/^\d+$/, 'Digits only').min(1, 'Required'),
  virtualConsultationFee: z.string().regex(/^\d+$/, 'Digits only').min(1, 'Required'),
  hospitalAddresses: z.string().min(5, 'Required'),
  address: z.string().min(5, 'Required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  phoneNumber: z.string().min(7, 'Invalid phone'),
  countryCode: z.string().min(1),
  email: z.string().email('Invalid email'),
  accountNumber: z.string().length(10, 'Must be 10 digits'),
  invoiceAccountNumber: z.string().length(10, 'Must be 10 digits'),
  bankCode: z.string().min(1, 'Required'),
  invoiceBankCode: z.string().min(1, 'Required'),
});
type EditFormValues = z.infer<typeof editSchema>;

interface Props {
  data: Hospital | null;
  isEditing: boolean;
  onCancel?: () => void;
  onUpdated?: () => void; // callback after successful update
}

const HospitalDetail = ({ data, isEditing, onCancel, onUpdated }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasRegistrationFee, setHasRegistrationFee] = useState(false);
  const [registrationFee, setRegistrationFee] = useState('');

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      hospitalName: '', hospitalCode: '', physicalConsultationFee: '', virtualConsultationFee: '', hospitalAddresses: '', address: '', website: '', phoneNumber: '', countryCode: '+234', email: '', accountNumber: '', invoiceAccountNumber: '', bankCode: '', invoiceBankCode: ''
    },
    mode: 'onChange'
  });
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form;

  // populate on data load
  useEffect(() => {
    if (!data) return;
    reset({
      hospitalName: data.hospitalName || '',
      hospitalCode: data.hospitalCode || '',
      physicalConsultationFee: (data.physicalConsultationCharge ?? '').toString(),
      virtualConsultationFee: (data.virtualConsultationCharge ?? '').toString(),
      hospitalAddresses: data.hospitalAddresses || '',
      address: data.address || '',
      website: data.website || '',
      phoneNumber: data.phoneNumber || '',
      countryCode: data.countryCode || '+234',
      email: data.email || '',
      accountNumber: (data.accountNumber ?? '').toString(),
      invoiceAccountNumber: (data.invoiceAccountNumber ?? '').toString(),
      bankCode: data.bankCode || '',
      invoiceBankCode: data.invoiceBankCode || '',
    });
    // Initialize registration fee state from data
    const regFee = data.registrationFee ?? 0;
    setHasRegistrationFee(regFee > 0);
    setRegistrationFee(regFee > 0 ? regFee.toString() : '');
  }, [data, reset]);

  // Scroll to first error field when validation fails
  const scrollToError = () => {
    const firstErrorKey = Object.keys(errors)[0] as keyof EditFormValues | undefined;
    if (firstErrorKey) {
      const element = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const onSubmit = async (values: EditFormValues) => {
    if (!data) return;
    try {
      const fd = new FormData();
      const map: Record<keyof EditFormValues, string> = {
        hospitalName: 'HospitalName', hospitalCode: 'HospitalCode', physicalConsultationFee: 'PhysicalConsultationFee', virtualConsultationFee: 'VirtualConsultationFee', hospitalAddresses: 'HospitalAddresses', address: 'Address', website: 'Website', phoneNumber: 'PhoneNumber', countryCode: 'CountryCode', email: 'Email', accountNumber: 'AccountNumber', invoiceAccountNumber: 'InvoiceAccountNumber', bankCode: 'BankCode', invoiceBankCode: 'InvoiceBankCode'
      };
      const numeric: (keyof EditFormValues)[] = ['physicalConsultationFee','virtualConsultationFee'];
      Object.entries(values).forEach(([k, raw]) => {
        const key = k as keyof EditFormValues;
        const val = (raw ?? '').toString().trim();
        if (!val) return;
        const apiKey = map[key];
        if (!apiKey) return;
        fd.append(apiKey, numeric.includes(key) ? String(Number(val)) : val);
      });
      // Add registration fee
      const regFeeValue = hasRegistrationFee ? Number(registrationFee || '0') : 0;
      fd.append('RegistrationFee', String(regFeeValue));
      fd.append('IsRegistrationFeeEnabled', String(regFeeValue > 0));
      
      if (logoFile) fd.append('LogoContent', logoFile);
      await dispatch(updateHospitalFormData({ id: data.id, formData: fd })).unwrap();
      toast.success('Hospital updated');
      dispatch(fetchHospitalById(String(data.id)));
      onUpdated?.();
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Update failed');
    }
  };

  if (!data) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit, scrollToError)} className="mt-10 mx-6 space-y-8" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mt-6">
        <Input label="Hospital Code" disabled={!isEditing} requiredIndicator required {...register('hospitalCode')} error={errors.hospitalCode?.message} />
        <Input label="Hospital Name" disabled={!isEditing} requiredIndicator required {...register('hospitalName')} error={errors.hospitalName?.message} />
        <Input label="Physical Consultation Fee" type="number" disabled={!isEditing} requiredIndicator required {...register('physicalConsultationFee')} error={errors.physicalConsultationFee?.message} />
        <Input label="Virtual Consultation Fee" type="number" disabled={!isEditing} requiredIndicator required {...register('virtualConsultationFee')} error={errors.virtualConsultationFee?.message} />
        <Input label="Email" type="email" disabled={!isEditing} requiredIndicator required {...register('email')} error={errors.email?.message} />
        <PhoneInput
          value={{ countryCode: watch('countryCode') || '+234', phoneNumber: watch('phoneNumber') || '' }}
          onChange={(val) => { if (!isEditing) return; setValue('countryCode', val.countryCode); setValue('phoneNumber', val.phoneNumber, { shouldValidate: true }); }}
          required
          error={errors.phoneNumber?.message}
        />
        <Input label="Hospital Address" disabled={!isEditing} requiredIndicator required {...register('address')} error={errors.address?.message} />
        <Input label="Website" disabled={!isEditing} {...register('website')} error={errors.website?.message} />
        <Input label="IP Address" disabled={!isEditing} requiredIndicator required {...register('hospitalAddresses')} error={errors.hospitalAddresses?.message} />
        <BankSelect label="Bank" value={watch('bankCode') || ''} onChange={(code) => setValue('bankCode', code, { shouldValidate: true })} error={errors.bankCode?.message} />
        <Input label="Account Number" maxLength={10} disabled={!isEditing} {...register('accountNumber')} error={errors.accountNumber?.message} />
        <BankSelect label="Invoice Bank" value={watch('invoiceBankCode') || ''} onChange={(code) => setValue('invoiceBankCode', code, { shouldValidate: true })} error={errors.invoiceBankCode?.message} />
        <Input label="Invoice Account Number" maxLength={10} disabled={!isEditing} {...register('invoiceAccountNumber')} error={errors.invoiceAccountNumber?.message} />
      </div>
      {isEditing && (
        <div className="flex flex-col gap-6">
          {/* Registration Fee Toggle */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <Switch
                id="registration-fee-toggle"
                checked={hasRegistrationFee}
                onCheckedChange={(checked) => {
                  setHasRegistrationFee(checked);
                  if (!checked) setRegistrationFee('');
                }}
              />
              <label htmlFor="registration-fee-toggle" className="text-gray-800 font-medium cursor-pointer">
                Registration Fee
              </label>
            </div>
            {hasRegistrationFee && (
              <div className="mt-4 w-full">
                <Input
                  label="Registration Fee"
                  type="number"
                  min={0}
                  max={999999}
                  inputMode="numeric"
                  placeholder="e.g. 2000"
                  value={registrationFee}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setRegistrationFee(v);
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Logo Content</label>
            <input type="file" accept="image/png,image/jpeg" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); const r = new FileReader(); r.onloadend = () => setPreviewUrl(r.result as string); r.readAsDataURL(f);} }} className="mt-2" />
            {previewUrl && <img src={previewUrl} alt="Preview" className="h-24 mt-2 object-contain" />}
          </div>
          <div className="flex gap-4">
            <Button type="submit" className="w-40">Update Hospital</Button>
            {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
          </div>
        </div>
      )}
    </form>
  );
};

export default HospitalDetail;

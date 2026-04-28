import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Success from "../../../../features/modules/dashboard/success";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/services/store";
import { createAmbulanceProviders } from "@/services/thunks";
import { CreateAmbulanceProvider } from "@/types";
import { PhoneInput } from "@/components/ui/phone-input";
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProviderFormErrors = {
  registrationNumber?: string;
  address?: string;
  email?: string;
  adminName?: string;
  phoneNumber?: string;
  serviceCharge?: string;
};

export default function AddProviders() {
  const dispatch = useDispatch<AppDispatch>();
  const { createLoading } = useSelector((state: RootState) => state.ambulance);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("+234");
  const [errors, setErrors] = useState<ProviderFormErrors>({});

  // Controlled form state
  const [formData, setFormData] = useState<CreateAmbulanceProvider>({
    registrationNumber: "",
    address: "",
    email: "",
    adminName: "",
    phoneNumber: "",
    serviceCharge: 0,
  });

  const validateRegistrationNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Company registration number is required";
    if (trimmed.length < 4) return "Registration number must be at least 4 characters";
    return "";
  };

  const validateAddress = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Office address is required";
    if (trimmed.length < 8) return "Address must be at least 8 characters";
    return "";
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Company email is required";
    if (!EMAIL_REGEX.test(trimmed)) return "Invalid email address";
    return "";
  };

  const validateAdminName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Contact person name is required";
    if (trimmed.length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return "Name contains invalid characters";
    return "";
  };

  const validatePhoneNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Phone number is required";
    if (trimmed.length < 7) return "Invalid phone number";
    return "";
  };

  const validateServiceCharge = (value: number) => {
    if (!Number.isFinite(value)) return "Service charge is required";
    if (value < 0) return "Service charge cannot be negative";
    return "";
  };

  const validateForm = () => {
    const nextErrors: ProviderFormErrors = {
      registrationNumber: validateRegistrationNumber(formData.registrationNumber),
      address: validateAddress(formData.address),
      email: validateEmail(formData.email),
      adminName: validateAdminName(formData.adminName),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      serviceCharge: validateServiceCharge(formData.serviceCharge),
    };

    setErrors(nextErrors);
    return nextErrors;
  };

  const resetForm = () => {
    setCountryCode("+234");
    setErrors({});
    setFormData({
      registrationNumber: "",
      address: "",
      email: "",
      adminName: "",
      phoneNumber: "",
      serviceCharge: 0,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const nextValue = name === "serviceCharge" ? Number(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === "registrationNumber") {
      setErrors(prev => ({ ...prev, registrationNumber: validateRegistrationNumber(String(nextValue)) }));
    }
    if (name === "address") {
      setErrors(prev => ({ ...prev, address: validateAddress(String(nextValue)) }));
    }
    if (name === "email") {
      setErrors(prev => ({ ...prev, email: validateEmail(String(nextValue)) }));
    }
    if (name === "adminName") {
      setErrors(prev => ({ ...prev, adminName: validateAdminName(String(nextValue)) }));
    }
    if (name === "serviceCharge") {
      setErrors(prev => ({ ...prev, serviceCharge: validateServiceCharge(Number(nextValue)) }));
    }
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    const firstError = Object.values(formErrors).find(Boolean);
    if (firstError) return toast.error(firstError);

    try {
      const res = await dispatch(
        createAmbulanceProviders({
          ...formData,
          registrationNumber: formData.registrationNumber.trim(),
          address: formData.address.trim(),
          email: formData.email.trim(),
          adminName: formData.adminName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
        })
      ).unwrap();

      if (res) {
        setOpen(false);
        setOpenSuccess(true);
        resetForm();
      }
    } catch (err) {
      toast.error((err as string) || "Failed to create provider");
      console.error("Create provider failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="py-3 w-36 rounded-md">Add Provider</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-xl font-normal py-3">
              New Ambulance Provider
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
              <label className="text-gray-800">Company Registration Number</label>
              <input
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    registrationNumber: validateRegistrationNumber(formData.registrationNumber),
                  }))
                }
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
              {errors.registrationNumber ? (
                <p className="mt-1 text-xs text-red-600">{errors.registrationNumber}</p>
              ) : null}
            </div>

            <div>
              <label className="text-gray-800">Company Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => setErrors(prev => ({ ...prev, email: validateEmail(formData.email) }))}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>

            <div>
              <label className="text-gray-800">Office Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={() => setErrors(prev => ({ ...prev, address: validateAddress(formData.address) }))}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
              {errors.address ? <p className="mt-1 text-xs text-red-600">{errors.address}</p> : null}
            </div>

            <div>
              <label className="text-gray-800">Service Charge</label>
              <input
                name="serviceCharge"
                type="number"
                value={formData.serviceCharge}
                onChange={handleChange}
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    serviceCharge: validateServiceCharge(formData.serviceCharge),
                  }))
                }
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
              {errors.serviceCharge ? (
                <p className="mt-1 text-xs text-red-600">{errors.serviceCharge}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-gray-800 text-2xl border-b py-4">Contact Person</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="text-gray-800">Name</label>
                <input
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  onBlur={() =>
                    setErrors(prev => ({ ...prev, adminName: validateAdminName(formData.adminName) }))
                  }
                  className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
                />
                {errors.adminName ? (
                  <p className="mt-1 text-xs text-red-600">{errors.adminName}</p>
                ) : null}
              </div>

              <div>
                <PhoneInput
                  value={{ countryCode, phoneNumber: formData.phoneNumber }}
                  onChange={val => {
                    setCountryCode(val.countryCode);
                    setFormData(prev => ({ ...prev, phoneNumber: val.phoneNumber }));
                    setErrors(prev => ({ ...prev, phoneNumber: validatePhoneNumber(val.phoneNumber) }));
                  }}
                  required
                  error={errors.phoneNumber}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center gap-4 mt-8">
          <Button
            onClick={handleSubmit}
            disabled={createLoading}
            className="py-3 w-48 rounded-md"
          >
            {createLoading ? "Adding..." : "Add Provider"}
          </Button>
        </div>
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text="You've successfully added a new Provider"
      />
    </Dialog>
  );
}

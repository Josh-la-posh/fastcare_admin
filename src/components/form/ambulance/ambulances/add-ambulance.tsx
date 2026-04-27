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
import {Checkbox} from '@/components/ui/checkbox';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import toast from 'react-hot-toast';
import Success from '../../../../features/modules/dashboard/success';
import {AppDispatch, RootState} from '@/services/store';
import {createAmbulance, fetchAmbulances, fetchAmenities} from '@/services/thunks';

const AMBULANCE_TYPES = ['Emergency', 'Standby'];
const AMENITY_CATEGORIES = ['Medical', 'Safety', 'Comfort'];
const GOOGLE_GEOCODE_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export default function AddAmbulance() {
  const dispatch = useDispatch<AppDispatch>();
  const {amenities, loading: amenitiesLoading} = useSelector(
    (state: RootState) => state.amenities,
  );

  const [openSuccess, setOpenSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [address, setAddress] = useState('');
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [amenityCategory, setAmenityCategory] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [pricePerKm, setPricePerKm] = useState('');
  const [baseRateFee, setBaseRateFee] = useState('');
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setPlateNumber('');
    setType('');
    setLocationInput('');
    setAddress('');
    setSelectedAmenityIds([]);
    setAmenityCategory('');
    setSerialNumber('');
    setPricePerKm('');
    setBaseRateFee('');
  };

  useEffect(() => {
    if (!open) return;
    dispatch(fetchAmenities());
  }, [open, dispatch]);

  const selectedAmenities = useMemo(
    () => amenities.filter(item => selectedAmenityIds.includes(item.id)),
    [amenities, selectedAmenityIds],
  );

  const toggleAmenity = (amenityId: string, checked: boolean) => {
    setSelectedAmenityIds(prev =>
      checked ? [...prev, amenityId] : prev.filter(id => id !== amenityId),
    );
  };

  const geocodeAddress = async (inputAddress: string) => {
    if (!googleMapsApiKey) {
      toast.error('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY');
      return null;
    }

    try {
      setResolvingLocation(true);
      const params = new URLSearchParams({
        address: inputAddress,
        key: googleMapsApiKey,
      });
      const res = await fetch(`${GOOGLE_GEOCODE_BASE_URL}?${params.toString()}`);
      const data = (await res.json()) as {
        status?: string;
        results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>;
      };

      const first = data.results?.[0]?.geometry?.location;
      const latitude = first?.lat;
      const longitude = first?.lng;

      if (data.status !== 'OK' || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        toast.error('Unable to resolve location from address');
        return null;
      }

      const coords = {latitude: Number(latitude), longitude: Number(longitude)};
      setLocationInput(`${coords.latitude}, ${coords.longitude}`);
      return coords;
    } catch {
      toast.error('Failed to fetch location from Google');
      return null;
    } finally {
      setResolvingLocation(false);
    }
  };

  const handleAddressBlur = async () => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) return;
    await geocodeAddress(trimmedAddress);
  };

  const handleSubmit = async () => {
    if (!plateNumber.trim()) {
      toast.error('Plate number is required');
      return;
    }
    if (!type) {
      toast.error('Type is required');
      return;
    }
    if (!address.trim()) {
      toast.error('Address is required');
      return;
    }
    if (!selectedAmenityIds.length) {
      toast.error('Please select at least one amenity');
      return;
    }

    const geocoded = await geocodeAddress(address.trim());
    if (!geocoded) {
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      createAmbulance({
        plateNumber: plateNumber.trim(),
        type,
        address: address.trim(),
        location: geocoded,
        pricePerKm: type === 'Emergency' ? Number(pricePerKm) || 0 : 0,
        baseRateFee: type === 'Emergency' ? 0 : Number(baseRateFee) || 0,
        amenitiesIds: selectedAmenityIds,
      }),
    );
    setSubmitting(false);

    if (createAmbulance.fulfilled.match(result)) {
      setOpen(false);
      setOpenSuccess(true);
      resetForm();
      dispatch(fetchAmbulances());
      return;
    }

    toast.error((result.payload as string) || 'Failed to add ambulance');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="py-3 w-36 rounded-md">Add Ambulance</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader className="border-2 border-[#2693EA] px-4 py-2">
          <DialogTitle className="flex w-full items-center justify-between">
            <span className="text-[#173B5D] text-xl leading-[48px] font-semibold">
              Add Ambulance
            </span>
            <button
              onClick={() => setOpen(false)}
              type="button"
              className="p-1 border border-[#8DBEE5] rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-[#0D4C7E]" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-gray-800">Plate Number</label>
              <input
                value={plateNumber}
                onChange={e => setPlateNumber(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-800">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {AMBULANCE_TYPES.map(item => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-800">Location</label>
              <input
                value={locationInput}
                readOnly
                placeholder={resolvingLocation ? 'Resolving from address...' : 'Will be auto-filled from address'}
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none bg-gray-50"
              />
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-3xl font-semibold text-gray-700">Attach Amenities</h3>
            <div className="h-px bg-gray-200 mt-4 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-800">Equipment Name</label>
                <div className="border border-gray-300 rounded-lg p-3 mt-1 max-h-44 overflow-y-auto space-y-2">
                  {amenitiesLoading ? (
                    <p className="text-sm text-gray-500">Loading amenities...</p>
                  ) : amenities.length ? (
                    amenities.map(item => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedAmenityIds.includes(item.id)}
                          onCheckedChange={checked => toggleAmenity(item.id, checked === true)}
                        />
                        <span className="text-sm text-gray-800">{item.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No amenities available</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-gray-800">Type/Category</label>
                <Select value={amenityCategory} onValueChange={setAmenityCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {AMENITY_CATEGORIES.map(item => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-800">Serial Number</label>
                <input
                  value={serialNumber}
                  onChange={e => setSerialNumber(e.target.value)}
                  className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
                />
              </div>

              {type === 'Emergency' ? (
                <div>
                  <label className="text-gray-800">Price per Kilometer (Emergency Only)</label>
                  <input
                    value={pricePerKm}
                    onChange={e => setPricePerKm(e.target.value)}
                    type="number"
                    min="0"
                    className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
                  />
                </div>
              ) : null}

              {type && type !== 'Emergency' ? (
                <div>
                  <label className="text-gray-800">Base Rate Fee (Standby Only)</label>
                  <input
                    value={baseRateFee}
                    onChange={e => setBaseRateFee(e.target.value)}
                    type="number"
                    min="0"
                    className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <label className="text-gray-800">Address</label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              onBlur={handleAddressBlur}
              className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-start items-center gap-4 mt-8">
          <Button onClick={handleSubmit} className="py-3 w-48 rounded-md" disabled={submitting || resolvingLocation}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        text={`Ambulance ${
          selectedAmenities.length ? `with ${selectedAmenities.length} amenit${selectedAmenities.length > 1 ? 'ies' : 'y'}` : ''
        } created successfully`}
      />
    </Dialog>
  );
}

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
import {Checkbox} from '@/components/ui/checkbox';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import toast from 'react-hot-toast';
import apiClient from '@/services/axiosInstance';
import {AppDispatch, RootState} from '@/services/store';
import {fetchAmbulances, fetchAmenities, getErrorMessage} from '@/services/thunks';
import {Ambulance, Amenity} from '@/types';

type Props = {
  data?: Ambulance & {
    type?: string;
  };
};

const AMBULANCE_TYPES = ['Emergency', 'Standby'];
const GOOGLE_GEOCODE_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export default function EditAmbulance({data}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {amenities, loading: amenitiesLoading} = useSelector(
    (state: RootState) => state.amenities,
  );

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingLocation, setResolvingLocation] = useState(false);

  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [pricePerKm, setPricePerKm] = useState('');
  const [baseRateFee, setBaseRateFee] = useState('');

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
      const geocode = (await res.json()) as {
        status?: string;
        results?: Array<{geometry?: {location?: {lat?: number; lng?: number}}}>;
      };

      const coords = geocode.results?.[0]?.geometry?.location;
      const latitude = coords?.lat;
      const longitude = coords?.lng;

      if (geocode.status !== 'OK' || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        toast.error('Unable to resolve location from address');
        return null;
      }

      const parsed = {latitude: Number(latitude), longitude: Number(longitude)};
      setLocationInput(`${parsed.latitude}, ${parsed.longitude}`);
      return parsed;
    } catch {
      toast.error('Failed to fetch location from Google');
      return null;
    } finally {
      setResolvingLocation(false);
    }
  };

  const getAmenityIdsFromAmbulance = (allAmenities: Amenity[], raw: Ambulance | undefined) => {
    if (!raw?.amenities) return [];
    const names = raw.amenities
      .split(',')
      .map(item => item.trim().toLowerCase())
      .filter(Boolean);
    if (!names.length) return [];

    return allAmenities
      .filter(item => names.includes(item.name.trim().toLowerCase()))
      .map(item => item.id);
  };

  useEffect(() => {
    if (!open) return;
    dispatch(fetchAmenities());
  }, [open, dispatch]);

  useEffect(() => {
    if (!open || !data) return;
    setPlateNumber(data.plateNumber || '');
    setType(data.type || '');
    setAddress(data.address || '');
    setLocationInput(data.location ? `${data.location.latitude}, ${data.location.longitude}` : '');
    setPricePerKm(data.pricePerKm != null ? String(data.pricePerKm) : '');
    setBaseRateFee(data.baseRateFee != null ? String(data.baseRateFee) : '');
    setSelectedAmenityIds(getAmenityIdsFromAmbulance(amenities, data));
  }, [open, data, amenities]);

  const handleAddressBlur = async () => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) return;
    await geocodeAddress(trimmedAddress);
  };

  const toggleAmenity = (amenityId: string, checked: boolean) => {
    setSelectedAmenityIds(prev =>
      checked ? [...prev, amenityId] : prev.filter(id => id !== amenityId),
    );
  };

  const handleSubmit = async () => {
    if (!data?.id) {
      toast.error('Ambulance id is missing');
      return;
    }
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
    if (!geocoded) return;

    setSubmitting(true);
    try {
      await apiClient.put(`/ambulances/${data.id}`, {
        pricePerKm: type === 'Emergency' ? Number(pricePerKm) || 0 : 0,
        baseRateFee: type === 'Emergency' ? 0 : Number(baseRateFee) || 0,
        plateNumber: plateNumber.trim(),
        location: geocoded,
        amenitiesIds: selectedAmenityIds,
        type,
      });

      toast.success('Ambulance updated successfully');
      setOpen(false);
      dispatch(fetchAmbulances());
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update ambulance'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <EditIcon className="w-4 h-4 cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <span className="text-gray-800 text-xl font-normal py-3">Edit Ambulance</span>
            <button
              onClick={() => setOpen(false)}
              type="button"
              className="p-1 border border-gray-300 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-primary" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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

          {type === 'Emergency' ? (
            <div>
              <label className="text-gray-800">Price per Kilometer</label>
              <input
                value={pricePerKm}
                onChange={e => setPricePerKm(e.target.value)}
                type="number"
                min="0"
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="text-gray-800">Base Rate Fee</label>
              <input
                value={baseRateFee}
                onChange={e => setBaseRateFee(e.target.value)}
                type="number"
                min="0"
                className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-gray-800">Location</label>
            <input
              value={locationInput}
              readOnly
              placeholder={resolvingLocation ? 'Resolving from address...' : 'Will be auto-filled from address'}
              className="w-full border-gray-300 border rounded-lg px-3 py-3 mt-1 outline-none bg-gray-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-gray-800">Amenities</label>
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

          <div className="md:col-span-2">
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
    </Dialog>
  );
}

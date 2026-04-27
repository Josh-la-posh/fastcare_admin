import {EyeIcon, X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {useMemo, useState} from 'react';
import {Ambulance} from '@/types';

type Props = {
  data?: Ambulance & {
    type?: string;
  };
};

const formatLocation = (location: Ambulance['location']) => {
  if (!location) return 'N/A';
  return `${location.latitude}, ${location.longitude}`;
};

const formatMoney = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return `$${value.toFixed(2)}`;
};

export default function AmbulanceDetails({data}: Props) {
  const [open, setOpen] = useState(false);

  const ambulanceType = useMemo(() => {
    if (!data) return 'N/A';
    return data.type || data.amenities || 'N/A';
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <EyeIcon className="w-4 h-4 cursor-pointer" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b">
            <span className="text-gray-800 text-xl font-semibold py-3">
              Ambulance Details
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

        {data ? (
          <div className="mt-2 space-y-3">
            {/* <div className="grid grid-cols-2">
              <span className="text-gray-600">Ambulance ID:</span>
              <span className="text-gray-900">{data.id}</span>
            </div> */}
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Plate Number:</span>
              <span className="text-gray-900">{data.plateNumber}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Type:</span>
              <span className="text-gray-900">{ambulanceType}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Status:</span>
              <span className="text-gray-900">{data.status || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Price per Kilometer:</span>
              <span className="text-gray-900">{formatMoney(data.pricePerKm)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Base Rate Fee:</span>
              <span className="text-gray-900">{formatMoney(data.baseRateFee)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Location:</span>
              <span className="text-gray-900">{formatLocation(data.location)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Address:</span>
              <span className="text-gray-900">{data.address || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No details available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

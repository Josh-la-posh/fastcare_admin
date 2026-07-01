import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '@/services/store';
import { fetchDriverBookings, updateBookingStatus } from '@/services/thunks';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Ambulance, User, DollarSign, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mirrors: Pending=1, EnRoute, Arrived, Completed, Cancelled
const STATUS_FLOW: Record<string, string | null> = {
  Pending: 'EnRoute',
  EnRoute: 'Arrived',
  Arrived: 'Completed',
  Completed: null,
  Cancelled: null,
};

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Mark En Route',
  EnRoute: 'Mark Arrived',
  Arrived: 'Mark Completed',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  EnRoute: 'bg-indigo-100 text-indigo-800',
  Arrived: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const Detail = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value ?? '—'}</p>
  </div>
);

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { bookings, loading, updating } = useSelector((s: RootState) => s.driverBookings);
  const booking = bookings.find(b => b.id === id);

  useEffect(() => {
    if (bookings.length === 0) {
      dispatch(fetchDriverBookings({}));
    }
  }, [dispatch, bookings.length]);

  if (loading || (bookings.length === 0 && !booking)) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto px-4 py-5 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <p>Booking not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const currentStatus = booking.status ?? 'Pending';
  const nextStatus = STATUS_FLOW[currentStatus];
  const actionLabel = STATUS_LABELS[currentStatus];
  const statusClass = STATUS_COLORS[currentStatus] ?? 'bg-gray-100 text-gray-700';

  const handleStatusUpdate = () => {
    if (!nextStatus || !id) return;
    dispatch(updateBookingStatus({ id, status: nextStatus }));
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">Booking Detail</h1>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${statusClass}`}>
            {currentStatus}
          </span>
          <span className="text-xs text-gray-400">{booking.dateAssigned ?? booking.creationDate}</span>
        </div>

        {/* Route card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center gap-1">
              <MapPin className="w-4 h-4 text-green-500" />
              <div className="w-0.5 h-6 bg-gray-200" />
              <MapPin className="w-4 h-4 text-red-500" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-gray-800">{booking.pickupAddress ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Drop-off</p>
                <p className="text-sm font-medium text-gray-800">
                  {booking.destinationAddress ?? booking.dropoffAddress ?? '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 col-span-2">
            <User className="w-4 h-4 text-gray-400" />
            <Detail label="Passenger" value={booking.bookingInitiator} />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Ambulance className="w-4 h-4 text-gray-400" />
            <Detail label="Ambulance" value={`${booking.ambulanceNumber ?? '—'} · ${booking.ambulanceType ?? ''}`} />
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <Detail
              label="Amount Paid"
              value={booking.amountPaid != null ? `₦${Number(booking.amountPaid).toLocaleString()}` : undefined}
            />
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-gray-400" />
            <Detail
              label="Distance"
              value={booking.distance != null ? `${Number(booking.distance).toFixed(2)} km` : undefined}
            />
          </div>
          {booking.amenities && (
            <div className="col-span-2">
              <Detail label="Amenities" value={booking.amenities} />
            </div>
          )}
        </div>

        {/* Status update */}
        {nextStatus && actionLabel && (
          <Button
            className="w-full"
            onClick={handleStatusUpdate}
            disabled={updating}
          >
            {updating ? 'Updating…' : actionLabel}
          </Button>
        )}

        {!nextStatus && currentStatus !== 'Cancelled' && (
          <div className="text-center py-3 text-sm text-gray-400">
            This booking is {currentStatus.toLowerCase()}.
          </div>
        )}
      </div>
    </div>
  );
}

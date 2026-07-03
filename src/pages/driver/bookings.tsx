import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/services/store';
import { fetchDriverBookings } from '@/services/thunks';
import { logout } from '@/services/slice/authSlice';
import { ROUTES } from '@/router/routes';
import { MapPin, Clock, LogOut, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import logo from '/images/faslogo.png';

// Mirrors: Pending=1, EnRoute, Arrived, Completed, Cancelled
const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  EnRoute: 'bg-indigo-100 text-indigo-800',
  Arrived: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

// Driver-facing badge label for each stage (states are unchanged)
const STATUS_DISPLAY: Record<string, string> = {
  Pending: 'Pending',
  EnRoute: 'On the way',
  Arrived: 'Arrived',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

// Priority order: active trip first, then pending, down to completed/cancelled.
// Used both for the filter chips and to sort the booking list.
const STATUS_ORDER = ['EnRoute', 'Arrived', 'Pending', 'Completed', 'Cancelled'];
const STATUS_PRIORITY: Record<string, number> = STATUS_ORDER.reduce(
  (acc, status, i) => ({ ...acc, [status]: i }),
  {} as Record<string, number>,
);

type StatusFilter = 'All' | (typeof STATUS_ORDER)[number];
const FILTER_OPTIONS: StatusFilter[] = ['All', ...STATUS_ORDER];

export default function DriverBookings() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { bookings, loading } = useSelector((s: RootState) => s.driverBookings);
  const user = useSelector((s: RootState) => s.auth.user);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  useEffect(() => {
    dispatch(fetchDriverBookings());
  }, [dispatch]);

  // Sort by status priority (active trip → pending → completed), then apply the
  // selected status filter.
  const visibleBookings = useMemo(() => {
    const sorted = [...bookings].sort(
      (a, b) =>
        (STATUS_PRIORITY[a.status ?? ''] ?? 99) - (STATUS_PRIORITY[b.status ?? ''] ?? 99),
    );
    return statusFilter === 'All'
      ? sorted
      : sorted.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.signin);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <img src={logo} alt="FastCare" className="h-8 object-contain" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{user?.firstName}</span>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">My Bookings</h1>
        <p className="text-sm text-gray-500 mb-4">
          {loading
            ? 'Loading…'
            : `${visibleBookings.length} booking${visibleBookings.length !== 1 ? 's' : ''}${
                statusFilter === 'All' ? ' assigned to you' : ''
              }`}
        </p>

        {/* Status filter — active trip first, then pending, down to completed */}
        {!loading && bookings.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 -mx-4 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_OPTIONS.map(option => {
              const label = option === 'All' ? 'All' : STATUS_DISPLAY[option] ?? option;
              const active = statusFilter === option;
              return (
                <button
                  key={option}
                  onClick={() => setStatusFilter(option)}
                  className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🚑</p>
            <p className="font-medium">No bookings assigned yet</p>
          </div>
        )}

        {!loading && bookings.length > 0 && visibleBookings.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">
              No {STATUS_DISPLAY[statusFilter] ?? statusFilter} bookings
            </p>
          </div>
        )}

        <div className="space-y-3">
          {visibleBookings.map(booking => {
            const statusClass = STATUS_COLORS[booking.status ?? ''] ?? 'bg-gray-100 text-gray-700';
            return (
              <button
                key={booking.id}
                onClick={() => navigate(`/driver/bookings/${booking.id}`)}
                className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md active:scale-[0.99] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {booking.bookingInitiator ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ambulance: {booking.ambulanceNumber ?? '—'}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusClass}`}>
                    {STATUS_DISPLAY[booking.status ?? ''] ?? booking.status ?? 'Unknown'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    <span>Pickup: {booking.pickupAddress ?? '—'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    <span>Drop-off: {booking.destinationAddress ?? booking.dropoffAddress ?? '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  {booking.dateAssigned ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{booking.dateAssigned}</span>
                    </div>
                  ) : (
                    <span />
                  )}
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-indigo-600">
                    See detail
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

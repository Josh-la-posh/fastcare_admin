import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { fetchDriverBookings, updateBookingStatus } from '../thunks';
import { AmbulanceRequest, MetaData } from '@/types';

interface DriverBookingsState {
  bookings: AmbulanceRequest[];
  metaData: MetaData | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: DriverBookingsState = {
  bookings: [],
  metaData: null,
  loading: false,
  updating: false,
  error: null,
};

const driverBookingsSlice = createSlice({
  name: 'driverBookings',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDriverBookings.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchDriverBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error('Failed to load bookings');
      })
      .addCase(updateBookingStatus.pending, state => {
        state.updating = true;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.updating = false;
        const { id, status } = action.payload;
        const booking = state.bookings.find(b => b.id === id);
        if (booking) booking.status = status;
        toast.success('Status updated');
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.updating = false;
        toast.error((action.payload as string) ?? 'Failed to update status');
      });
  },
});

export default driverBookingsSlice.reducer;

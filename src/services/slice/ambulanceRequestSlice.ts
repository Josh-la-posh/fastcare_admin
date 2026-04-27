import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AmbulanceRequestState, AmbulanceRequest} from '@/types';
import toast from 'react-hot-toast';
import {fetchAmbulanceRequests} from '../thunks';

const initialState: AmbulanceRequestState = {
  requests: [],
  metaData: null,
  currentRequest: null,
  loading: false,
  error: null,
  selectedRequestId: null,
};

const ambulanceRequestSlice = createSlice({
  name: 'ambulanceRequests',
  initialState,
  reducers: {
    setCurrentRequest: (
      state,
      action: PayloadAction<AmbulanceRequest | null>,
    ) => {
      state.currentRequest = action.payload;
      state.selectedRequestId = action.payload?.id || null;
    },
    setSelectedRequestId: (state, action: PayloadAction<string | null>) => {
      state.selectedRequestId = action.payload;
      // Clear current request if selection changes
      if (!action.payload) {
        state.currentRequest = null;
      }
    },
    clearRequests: state => {
      state.requests = [];
      state.metaData = null;
      state.currentRequest = null;
      state.selectedRequestId = null;
      state.error = null;
    },
    updateRequestInList: (state, action: PayloadAction<AmbulanceRequest>) => {
      const index = state.requests.findIndex(
        req => req.id === action.payload.id,
      );
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
      // Also update current request if it's the same one
      if (state.currentRequest?.id === action.payload.id) {
        state.currentRequest = action.payload;
      }
    },
    removeRequest: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter(req => req.id !== action.payload);
      if (state.currentRequest?.id === action.payload) {
        state.currentRequest = null;
        state.selectedRequestId = null;
      }
    },
    clearErrors: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch all ambulance requests
      .addCase(fetchAmbulanceRequests.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmbulanceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchAmbulanceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error('Failed to fetch ambulance requests');
      });
  },
});

export const {
  setCurrentRequest,
  setSelectedRequestId,
  clearRequests,
  updateRequestInList,
  removeRequest,
  clearErrors,
} = ambulanceRequestSlice.actions;

export default ambulanceRequestSlice.reducer;

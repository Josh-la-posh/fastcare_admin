import { Driver, DriverState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import toast from "react-hot-toast";
import { addDriver, fetchDrivers } from "../thunks";

const initialState: DriverState = {
  drivers: [],
  metaData: null,
  loading: false,
  error: null,
  currentDriver: null,
};

const driverSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    setCurrentDriver: (state, action: PayloadAction<Driver | null>) => {
      state.currentDriver = action.payload;
    },
    clearDrivers: (state) => {
      state.drivers = [];
      state.metaData = null;
      state.currentDriver = null;
      state.error = null;
    },
    updateDriverInList: (state, action: PayloadAction<Driver>) => {
      const index = state.drivers.findIndex(driver => driver.id === action.payload.id);
      if (index !== -1) {
        state.drivers[index] = action.payload;
      }
      if (state.currentDriver?.id === action.payload.id) {
        state.currentDriver = action.payload;
      }
    },
    removeDriver: (state, action: PayloadAction<string>) => {
      state.drivers = state.drivers.filter(driver => driver.id !== action.payload);
      if (state.currentDriver?.id === action.payload) {
        state.currentDriver = null;
      }
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Drivers
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.drivers;
        state.metaData = action.payload.metaData;
        state.error = null;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error("Failed to fetch drivers");
      })
      // Add Driver
      .addCase(addDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers.push(action.payload);
        state.error = null;
        toast.success("Driver added successfully");
      })
      .addCase(addDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error("Failed to add driver");
      });
  },
});

export const {
  setCurrentDriver,
  clearDrivers,
  updateDriverInList,
  removeDriver,
  clearErrors,
} = driverSlice.actions;

export default driverSlice.reducer;

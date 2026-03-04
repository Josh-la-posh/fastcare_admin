import { createSlice  } from "@reduxjs/toolkit";

import toast from "react-hot-toast";

import { createPasswordUser, loginUser, resetPasswordUser } from "../thunks";
import { AuthState } from "@/types";


const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};



const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success("Login successful 🎉");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      // Create Password
      .addCase(createPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPasswordUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(createPasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordUser.fulfilled, (state) => {
        state.loading = false;
        toast.success('Password reset successful');
      })
      .addCase(resetPasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

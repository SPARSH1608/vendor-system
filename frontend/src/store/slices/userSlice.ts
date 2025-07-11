import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersAPI } from "../../services/api";

// Async thunk to fetch users
export const fetchUsers = createAsyncThunk("users/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    const response = await usersAPI.getUsers(params);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch users");
  }
});

// Async thunk to update user role
export const updateUserRole = createAsyncThunk(
  "users/updateUserRole",
  async ({ userId, role }: { userId: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.updateUserRole(userId, { role });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update user role");
    }
  }
);

// Async thunk to toggle user status
export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await usersAPI.toggleUserStatus(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to toggle user status");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
    pagination: {
      current: 1,
      pages: 1,
      total: 0,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index].isActive = action.payload.isActive;
        }
      });
  },
});

export default userSlice.reducer;

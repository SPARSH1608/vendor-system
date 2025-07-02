import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { usersAPI } from "../../services/api"

interface User {
  _id: string
  email: string
  phone: string
  role: "admin" | "vendor" | "user"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UserState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const data = await usersAPI.getUsers()
  return data.data || data
})

export const updateUserRole = createAsyncThunk(
  "users/updateUserRole",
  async ({ userId, role }: { userId: string; role: string }) => {
    const data = await usersAPI.updateUserRole(userId, { role })
    return data.data || data
  },
)

export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async (userId: string) => {
    const data = await usersAPI.toggleUserStatus(userId)
    return data.data || data
  },
)

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch users"
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
  },
})

export const { clearError } = userSlice.actions
export default userSlice.reducer

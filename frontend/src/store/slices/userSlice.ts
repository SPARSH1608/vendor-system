import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface User {
  _id: string
  email: string
  phone: string
  role: "admin" | "vendor" | "user"
  isActive: boolean
  createdAt: string
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
  const response = await fetch("/api/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message)
  return data
})

export const updateUserRole = createAsyncThunk(
  "users/updateUserRole",
  async ({ userId, role }: { userId: string; role: string }) => {
    const response = await fetch(`/api/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ role }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
  },
)

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
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
  },
})

export default userSlice.reducer

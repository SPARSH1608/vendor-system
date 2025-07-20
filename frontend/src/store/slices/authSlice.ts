import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"

interface User {
  _id: string
  email: string
  phone: string
  role: "admin" | "vendor" | "user"
  isActive: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Async thunk to log in a user
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed")
    }
  },
)

// Async thunk to register a user
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, phone }: { name: string; email: string; password: string; phone: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed")
    }
  },
)

// Async thunk to fetch user data
export const fetchUserData = createAsyncThunk("auth/fetchUserData", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Ensure token is retrieved from localStorage
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      },
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to fetch user data")
    }
    return data
  } catch (error: any) {
    return rejectWithValue(error.message || "Server error")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
    },
    clearError: (state) => {
      state.error = null
    },
    updateUserRole: (state, action: PayloadAction<{ role: string }>) => {
      if (state.user) {
        state.user.role = action.payload.role
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem("token", action.payload.token)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem("token", action.payload.token)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, updateUserRole } = authSlice.actions
export default authSlice.reducer

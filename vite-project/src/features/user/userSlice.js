import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAddress } from "../../services/apiGeocoding";

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
    });
  });
}
const initialState = {
  username: "",
  status: "idle",
  position: {},
  address: "",
  error: "",
};

export const fetchAddress = createAsyncThunk(
  "user/fetchAddress",
  async function () {
    try {
      const positionObj = await getPosition();
      const position = {
        latitude: positionObj.coords.latitude,
        longitude: positionObj.coords.longitude,
      };

      const addressObj = await getAddress(position);
      const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

      console.log("Position fetched:", position);
      console.log("Address fetched:", address);

      return { position, address };
    } catch (error) {
      console.error("Error fetching position or address:", error);
      throw error;
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateName(state, action) {
      state.username = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        console.log("Fulfilled payload:", action.payload);

        if (action.payload && action.payload.position) {
          state.position = action.payload.position;
          state.address = action.payload.address;
          state.status = "idle";
        } else {
          state.status = "error";
          state.error = "Invalid data received for position.";
        }
      })
      .addCase(fetchAddress.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      }),
});

export const { updateName } = userSlice.actions;

export default userSlice.reducer;

export const getUsername = (state) => state.username;

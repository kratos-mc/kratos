import { createSlice } from "@reduxjs/toolkit";

export interface ResponseIndicator {
  text?: string;
  subText?: string;
  progress?: number;
}

export interface IndicatorSliceInterface {
  indicators: ResponseIndicator[];
}

const initialState = {
  indicators: [],
};

const IndicatorSlice = createSlice({
  name: "Indicator",
  initialState,
  reducers: {
    setIndicators: (state, action) => {
      state.indicators = action.payload;
    },
  },
});

export const { setIndicators } = IndicatorSlice.actions;

export default IndicatorSlice.reducer;

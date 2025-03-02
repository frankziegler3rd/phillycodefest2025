import { MD3DarkTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#98D8AA",
    secondary: "#77B28C",
    background: "#1A1B1E",
    surface: "#2A2B2E",
    surfaceVariant: "#252628",
    text: "#FFFFFF",
    cardText: "#2A2B2E",
    onSurface: "#FFFFFF",
    disabled: "#757575",
    placeholder: "#9EA0A4",
    error: "#FF6B6B",
    success: "#98D8AA",
  },
  roundness: 16,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: "WorkSans-Regular",
    },
    medium: {
      fontFamily: "WorkSans-Medium",
    },
    light: {
      fontFamily: "WorkSans-Light",
    },
    semiBold: {
      fontFamily: "WorkSans-SemiBold",
    }
  },
};

export default theme;

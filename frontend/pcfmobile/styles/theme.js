import { MD3DarkTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2196F3",
    secondary: "#64B5F6",
    background: "#1E1E1E",
    surface: "#333333",
    text: "#000000",
    onSurface: "#FFFFFF",
    disabled: "#757575",
    placeholder: "#B0BEC5",
    error: "#E57373",
  },
  fonts: {
    ...DefaultTheme.fonts,
    labelLarge: {
      fontFamily: "System",
      fontWeight: "bold", // Use a valid weight (regular, medium, bold)
      fontSize: 16, // Define an explicit font size
    },
  },
};

export default theme;

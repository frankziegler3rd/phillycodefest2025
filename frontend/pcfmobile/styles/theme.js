import { MD3DarkTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#000fc9",
    secondary: "#64B5F6",
    background: "#1E1E1E",
    surface: "#333333",
    text: "#FFFFFF",
    cardText: "#FFFFFF",
    onSurface: "#FFFFFF",
    disabled: "#757575",
    placeholder: "#B0BEC5",
    error: "#E57373",
  },
  fonts: {
    ...DefaultTheme.fonts,
    labelLarge: {
      fontFamily: "System",
      fontWeight: "bold", 
      fontSize: 16,
    },
  },
};

export default theme;

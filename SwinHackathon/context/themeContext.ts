import { Colors } from "@/constants/theme";
import { createContext } from "react";


export const ThemeContext = createContext(
    {
        colors: Colors.light,
        isDark: false,
    }
);



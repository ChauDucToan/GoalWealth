// constants/Colors.ts
export const Colors = {
    light: {
        text: '#10243E',
        textLight: '#F7FBFF',
        textSecondary: '#667A94',
        background: '#289bf6',
        backgroundSoft: '#F8FAFC',
        darkBackground: '#173554',
        card: '#FFFFFF',
        border: '#E6EDF3',
        bottomBarBackground: '#F8FAFC',
        primary: '#289bf6',
        primaryLight: '#F6F9FD',
        primaryDark: '#1A73E8',
        secondary: '#AABDD6',
        
        
        
        success: '#6A927A',
        warning: '#B2955A',
        error: '#B98486',
        shadow: 'rgba(15,23,42,0.08)',
    },
    dark: {
        text: '#F0F8FF',
        textLight: '#0A1E3F',
        textSecondary: '#94B0DA',
        background: '#041428',
        backgroundSoft: '#082040',
        darkBackground: '#000000',
        card: '#0F294A',
        border: '#1A3F6D',
        bottomBarBackground: '#082040',
        primary: '#4DB0F8',
        primaryDark: '#1573FE',
        secondary: '#003B73',
        
        
        success: '#4ADE80',
        warning: '#FDE047',
        error: '#F87171',
        shadow: 'rgba(0,0,0,0.4)',
    }
};

export const Typography = {
    body: 14,
};

export type ColorTheme = typeof Colors.light;
export type AppTypography = typeof Typography;

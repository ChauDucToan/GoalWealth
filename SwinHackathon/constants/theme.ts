// constants/Colors.ts
export const Colors = {
    light: {
        text: '#0A1E3F',
        textLight: '#E5F3FF',
        textSecondary: '#F0F8FF',
        background: '#289bf6',
        backgroundSoft: '#E6F4FF',
        darkBackground: '#0c3a7b',
        card: '#FFFFFF',
        border: '#BCE0FD',
        bottomBarBackground: '#D6EFFF',
        primary: '#289bf6',
        primaryLight: '#E5F3FF',
        primaryDark: '#1573fe',
        secondary: '#82C3FF',
        
        
        
        success: '#22C55E',
        warning: '#FACC15',
        error: '#EF4444',
        shadow: 'rgba(0,0,0,0.1)',
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



export type ColorTheme = typeof Colors.light;
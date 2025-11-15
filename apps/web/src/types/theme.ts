export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textSecondary: string;
    textInverse: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    headingFamily: string;
    monoFamily: string;
    baseFontSize: string;
    headingWeight: string;
    bodyWeight: string;
    letterSpacing: string;
  };
  spacing: {
    base: string;
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
    full: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
    hover: string;
  };
  effects: {
    blur: string;
    gradient?: string;
    pattern?: string;
    transition: string;
  };
}

export type ThemeId =
  | 'minimal-clean'
  | 'brutalist'
  | 'cyberpunk-neon'
  | 'glassmorphism'
  | 'neumorphism'
  | 'material-design'
  | 'terminal-hacker'
  | 'art-deco'
  | 'organic-natural'
  | 'high-contrast'
  | 'pastel-dream'
  | 'industrial-steel'
  | 'nordic-light'
  | 'vaporwave'
  | 'corporate-blue'
  | 'sunset-warm'
  | 'ocean-deep'
  | 'forest-earth'
  | 'cosmic-space'
  | 'paper-vintage';

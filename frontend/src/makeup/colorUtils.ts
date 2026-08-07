/**
 * Converts a HEX color string to an RGB object.
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Converts an RGB object to an RGBA string with the specified opacity.
 */
export const rgbToRgbaString = (r: number, g: number, b: number, a: number): string => {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Converts a HEX string to an RGBA string.
 */
export const hexToRgbaString = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(255, 255, 255, ${alpha})`;
  return rgbToRgbaString(rgb.r, rgb.g, rgb.b, alpha);
};

/**
 * Adjusts the brightness of an RGB color.
 * Positive factor makes it brighter, negative makes it darker.
 * factor is generally between -1.0 and 1.0.
 */
export const adjustBrightness = (r: number, g: number, b: number, factor: number) => {
  const adjust = (c: number) => {
    let newC = c + c * factor;
    return Math.max(0, Math.min(255, Math.round(newC)));
  };
  return { r: adjust(r), g: adjust(g), b: adjust(b) };
};

/**
 * Adjusts the saturation of an RGB color.
 * factor > 1.0 increases saturation, factor < 1.0 decreases saturation.
 */
export const adjustSaturation = (r: number, g: number, b: number, factor: number) => {
  // Simple luminance
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const adjust = (c: number) => {
    let newC = lum + (c - lum) * factor;
    return Math.max(0, Math.min(255, Math.round(newC)));
  };
  return { r: adjust(r), g: adjust(g), b: adjust(b) };
};

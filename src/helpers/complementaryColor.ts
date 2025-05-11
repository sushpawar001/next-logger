export function complementaryColor(hexColor: string) {
    // Remove the '#' symbol if present
    hexColor = hexColor.replace('#', '');
  
    // Convert the hex color to RGB
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
  
    // Calculate the complementary RGB values
    const rComplement = 255 - r;
    const gComplement = 255 - g;
    const bComplement = 255 - b;
  
    // Convert the complementary RGB values back to hex
    const hexComplement = (
      rComplement << 16 | gComplement << 8 | bComplement
    ).toString(16).padStart(6, '0').toUpperCase();
    console.log(hexComplement);
    return `#${hexComplement}`;
  }
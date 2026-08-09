import math

def srgb_to_linear(rgb):
    """
    Convert sRGB (0.0-1.0 scale) to linear RGB (0.0-1.0 scale).
    """
    def decode(c):
        if c <= 0.04045:
            return c / 12.92
        else:
            return math.pow((c + 0.055) / 1.055, 2.4)
    return [decode(rgb[0]), decode(rgb[1]), decode(rgb[2])]


def linear_rgb_to_xyz(linear_rgb):
    """
    Convert linear RGB to CIE XYZ (D65 illuminant).
    """
    r, g, b = linear_rgb
    # Standard sRGB D65 transformation matrix
    x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
    return [x, y, z]


def xyz_to_lab(xyz):
    """
    Convert CIE XYZ to CIE LAB (D65 reference white).
    """
    # D65 Reference White
    xn = 0.95047
    yn = 1.00000
    zn = 1.08883
    
    x, y, z = xyz
    x /= xn
    y /= yn
    z /= zn
    
    def f(t):
        if t > (6.0/29.0)**3:
            return math.pow(t, 1.0/3.0)
        else:
            return (1.0/3.0) * ((29.0/6.0)**2) * t + (4.0/29.0)
            
    fx = f(x)
    fy = f(y)
    fz = f(z)
    
    L = 116.0 * fy - 16.0
    a = 500.0 * (fx - fy)
    b = 200.0 * (fy - fz)
    
    return [L, a, b]


def srgb_to_lab(rgb):
    """
    Wrapper: sRGB (0-255) -> Linear RGB -> XYZ -> LAB
    """
    return xyz_to_lab(linear_rgb_to_xyz(srgb_to_linear(rgb)))


def delta_e_2000(lab1, lab2):
    """
    Calculate CIEDE2000 color difference between two LAB colors.
    Implementation matches the standard formulation.
    """
    L1, a1, b1 = lab1
    L2, a2, b2 = lab2
    
    # Weight factors
    kL = 1.0
    kC = 1.0
    kH = 1.0
    
    C1 = math.sqrt(a1**2 + b1**2)
    C2 = math.sqrt(a2**2 + b2**2)
    Cbar = (C1 + C2) / 2.0
    
    G = 0.5 * (1.0 - math.sqrt((Cbar**7) / (Cbar**7 + 25.0**7)))
    
    a1_prime = (1.0 + G) * a1
    a2_prime = (1.0 + G) * a2
    
    C1_prime = math.sqrt(a1_prime**2 + b1**2)
    C2_prime = math.sqrt(a2_prime**2 + b2**2)
    Cbar_prime = (C1_prime + C2_prime) / 2.0
    
    # Calculate h1_prime
    if C1_prime == 0 and b1 == 0:
        h1_prime = 0.0
    else:
        h1_prime = math.degrees(math.atan2(b1, a1_prime))
        if h1_prime < 0:
            h1_prime += 360.0
            
    # Calculate h2_prime
    if C2_prime == 0 and b2 == 0:
        h2_prime = 0.0
    else:
        h2_prime = math.degrees(math.atan2(b2, a2_prime))
        if h2_prime < 0:
            h2_prime += 360.0
            
    dL_prime = L2 - L1
    dC_prime = C2_prime - C1_prime
    
    # Calculate dh_prime
    if C1_prime * C2_prime == 0:
        dh_prime = 0.0
    else:
        dh = h2_prime - h1_prime
        if abs(dh) <= 180.0:
            dh_prime = dh
        elif dh > 180.0:
            dh_prime = dh - 360.0
        else:
            dh_prime = dh + 360.0
            
    dH_prime = 2.0 * math.sqrt(C1_prime * C2_prime) * math.sin(math.radians(dh_prime / 2.0))
    
    Lbar_prime = (L1 + L2) / 2.0
    
    # Calculate hbar_prime
    if C1_prime * C2_prime == 0:
        hbar_prime = h1_prime + h2_prime
    else:
        dh = h1_prime - h2_prime
        if abs(dh) <= 180.0:
            hbar_prime = (h1_prime + h2_prime) / 2.0
        elif h1_prime + h2_prime < 360.0:
            hbar_prime = (h1_prime + h2_prime + 360.0) / 2.0
        else:
            hbar_prime = (h1_prime + h2_prime - 360.0) / 2.0
            
    T = 1.0 - 0.17 * math.cos(math.radians(hbar_prime - 30.0)) \
            + 0.24 * math.cos(math.radians(2.0 * hbar_prime)) \
            + 0.32 * math.cos(math.radians(3.0 * hbar_prime + 6.0)) \
            - 0.20 * math.cos(math.radians(4.0 * hbar_prime - 63.0))
          
    dTheta = 30.0 * math.exp(-((hbar_prime - 275.0) / 25.0)**2)
    RC = 2.0 * math.sqrt((Cbar_prime**7) / (Cbar_prime**7 + 25.0**7))
    RT = -math.sin(math.radians(2.0 * dTheta)) * RC
    
    SL = 1.0 + ((0.015 * (Lbar_prime - 50.0)**2) / math.sqrt(20.0 + (Lbar_prime - 50.0)**2))
    SC = 1.0 + 0.045 * Cbar_prime
    SH = 1.0 + 0.015 * Cbar_prime * T
    
    dE = math.sqrt(
        (dL_prime / (kL * SL))**2 +
        (dC_prime / (kC * SC))**2 +
        (dH_prime / (kH * SH))**2 +
        RT * (dC_prime / (kC * SC)) * (dH_prime / (kH * SH))
    )
    
    return dE


if __name__ == '__main__':
    # CIEDE2000 Sharma et al. (2005) Test Data subset
    pairs = [
        ([50.0, 2.6772, -79.7751], [50.0, 0.0, -82.7485], 2.0425),
        ([50.0, 3.1571, -77.2803], [50.0, 0.0, -82.7485], 2.8615),
        ([50.0, 2.8361, -74.0200], [50.0, 0.0, -82.7485], 3.4412),
        ([50.0, -1.3802, -84.2814], [50.0, 0.0, -82.7485], 1.0000),
        ([50.0, -1.1848, -84.8006], [50.0, 0.0, -82.7485], 1.0000),
        ([50.0, -0.9009, -85.5211], [50.0, 0.0, -82.7485], 1.0000),
        ([50.0, 0.0, 0.0], [50.0, -1.0, 2.0], 2.3669),
        ([50.0, 2.5, 0.0], [73.0, 25.0, -18.0], 27.1492),
        ([50.0, 2.5, 0.0], [61.0, -5.0, 29.0], 22.8977),
        ([50.0, 2.5, 0.0], [56.0, -27.0, -27.0], 34.0919),
        ([50.0, 2.5, 0.0], [58.0, 24.0, 15.0], 19.4535),
    ]
    
    passed = 0
    for lab1, lab2, expected in pairs:
        res = delta_e_2000(lab1, lab2)
        diff = abs(res - expected)
        if diff < 0.0001:
            passed += 1
        else:
            print(f"Failed! Expected: {expected}, Got: {res}")
            
    print(f"Passed {passed}/{len(pairs)} Sharma tests.")

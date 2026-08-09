# STAGE 5.3 — REAL-CHROME QUANTITATIVE VALIDATION REPORT

## 1. Experimental Setup
- **Hardware/Camera:** `[PENDING]`
- **Browser:** `[PENDING]`
- **Foundation Tested:** `[PENDING]`
- **Product HEX:** `[PENDING]`

### Lighting Conditions Tested
Minimum 30 valid frames captured per condition:
- [ ] **A. Neutral Indoor**
- [ ] **B. Warm Lighting**
- [ ] **C. Cool Lighting**
- [ ] **D. Strong Side Lighting**
- [ ] **E. Partial Facial Shadow**

---

## 3. Albedo Stability Audit
*(Values represent R,G,B standard deviations over 30 valid frames)*

| Lighting Condition | Raw StdDev | Trimmed StdDev | EMA StdDev |
| :--- | :--- | :--- | :--- |
| A. Neutral Indoor | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| B. Warm Lighting | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| C. Cool Lighting | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| D. Strong Side | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| E. Partial Shadow | `[PENDING]` | `[PENDING]` | `[PENDING]` |

**Observation:** `[Does EMA demonstrably improve stability?]`

---

## 4. Illumination Estimation Audit
*(ONNX predicted [R, G, B] frame-to-frame stability)*

| Lighting Condition | Mean Illumination | StdDev Illumination | Min/Max Range |
| :--- | :--- | :--- | :--- |
| A. Neutral Indoor | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| B. Warm Lighting | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| C. Cool Lighting | `[PENDING]` | `[PENDING]` | `[PENDING]` |

**Observation:** `[Is neural estimation stable under fixed lighting?]`

---

## 5. Shade Matching Audit

| Lighting Condition | User Lab | Product Lab | $\Delta E_{00}$ | CIEDE2000 Rank | Legacy RGB Rank |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A. Neutral Indoor | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| B. Warm Lighting | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |

**Observation:** `[Does CIEDE2000 produce a perceptually better/more stable ranking?]`

---

## 6. Foundation Mask Validation
*(Via `window.DEBUG_FOUNDATION_MASK`)*

- [ ] Skin appropriately included
- [ ] Eyes excluded
- [ ] Lips excluded
- [ ] Eyebrows excluded
- [ ] Hair excluded
- [ ] Glasses excluded (where detectable)

| Metric | Value |
| :--- | :--- |
| maskAreaRatio | `[PENDING]` |
| faceAreaRatio | `[PENDING]` |
| maskToFaceRatio | `[PENDING]` |

---

## 7. Coordinate Validation
*(Verify mask alignment against rapid movement)*

- [ ] Left / Right Translation
- [ ] Up / Down Translation
- [ ] Z-axis Scaling (Closer/Farther)
- [ ] Pitch / Yaw Rotation

**Observation:** `[Does the mask drift from the facial boundaries? Check coordinate scaling logic]`

---

## 8. Compositing A/B Test

| Mode | Visual Fidelity | Texture Preservation | Luminance Preservation |
| :--- | :--- | :--- | :--- |
| `multiply` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| `soft-light` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| `overlay` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| *Legacy* | `[PENDING]` | `[PENDING]` | `[PENDING]` |

**Selected Method:** `[PENDING]`

---

## 9. Foundation Color Error Classification
*(Based on $\Delta E_{00}$)*

- **Neutral Indoor:** `[EXCELLENT / GOOD / MODERATE / POOR]`
- **Warm Lighting:** `[EXCELLENT / GOOD / MODERATE / POOR]`
- **Cool Lighting:** `[EXCELLENT / GOOD / MODERATE / POOR]`

**Root Cause for Error $>5$:** `[A. Illumination | B. Sampling | C. Product Metadata | D. Matching]`

---

## 10. Camera / Display Effect
Where does visual mismatch occur?
- [ ] A. Before rendering (Camera sensor ISP bias)
- [ ] B. After rendering (Canvas composite math)
- [ ] C. Display gamut discrepancy

---

## 11. Error Attribution

| Component | Error Observed | Severity | Evidence |
| :--- | :--- | :--- | :--- |
| IlluminationNet | `[PENDING]` | `[LOW/MED/HIGH]` | `[Data point]` |
| Skin Sampling | `[PENDING]` | `[LOW/MED/HIGH]` | `[Data point]` |
| CIEDE2000 | `[PENDING]` | `[LOW/MED/HIGH]` | `[Data point]` |
| Foundation Mask | `[PENDING]` | `[LOW/MED/HIGH]` | `[Data point]` |
| Coordinates | `[PENDING]` | `[LOW/MED/HIGH]` | `[Data point]` |
| Color Transfer | `[PENDING]` | `[LOW/MED/HIGH]` | `[Data point]` |
| Camera/Display | `[PENDING]` | `[LOW/MED/HIGH]` | `[Data point]` |

---

## 12. IEEE Experiment Table

| Method | Average Color Error ($\Delta E_{00}$) | Temporal Stability (StdDev) | Runtime (ms/frame) |
| :--- | :--- | :--- | :--- |
| Baseline RGB + Mean | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| Trimmed Mean + RGB | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| Trimmed Mean + CIEDE2000 | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| Trimmed Mean + CIEDE2000 + EMA | `[PENDING]` | `[PENDING]` | `[PENDING]` |

---

## 13. Retraining Decision

**Verdict: [PENDING]**

*Retraining is only justified if IlluminationNet is proven quantitatively incapable of stable estimation across diverse lighting, independent of masking and rendering bugs.*

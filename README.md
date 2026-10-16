# Isotope Effect Calculator

A self-contained website that estimates an equilibrium isotope separation factor from two effective molar masses, two force constants, and temperature, using a harmonic zero-point-energy (ZPE) approximation.



## Inputs

| Input | Meaning | Unit | Illustrative default |
| --- | --- | --- | --- |
| m_L | Effective molar mass of the light isotopologue | g/mol | 6 |
| m_H | Effective molar mass of the heavy isotopologue | g/mol | 7 |
| F_A | Force constant in reference state A | N/m | 100 |
| F_B | Force constant in comparison state B | N/m | 200 |
| T | Absolute temperature | K | 298.15 |

All inputs must be finite and greater than zero; `m_H >= m_L`. Equal masses are allowed as a zero-effect check. State A and state B mean two environments or phases, not necessarily electronic states. The same effective mass pair is used for both environments, and each force constant is shared by both isotopes. Defaults are illustrative and are not measured force constants or precise isotope masses.

For a diatomic stretch, enter the reduced molar mass for each isotopologue:

$$\mu = \frac{m_1m_2}{m_1+m_2}.$$

For a general vibration, the effective mass depends on the mode coordinate and must be consistent with its force constant. It need not equal the bare isotope mass. If effective masses differ between environments, a more general model is needed.

## Equations and sign convention

Let `i = L, H` denote light and heavy, and `s = A, B` denote the two environments.

Convert the numerical molar mass in g/mol to a mass in kg per oscillator:

$$M_i = \frac{m_i\times 10^{-3}}{N_A}.$$

Multiplying by `10^-3` alone converts to kg/mol, not kg per oscillator.

The zero-point energy and its molar equivalent are:

$$E_{i,s}=\frac{\hbar}{2}\sqrt{\frac{F_s}{M_i}}, \qquad G_{i,s}\approx N_A E_{i,s}.$$

Here `G` denotes the standard molar free-energy contribution approximated by the ZPE. For the isotope exchange

$$H_A+L_B\rightleftharpoons H_B+L_A,$$

define

$$\Delta\Delta G=(G_{H,B}-G_{H,A})-(G_{L,B}-G_{L,A}).$$

The separation factor is explicitly defined as

$$\alpha_{B/A}=\frac{(H/L)_B}{(H/L)_A}\approx\exp\left(-\frac{\Delta\Delta G_{\mathrm{ZPE}}}{RT}\right).$$

The ratios are activity ratios, or composition ratios under ideal mixing. Thus `alpha > 1` means heavy-isotope enrichment in B relative to A. `alpha < 1` means heavy-isotope enrichment in A. Reversing the state labels gives the reciprocal factor. This convention is retained even when the factor is less than one; the calculator does not force it to be at least one.

The equivalent compact expression is

$$\ln\alpha_{B/A}=\frac{\hbar}{2k_B T}\left(\sqrt{F_B}-\sqrt{F_A}\right)\left(\frac{1}{\sqrt{M_L}}-\frac{1}{\sqrt{M_H}}\right).$$

The implementation uses algebraically rationalized differences to reduce cancellation when the two masses or force constants are close. It retains `ln(alpha)` when exponentiation would overflow or underflow. Displayed values are rounded; the calculation uses double precision.

## Reference result

For `m_L = 6`, `m_H = 7` g/mol, `F_A = 100`, `F_B = 200` N/m, and `T = 298.15 K`:

| Quantity | Value |
| --- | --- |
| M_L | 9.96323440304308 × 10^-27 kg |
| M_H | 1.16237734702169 × 10^-26 kg |
| ΔΔG_ZPE | -97.7479039310919 J/mol |
| ln(alpha_B/A) | 0.0394310602256668 |
| alpha_B/A | 1.04021878396476 |
| alpha_A/B | 0.961336226008662 |

The heavy isotope favors the stiffer environment B in this ZPE-only example. These numerical reference values were independently calculated using 60-digit decimal arithmetic.

## Scientific scope

This model includes one effective harmonic vibration per environment and only its ZPE contribution to isotope-exchange free energy. It omits thermally populated vibrational levels, other modes, rotational and translational contributions, anharmonicity, and nonideal activities. It is an equilibrium approximation, not a kinetic isotope effect or a prediction of device separation performance. Omitted terms may alter both the magnitude and direction of measured fractionation.

Temperature enters the Boltzmann factor, while the ZPE itself is temperature independent. The displayed `1/T` dependence of `ln(alpha)` is specific to the ZPE-only approximation. At temperatures where vibrational excitation matters, full partition functions are needed for a quantitative equilibrium prediction.

For multiple independent modes, sum their contributions to `DeltaDeltaG` before exponentiating. No finite-temperature partition-function correction is implemented here.

Constants: `h = 6.62607015e-34 J s`, `N_A = 6.02214076e23 mol^-1`, `k_B = 1.380649e-23 J/K`, `c = 299792458 m/s`, `hbar = h/(2*pi)`, and `R = N_A*k_B`. The SI defining values are exact; floating-point computation is approximate. References: [NIST constants](https://physics.nist.gov/cuu/Constants/) and [IUPAC isotopic fractionation factor](https://goldbook.iupac.org/terms/view/I03343).

## Included features and files

- Five labeled inputs with live updates and validation.
- Separation factor, reverse factor, molar exchange ZPE, `ln(alpha)`, and `1000 ln(alpha)`.
- Four isotope/state ZPEs, converted masses, and vibrational wavenumbers.
- Temperature-dependence plot, explicit equations, and scientific assumptions.
- CSV export, copyable summary, state-swap and reset controls, and mobile layout.
- Native MathML equations, with no remote fonts, analytics, or dependencies.

`index.html` is the complete website. `README.md` is this guide. `model.test.cjs` contains optional calculation tests. Run the tests with Node.js:

```sh
node --test model.test.cjs
```

The tests require no packages and are not needed to host or use the calculator.

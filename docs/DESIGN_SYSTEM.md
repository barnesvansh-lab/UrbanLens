# URBANLENS DESIGN SYSTEM SPECIFICATION
## The Urban Intelligence Atlas
**Document Version:** 2.0.0  
**Design System Name:** Urban Intelligence Atlas Design System  
**Framework Foundation:** React 18, Vite 6, TypeScript 5.7, Tailwind CSS v4  

---

## 1. Brand Philosophy & Positioning

UrbanLens is positioned as a **modern urban intelligence atlas**:
> *"See the city differently."*

The visual identity deliberately rejects the generic look of SaaS admin templates (slate canvases, neon blue pills, repetitive widget cards). Instead, it adopts the elegance, gravitas, and legibility of an **architectural monograph** and a **cartographic atlas**.

---

## 2. Color Palette (The Atlas Palette)

The system is built on a coherent, restrained 6-token natural palette:

| Token Name | Hex Code | Role & Semantic Application | Contrast Ratio (on Ivory) |
| :--- | :--- | :--- | :--- |
| **Warm Ivory** | `#F4F1E9` | Page background canvas, editorial foundation | Canvas (1:1) |
| **Pure Paper** | `#FAF8F5` | Elevated surfaces, card interiors, panel backgrounds | Surface (1.05:1) |
| **Deep Forest** | `#183D35` | Primary brand accent, top navigation, dominant headers, primary buttons | 9.8:1 (AAA) |
| **Terracotta** | `#C56C4B` | Focal accents, active navigation states, callouts, warning indicators | 4.6:1 (AA) |
| **Stone** | `#D9D5CA` | Architectural dividers, subtle borders, range sliders, neutral chips | Structure (1.3:1) |
| **Charcoal** | `#252B29` | Primary typography, body text, high-contrast values | 11.4:1 (AAA) |
| **Muted Sage** | `#9EAA9C` | Secondary metadata, labels, chart gridlines, subtle fills | 3.2:1 (Large text AA) |

### Semantic Chart Tints
* Primary Historical Series: `Deep Forest` (`#183D35`)
* Projected Trajectory Series: `Terracotta` (`#C56C4B`)
* Confidence Interval Shading: `Terracotta` with 15% opacity (`#C56C4B26`)
* Baseline Reference Series: `Charcoal` (`#252B29`)
* Sub-market Comparisons: `Soft Clay` (`#7D6355`), `Warm Ochre` (`#B48448`), `Muted Sage` (`#9EAA9C`)

---

## 3. Typography Hierarchy

### Font Families
1. **Editorial Headlines:** `'Playfair Display', Georgia, serif`
2. **Body & Controls:** `'Inter', ui-sans-serif, system-ui, sans-serif`
3. **Financial Figures & Metrics:** `ui-monospace, 'SF Mono', monospace` with `.tabular-nums`

### Scale & Tracking
* **Hero Title:** `font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]`
* **Section Heading:** `font-serif text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight`
* **Card Title:** `font-serif text-lg font-semibold text-charcoal`
* **Body Text:** `font-sans text-sm text-charcoal/80 leading-relaxed`
* **Metadata Labels:** `font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-sage`
* **Financial Numerals:** `font-mono text-2xl font-bold tracking-tight text-charcoal tabular-nums`

---

## 4. Spacing, Borders, and Elevation

* **Borders:** Thin, crisp architectural strokes `border border-stone/70` (no heavy shadows or thick borders).
* **Corner Radii:** Restrained rounding: `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons, `rounded-full` for badges.
* **Shadows:** Minimal soft shadows: `shadow-xs` (`0 1px 2px rgba(24, 61, 53, 0.05)`).
* **Spacing Rhythm:** Generous vertical pacing between sections (`space-y-10`, `py-8 sm:py-10`).

---

## 5. Three-Level Information Disclosure Architecture

Every analytical view implements progressive disclosure:

1. **Level 1 (Default Everyday View):**
   * Human-first language: *"Average annual housing price growth: +5.2%"*.
   * Prominent visual charts and honest summary verdicts.
2. **Level 2 (One-Click Accordion / Tab):**
   * Data sources, time ranges, and underlying assumptions.
   * Prominence of institutional data vs. synthetic test demarcations.
3. **Level 3 (Advanced Methodology Panel):**
   * Algorithmic formulas, Z-score thresholds, econometric SARIMA coefficients, and out-of-sample MAE/RMSE comparisons.

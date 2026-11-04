# UrbanLens — Project Abstract

**Project Title**: UrbanLens: An Urban Market Intelligence and Housing Affordability Analytics Platform  
**Academic Degree**: Bachelor of Technology (B.Tech) in Computer Science & Engineering  
**Academic Year**: 2025–2026  
**Candidate**: Vansh Barnes  
**Institution**: Department of Computer Science & Engineering  

---

### Abstract

Urban housing markets in developing economies, particularly India, are characterized by acute information asymmetry, fragmented empirical data, and opaque commercial advisory tools. Mainstream commercial real-estate platforms are overwhelmingly structured around advertiser lead generation, frequently presenting unverified promoter asking rates as objective market valuations. Furthermore, consumer mortgage calculators universally rely on simplified linear interest formulas that disregard statutory acquisition expenses (stamp duty, registration caps), recurring maintenance overheads, differential inflation, and the opportunity cost of down-payment equity.

To address these systemic deficiencies, this project presents **UrbanLens**, a modular, transparent, web-based Urban Market Intelligence and Housing Affordability Analytics Platform engineered without commercial marketplace features, broker listings, or promotional transactions. UrbanLens integrates four specialized analytical modules:

1. **Urban Market Intelligence**: Automated ingestion, quality assurance, and econometric evaluation of 15 years (2010–2025, 60 quarters) of Reserve Bank of India (RBI) All-India and 10-city metropolitan House Price Index (HPI) records, providing historical compound annual growth rates (CAGR) and baseline forecasting models.
2. **Neighborhood Spatial Intelligence**: Hyper-local spatial density mapping and accessibility profiling across South Mumbai sub-regions (Colaba, Fort, Malabar Hill, Grant Road) utilizing point-in-time OpenStreetMap (OSM) civic amenity extracts, polygon boundaries, and Haversine distance computations.
3. **Urban Transformation Intelligence**: A multi-indicator econometric anomaly and evidence-sufficiency engine tracking 14 indicators across 8 domains (housing, demographics, commercial activity, transit, building stock, civic infrastructure, socio-economic signals, and public investments), utilizing rolling Z-score ($\ge 2.0\sigma$) and Interquartile Range (IQR $1.5\times$) outlier detection while enforcing an unequivocal `INSUFFICIENT EVIDENCE` verdict against unsubstantiated gentrification claims.
4. **Housing Affordability Intelligence**: A high-precision financial calculation engine implementing standard reducing-balance monthly loan amortization, L'Hôpital zero-interest limits, Maharashtra statutory closing fee modeling (6% stamp duty, ₹30,000 registration cap), true monthly cost of homeownership normalization, rent-versus-buy cash-flow equivalence wealth trajectories, and household Fixed Obligation to Income Ratio (FOIR) dual-constraint property budgeting.

The software is implemented using a lightweight, decoupled architecture comprising a React 19 + TypeScript + Vite + Tailwind CSS + Recharts + React Leaflet frontend; an Express + TypeScript API gateway; and Python statistical validation modules. Built for an entry-level development environment (MacBook Air M2, 8 GB RAM), the system eliminates heavyweight database engines in favor of auditable flat-file CSV and JSON repositories with JSON schema quality manifests.

The system is validated through an exhaustive **248-test automated test suite** (172 Python + 40 Express API + 36 Affordability API tests) and **3 build compilation gates**, achieving a verified **100% pass rate** across all capabilities.

---

**Keywords**: Urban Analytics, Housing Affordability, Real Estate Economics, Reserve Bank of India HPI, OpenStreetMap, Spatial Density, Anomaly Detection, Gentrification Evidence Engine, Mortgage Amortization, Cash-Flow Equivalence.

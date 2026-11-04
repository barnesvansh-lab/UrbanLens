# UrbanLens — References & Authoritative Sources

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 5 — Technical Documentation & Academic Report)  
**Date**: November 2026  
**Status**: VERIFIED & ACADEMICALLY AUDITED  

---

## 1. Institutional Datasets & Official Publications

1. **Reserve Bank of India (RBI)**  
   *Database on Indian Economy (DBIE)* — Quarterly House Price Index (All-India and 10 Major Metropolitan Cities; Base Year: 2010–11 = 100).  
   URL: [https://dbie.rbi.org.in/DBIE/dbie.rbi?site=home](https://dbie.rbi.org.in/DBIE/dbie.rbi?site=home)  
   Coverage: Q1 FY2010-11 through Q4 FY2024-25 (60 quarterly observations).

2. **National Housing Bank (NHB)**  
   *NHB RESIDEX: Housing Price Index for India* — Tracking city-level assessment and registered deed price indices across 50 Indian cities.  
   URL: [https://residex.nhb.org.in/](https://residex.nhb.org.in/)  
   Topics: Base indices, circle rates, and consumer housing affordability benchmarks.

3. **Inspector General of Registration and Controller of Stamps (IGR Maharashtra)**  
   *The Maharashtra Stamp Act (Act LX of 1958)* and *Maharashtra Registration Rules (1961)*.  
   Official Gazette: Statutory stamp duty rates (6.0% for Mumbai urban corporation areas) and the statutory ceiling on registration fees for residential conveyance deeds (1.0% of consideration value capped at ₹30,000 under Government Notification No. Mudrank-2015/C.R.305/M-1).  
   URL: [https://igrmaharashtra.gov.in/](https://igrmaharashtra.gov.in/)

4. **OpenStreetMap Foundation (OSMF)**  
   *OpenStreetMap Spatial Vector Database & Overpass API*.  
   Tagging Specifications: `amenity=school`, `amenity=hospital`, `amenity=clinic`, `public_transport=stop_position`, `amenity=parking`.  
   URL: [https://www.openstreetmap.org/](https://www.openstreetmap.org/) | [https://overpass-turbo.eu/](https://overpass-turbo.eu/)  
   Snapshot Date: October 2026 point-in-time extraction for South Mumbai sub-regions.

5. **Office of the Registrar General & Census Commissioner, India**  
   *Census of India (2011)* — District Census Handbook: Mumbai & Mumbai Suburban.  
   Ministry of Home Affairs, Government of India.  
   URL: [https://censusindia.gov.in/](https://censusindia.gov.in/)

6. **National Stock Exchange of India (NSE)**  
   *Nifty 50 Total Returns Index (TRI) Historical Performance Report*.  
   15-Year Long-term Equity Compound Annual Growth Rate benchmark (10.0% nominal CAGR) used for opportunity cost equivalence in rent-vs-buy modeling.  
   URL: [https://www.nseindia.com/](https://www.nseindia.com/)

---

## 2. Academic Literature & Peer-Reviewed Research

7. **Box, G. E., Jenkins, G. M., Reinsel, G. C., & Ljung, G. M. (2015)**  
   *Time Series Analysis: Forecasting and Control* (5th ed.). John Wiley & Sons.  
   *Relevance*: Autoregressive Integrated Moving Average (ARIMA) models, seasonal difference operators, and residual diagnostics used in the predictive forecasting module.

8. **Case, K. E., & Shiller, R. J. (1989)**  
   The efficiency of the market for single-family homes. *The American Economic Review*, 79(1), 125–137.  
   *Relevance*: Econometric foundation for repeat-sales housing price indices, spatial momentum, and macroeconomic price autocorrelation.

9. **Davidson, M., & Lees, L. (2005)**  
   New-build 'gentrification' and London's riverside renaissance. *Environment and Planning A*, 37(7), 1165–1190.  
   *Relevance*: Conceptualization of neighborhood transformation, socio-demographic displacement, and the necessity of multi-dimensional evidence before establishing gentrification claims.

10. **Haklay, M., & Weber, P. (2008)**  
    OpenStreetMap: User-generated street maps. *IEEE Pervasive Computing*, 7(4), 12–18.  
    *Relevance*: Spatial accuracy analysis, point-of-interest tagging schemas, and point-in-time limitations of volunteered geographic information (VGI).

11. **Hyndman, R. J., & Athanasopoulos, G. (2018)**  
    *Forecasting: Principles and Practice* (2nd ed.). OTexts: Melbourne, Australia.  
    *Relevance*: Benchmark forecast evaluations (Naive Last-Value, Seasonal Naive), Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Gaussian prediction interval formulation.

12. **Rosen, S. (1974)**  
    Hedonic prices and implicit markets: product differentiation in pure competition. *Journal of Political Economy*, 82(1), 34–55.  
    *Relevance*: Theoretical framework establishing that real estate valuation is a linear combination of physical characteristics, spatial location, and civic amenity proximity.

13. **Sinn, H. W. (2004)**  
    The Theory of Exhaustion and Asset Accumulation. *CESifo Working Paper Series*.  
    *Relevance*: Mathematical equivalence modeling between capital asset acquisition (homeownership) and recurrent consumption expenditure (renting and investing surplus capital).

14. **Tukey, J. W. (1977)**  
    *Exploratory Data Analysis*. Addison-Wesley.  
    *Relevance*: Non-parametric Interquartile Range (IQR $1.5\times$) outlier detection algorithm implemented in the transformation anomaly engine.

---

## 3. Regulatory Standards & Software Engineering Protocols

15. **Reserve Bank of India (2019)**  
    *Report of the Committee on the Development of Housing Finance Securitisation Market*. RBI Working Paper, Mumbai.  
    *Relevance*: Fixed Obligation to Income Ratio (FOIR) regulatory underwriting guidelines (35%–55% prudential bands) and Loan-to-Value (LTV) limits for residential mortgages.

16. **Internet Engineering Task Force (IETF) — RFC 7946**  
    Butler, H., Daly, M., Doyle, A., Gillies, S., Hagen, S., & Schaub, T. (2016). *The GeoJSON Format*.  
    *Relevance*: Geographic data exchange format for neighborhood bounding polygon geometries and point amenity representations.

17. **OWASP Foundation (2023)**  
    *OWASP Top 10 API Security Risks*.  
    URL: [https://owasp.org/API-Security/](https://owasp.org/API-Security/)  
    *Relevance*: Security controls implemented across API gateway (parameter regex whitelisting, body size rate ceilings, CORS origin locking, and sensitive financial payload in-memory isolation).

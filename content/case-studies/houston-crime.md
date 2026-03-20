# Houston Crime Type Classification (2010–2024)

## Problem
Classify offense type using historical Houston crime records and evaluate generalization by holding out the most recent year.

## Data
- Time range: 2010–2024
- Target: offense category/description
- Features: date/time components, location features, engineered categorical variables

## Approach
- Train/validation via cross-validation (pre-2024)
- Compare ≥3 models (e.g., Logistic Regression, Random Forest, XGBoost/LightGBM)
- Tune hyperparameters and evaluate with accuracy/precision/recall/AUC where applicable

## Results
- Best model on non-holdout data: **(fill in)**
- 2024 holdout performance: **(fill in)**

## What I’d improve
- Better feature enrichment (weather, events, socioeconomic data)
- Calibration + thresholding for top classes

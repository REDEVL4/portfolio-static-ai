# Houston Crime Type Classification (2010-2024)

## Problem
Crime prediction is often reported with random train-test splits that leak temporal information and overstate model quality. I wanted to build a realistic crime classification workflow using a large Houston dataset and preserve forecasting discipline by holding out the most recent year.

## Dataset
- Roughly 3.6 million Houston crime records
- Time span: 2010 through 2024
- Target: NIBRS offense categories

## What I Built
- A standardization pipeline that merged three differently formatted source datasets into one modeling-ready table
- Cleaning logic for schema harmonization across yearly and monthly source files
- Feature engineering for Beat, Premise, Month, Weekday, and Hour Group
- Logic to split multi-label crime-type entries into separate observations for higher-fidelity modeling
- A realistic evaluation setup using 2024 as a true temporal holdout

## Modeling
- Compared MLP, Random Forest, and K-Nearest Neighbors
- Used 3-fold stratified cross-validation on pre-2024 data
- Selected the best model based on non-holdout validation performance before testing on 2024

## Results
- Best holdout model: `MLPClassifier`
- 2024 temporal holdout accuracy: `29.37%`
- 2024 macro AUC: `0.5895`
- Produced confusion matrices, ROC curves, and model comparison views to communicate performance tradeoffs across model families

## Why It Matters
The project balances practical crime analytics with realistic validation discipline. It demonstrates large-scale data preparation, feature engineering, and evaluation design rather than just model selection.

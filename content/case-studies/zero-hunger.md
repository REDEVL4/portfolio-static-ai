# Zero Hunger Big Data Analytics Pipeline

## Problem
Food insecurity analysis often pulls together fragmented datasets across agriculture, economics, and nutrition. I wanted to build a scalable data pipeline aligned to UN SDG 2: Zero Hunger that could support both analysis and forecasting across public datasets.

## Dataset
- 86,657 records
- 13 features
- Hunger, agriculture, and socio-economic indicators

## Architecture
- HDFS for distributed storage
- Hadoop Streaming MapReduce for scalable transformations
- Spark for analysis and processing
- Hive for structured querying and downstream reporting
- Python for analytics and visualization workflows

## What I Built
- A scalable ingestion and normalization workflow across food-security-related public datasets such as FAO, World Bank, and UNICEF/Kaggle-style sources
- Analysis-ready tables for hunger hotspot detection and root-cause exploration
- Analytical workflows to study relationships among malnutrition, agricultural productivity, economic instability, and food affordability
- Forecasting steps to evaluate hunger trends over time
- Visual outputs and dashboards to communicate disparities and policy-relevant findings

## Results
- Created a reusable big-data workflow that linked ingestion, transformation, querying, forecasting, and visualization
- Project materials reported about 95 percent prediction accuracy for hunger-trend evaluation
- Framed outputs for governments, NGOs, and international organizations working on food-security interventions

## Why It Matters
This project demonstrates data engineering at scale, but it also shows how distributed data systems can support decisions in public-interest problem spaces.

# Disease Networks for Disease Clustering Using Graph Convolutional Networks

## Problem
Many disease clustering methods rely on raw tabular features and miss the biological structure encoded in disease-gene relationships. I wanted to test whether combining graph topology with ontology-derived biological process features could produce more meaningful disease groupings.

## What I Built
- A disease x gene incidence matrix from disease-gene association data
- A disease x Gene Ontology feature matrix derived from mapped biological process annotations
- A graph-learning pipeline that combined disease network structure with ontology semantics
- A 3-layer GCN encoder in PyTorch to learn latent disease embeddings
- A KMeans clustering stage on top of the learned embedding space

## Evaluation Strategy
Instead of relying only on geometric cluster quality metrics, I validated cluster quality using Disease Ontology shortest-path distances. That made the evaluation more biologically grounded and better aligned with downstream biomedical use cases.

## Results
- Improved inter-vs-intra cluster distance separation from 0.90 to 1.45 on the 40-disease subset
- Improved separation from 0.85 to 1.25 on the 50-disease subset
- Improved separation from 1.10 to 1.85 on the 60-disease subset
- Demonstrated that graph topology plus ontology-derived features produced more credible disease groupings than baseline clustering on raw GO features alone

## Why It Matters
The project showed that richer disease representations can support downstream tasks such as disease similarity analysis, comorbidity discovery, and drug repurposing research. It is a good example of combining graph machine learning with domain-specific scientific structure.

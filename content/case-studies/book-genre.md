# Book Genre Classification and Segmentation Using Book Titles and Cover Images

## Problem
Book categorization becomes difficult at scale when metadata quality varies and genre boundaries overlap. I wanted to test whether combining text and image signals could improve both genre prediction and meaningful segmentation across large book catalogs.

## Datasets
- Book32: 207,572 records across 32 categories
- BookCover30: 57,000 images across 30 genres

## What I Built
- A dual-modality pipeline using Word2Vec and LSTM for title embeddings
- A CNN-based feature extraction workflow for book cover images
- Large-scale preprocessing and missing-data analysis to improve dataset quality before modeling
- KMeans clustering and PCA visualization to inspect cluster structure and genre separation

## Results
- Demonstrated interpretable multimodal clustering behavior across large catalog datasets
- Surfaced meaningful genre-aligned clusters such as Self-Help, Religion and Spirituality, and Education and Teaching
- Framed the workflow as a scalable content-intelligence solution for classification, discovery, recommendation, and catalog management

## Why It Matters
The project shows how multimodal learning can improve semantic understanding in real catalog systems where visual and textual signals each carry different parts of the label structure.

# Adversarial Attacks and Defense in CNNs for Medical X-Ray Classification

## Problem
Deep learning systems can appear accurate on medical imaging benchmarks while remaining fragile to tiny input perturbations. In a healthcare workflow, that is a safety problem. I wanted to measure how resilient common CNN architectures were on musculoskeletal X-ray abnormality classification and test whether adversarial training meaningfully improved robustness.

## Dataset and Scope
- MURA musculoskeletal X-ray dataset
- 40,561 images across 14,863 studies
- Abnormality classification setting
- Models evaluated: ResNet-50, DenseNet-121, EfficientNet-B0, and GoogLeNet

## What I Built
- A reproducible adversarial robustness benchmarking pipeline in PyTorch
- Attack evaluations using FGSM, PGD, and Carlini-Wagner across multiple perturbation levels
- A preprocessing workflow combining resizing, normalization, CLAHE enhancement, bone windowing, and smart cropping to improve clinical image consistency before training and evaluation
- FGSM-based adversarial training with 50 percent clean and 50 percent adversarial batches over 50 epochs

## Results
- Quantified how small perturbations can significantly degrade diagnostic model stability across multiple CNN families
- Improved robustness against FGSM after adversarial training and observed moderate gains against PGD
- Found that Carlini-Wagner remained highly effective even after defense tuning, showing that simple defense strategies were not enough for high-stakes medical settings

## Why It Matters
This project moved beyond standard accuracy and focused on trustworthy medical AI behavior under attack. The result was a research-backed evaluation framework for robustness in safety-critical imaging systems.

## Next Steps
- Ensemble adversarial training
- Adversarial weight perturbation
- Stronger robustness evaluations on external or hospital-derived datasets
- Clinical validation before real-world deployment

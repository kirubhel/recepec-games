# Learning Cloud Games - RESPECT Integration

Educational games for literacy and numeracy, built to follow the **RESPECT Launcher App standards**.

## 🚀 Overview
This repository contains a suite of web-based educational games designed for seamless integration with the RESPECT Launcher. It uses **xAPI** to report progress and results directly to the launcher's LRS.

## 📋 Standard Compliance
The project implements the following RESPECT standards:
- [x] **RESPECT Manifest**: Located at `/public/RESPECT_MANIFEST.json`.
- [x] **OPDS 2.0 Catalog**: Located at `/public/opds.json`.
- [x] **xAPI Statements**: Sends `completed` statements with scores and success metrics.
- [x] **Readium Webpub Manifests**: Individual game manifests for offline caching readiness.

## 🛠 Features
- **Zero-Login**: Uses the `auth` token provided by the RESPECT launcher for single sign-on.
- **Offline Capable**: Assets are optimized for caching via the `libRESPECT` proxy.
- **Multilingual**: Supports English, Amharic, and Oromo out of the box.

## 🕹 Existing Units (Games)
1. **Letter Arrangement**: Arrange scrambled letters to form words. (Fully Integrated)
2. *More games coming soon...*

## 🧑‍💻 Technical Details
- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS & Framer Motion.
- **API**: Axios for xAPI reporting.
- **Discovery**: OPDS-2.0 compliant feed.

## 📦 Deployment
The app is currently configured for development on `localhost:3000`. 
Production deployment is targetted at `https://learningcloud.et/games`.

---
*Created for the Spix Foundation / RESPECT team.*

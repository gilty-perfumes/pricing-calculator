# Gilty Perfume Pricing Calculator

A static cost and selling price calculator for four fragrances and a shared four-fragrance gift set. Open `index.html` in a browser or serve this directory with any static web server. No build step is required.

## Saved values

`seed-data.js` contains the initial values captured from the owner's Chrome calculator on 17 October 2026. Those values load when a browser has no saved calculator data. Later edits are saved in that browser's local storage and take precedence over the seed file. Browser-local edits are not automatically committed to GitHub; update `seed-data.js` to publish a new shared starting state.

## Excel download

The Download Excel button creates a styled snapshot of the Cost Price and Selling Price dashboards, including the four perfume cards, totals, gift set, leftover table, and selling results. Cost Price averages include selected individual boxing. The workbook contains the values shown at download time; change inputs on the website and download again for an updated snapshot.

## GitHub Pages

The site uses relative paths and can be served from the repository root. In GitHub repository settings, enable Pages with **Deploy from a branch**, branch **main**, folder **/(root)**.

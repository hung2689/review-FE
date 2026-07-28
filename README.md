# SWR302 Practice Hub

Local-first React app for scanning 439 SWR302 source images, reviewing OCR output, and practicing only verified multiple-choice questions.

## 1. Install Node.js

Install Node.js LTS from:

```text
https://nodejs.org/
```

After installation, check:

```bash
node -v
npm -v
```

## 2. Install libraries

From this project folder:

```bash
npm install
```

## 3. Place the 439 images

Put all source images in:

```text
input-images/
```

Supported formats:

```text
.png
.jpg
.jpeg
.webp
```

The scan script sorts files by name and processes every supported image it finds.

## 4. Run the scan

```bash
npm run scan
```

The scanner:

- reads images in batches
- writes progress after every batch
- mirrors images into `public/input-images/` for the review UI
- saves study materials to `src/data/swr302-materials.json`
- saves quiz questions to `src/data/swr302-questions.json`
- never guesses correct answers

## 5. Continue an interrupted scan

Run the same command again:

```bash
npm run scan
```

The scanner reads `data/processing-progress.json` and continues from files not yet listed as successful or failed.

## 6. View failed images

Open:

```text
data/processing-progress.json
data/extraction-report.json
```

Check:

```json
"failedImages": []
```

## 7. Review questions without correct answers

Run the app and open:

```text
/data-review
```

Questions with `correctOptionId: null`, `needsReview: true`, or low OCR confidence are shown with the source image beside the extracted text. Manual review changes are stored separately in browser `localStorage` and do not erase source data.

## 8. Run the website

```bash
npm run dev
```

Open the local URL shown in the terminal.

## 9. Build the website

```bash
npm run build
```

The production files are written to:

```text
dist/
```

## 10. Run tests

```bash
npm run test
```

Covered logic includes:

- Fisher-Yates shuffling keeps every question
- shuffled answer order does not change `correctOptionId`
- correct answers render as correct
- wrong answers render as incorrect
- answers cannot be changed after selection
- invalid questions stay out of official practice
- localStorage preserves active session order

## 11. Validate data

```bash
npm run validate
```

This updates `data/extraction-report.json` and fails if image totals, progress, or question data are inconsistent.

## 12. Detect duplicate questions

```bash
npm run duplicates
```

The report is written to:

```text
data/duplicate-questions.json
```

## 13. Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Use:

```text
Build command: npm run build
Output directory: dist
```

## 14. Deploy to Netlify

1. Push the project to GitHub.
2. Import the repository in Netlify.
3. Use:

```text
Build command: npm run build
Publish directory: dist
```

## Data policy

The image content is treated as source truth. The scanner may normalize technical OCR artifacts such as repeated whitespace, but it must not rewrite, summarize, translate, fix grammar, add answer choices, remove answer choices, or infer correct answers.


# Process-section photography

The home-page "How we work" section is **image-ready**. Drop five photos here
(named exactly as below) and point each step at its file — the numbered circles
become cover photos with the step number as an overlaid badge, and the dashed
connector line is hidden automatically.

## Expected files (4:3 landscape, ~1200×900, .jpg)

| Step | Filename              | Subject (Gemini prompt core)                                |
| ---- | --------------------- | ----------------------------------------------------------- |
| 1    | `01-prepare.jpg`      | Fresh green vegetables washed/sorted on a stainless line    |
| 2    | `02-process.jpg`      | IQF freezing tunnel — vegetables on a conveyor, frost mist  |
| 3    | `03-inspect.jpg`      | Technician in white coat at a microscope in a bright QA lab |
| 4    | `04-package.jpg`      | Sealed pouches on an automated packing line                 |
| 5    | `05-surveillance.jpg` | Control screen / temperature check beside the freezing line |

Shared style: clean modern frozen-food factory, cool daylight, stainless steel,
shallow depth of field, spotless and premium, photorealistic, no text/logos/faces.

## Activate (one edit)

In `web/content/pages/home.json`, add an `image` to each `process.steps[]` entry:

```json
{ "label": { ... }, "description": { ... }, "icon": "...",
  "image": "/images/process/01-prepare.jpg" }
```

The `image` field is optional — until it's set, the step renders the numbered
circle exactly as before, so there are no broken images in the meantime.

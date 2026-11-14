# StudyNova AI — media assets

Drop your files here. The prototype detects them **by file name** (no code change needed);
if a file is missing, a professional placeholder is shown instead.

| File name (any of png/jpg/jpeg/webp/gif/svg for images, mp4/webm/mov for video) | Where it appears |
|---|---|
| `videos/learn-lecture.mp4`        | Nova Learn → Lecture video preview |
| `images/learn-diagram.png`        | Nova Learn → Diagram (replaces the built-in SVG) |
| `videos/creator-promo.mp4`        | Nova Creator → video editor preview |
| `videos/whatsapp-demo.mp4`        | WhatsApp section → "View Lecture" button / screen recording |
| `images/wearable-concept.png`     | Wearable AI Companion concept image |
| `images/presentation-cover.png`   | Presentation Mode title slide |
| `images/logo.png` (or `.svg`)     | StudyNova AI logo (header, presentation) |
| `images/gallery-01.png`, `gallery-02.png`, … | Prototype gallery (interactive lightbox) |
| `images/poster-<slot>.png`        | Optional poster for a video slot, e.g. `poster-learn-lecture.png` |

Keep original aspect ratios — media is never cropped (width:100%, height:auto).

# MirrorCart Mobile Interface Design

## Product direction

MirrorCart is a portrait-first iOS-style shopping companion for one-handed outfit decisions. The primary experience is visual: the shopper supplies a full-body photo and a natural-language goal, receives three complete looks, previews one on themselves through server-side AI virtual try-on, requests a change, and approves a shoppable cart. The UI should describe generated imagery as an **AI visualization preview**, not a guarantee of fit.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Home | Brand promise, occasion/style prompt, budget chip, existing-item note, recent look shortcut, and primary “Build my looks” action. |
| Try On Capture | Camera or photo-library entry, full-body framing guide, lighting and single-person hints, capture/retake loop, and selected-photo preview. |
| Styling Progress | A compact progress timeline showing intent understood, products matched, looks composed, budget checked, and try-on prepared. No hidden chain-of-thought is exposed. |
| Looks | Three complete-look cards with hero imagery, title, rationale, total, owned-item labels, and “Preview on me” actions. |
| Look Detail | Large hero visualization, item breakdown, total, why-it-works explanation, refinement composer, save action, and “Shop this look.” |
| Cart | Human approval screen with owned versus buy items, merchant links or mock checkout rows, total, and final review action. |
| Profile | Saved looks, style preferences, privacy explanation, and local photo/data controls. |

## Key user flows

### Occasion-led styling

1. User opens Home and enters an occasion, aesthetic, budget, and optional owned item.
2. User taps “Build my looks,” then enters Try On Capture.
3. User captures or selects a full-body image and confirms the preview.
4. The app submits the structured request and image reference to the backend.
5. Styling Progress reports meaningful tool outcomes while the server searches, composes, validates, and prepares results.
6. User reviews three Looks and taps “Preview on me” for one card.
7. Look Detail shows the generated visualization and item-level price breakdown.
8. User submits a refinement such as “Make it less black and add something red.”
9. The backend revises only the necessary items, revalidates the budget, and returns a refreshed visualization.
10. User taps “Shop this look,” reviews Cart, and makes the final human-approved purchase/merchant-link decision.

### Fix My Outfit

1. User starts from Try On Capture with a photo of an existing outfit.
2. User describes the desired transformation, such as “elevate this for date night.”
3. Backend identifies the styling goal, finds complementary replacements, and preserves owned items where possible.
4. User previews the revised look, refines it conversationally, and saves or shops it.

## Mobile layout rules

The app uses a 9:16 portrait canvas with safe-area-aware content and thumb-reachable primary actions. Each screen has one dominant action. Generated imagery occupies the largest visual region on Looks and Look Detail. Refinement is a bottom-sheet composer over the current result so the user can change the look without losing visual context. Product rows are compact, scannable, and use clear “Owned” and “Buy” labels. All destructive or irreversible actions require an explicit confirmation.

## Visual language

MirrorCart should feel editorial, calm, and premium rather than futuristic. Use warm ivory as the base, deep ink for text, muted sage for positive progress, and a coral-red accent reserved for primary actions and the “add something red” refinement story. Use rounded 24px cards, thin warm-gray dividers, soft shadows, generous vertical rhythm, and system typography with strong contrast. The visual system should support dark mode by mapping ivory to charcoal and preserving coral as the action color.

| Token | Light value | Dark value | Use |
|---|---|---|---|
| Background | `#F8F6F1` | `#171716` | App canvas |
| Surface | `#FFFDF9` | `#242321` | Cards and sheets |
| Foreground | `#1E1D1A` | `#F5F1E8` | Primary text |
| Muted | `#78736A` | `#B8B1A5` | Supporting text |
| Primary | `#D85C4A` | `#F07864` | Main CTA and active state |
| Sage | `#82978A` | `#A8C0AE` | Progress and confirmed states |
| Border | `#E8E2D8` | `#3A3833` | Dividers and outlines |

## Backend-aware UX

The client consumes a typed state machine rather than raw model text. It should be able to render `draft`, `uploading`, `searching`, `composing`, `trying_on`, `ready`, `refining`, `cart_ready`, and `error` states. Provider-specific credentials and URLs remain server-side. The UI displays provider attribution such as “Visualized with Perfect Corp Fashion API” when a result is returned.

## Accessibility and trust

Use accessible labels for capture, retake, refine, save, and shop actions. Keep tap targets at least 44 points, maintain readable contrast, and provide text equivalents for progress. Explain that AI previews are for visual decision support and that merchant sizing and availability remain authoritative.

## References

[1]: https://api-cloud-ai-hackathon-2026.devpost.com/ "DevNetwork API + Cloud + AI Hackathon 2026"
[2]: https://yce.perfectcorp.com/ai-api/contents/fashion-api "Perfect Corp Fashion API"
[3]: https://docs.perfectcorp.com/reference/ai_clothes/section/overview "Perfect Corp AI Clothes API documentation"

# Demo Notes

## Improved surfaces

- Public landing page: clearer hero hierarchy, stronger CTA flow, more trust framing, tighter card rhythm on mobile
- Calculator wizard: compressed to two steps, clearer progress, grouped inputs, stronger estimate preview, improved disabled/loading/error states
- Inquiry success page: calmer confirmation layout, clearer next steps, direct contact actions
- Admin dashboard: quieter metric cards, clearer priority area for manual review cases, better demo empty-state guidance
- Inquiry list: more scannable mobile cards, stronger manual review emphasis, clearer price/status grouping

## Screens that present especially well

- `/`: hero section, benefit cards, and “So funktioniert es” section
- `/rechner`: step header, live estimate sidebar, summary card before submit
- `/anfrage/gesendet/[publicId]`: confirmation card with price range and next steps
- `/admin`: metric cards plus “Sofort im Blick” manual review area
- `/admin/anfragen`: mobile cards for realism and scanability
- `/admin/anfragen/[id]`: cost breakdown and immutable snapshot explanation

## Suggested live demo order

1. `/`
   Show the value proposition, trust wording, and the main CTA.
2. `/rechner`
   Enter one compact realistic inquiry and point out the live estimate and manual review handling.
3. `/anfrage/gesendet/[publicId]`
   Show the confirmation, price range, and clear next steps.
4. `/admin/login`
   Explain that the business receives structured leads in one protected place.
5. `/admin`
   Show the dashboard cards and priority view for manual review cases.
6. `/admin/anfragen`
   Show how incoming requests are scanned quickly on mobile and desktop.
7. `/admin/anfragen/[id]`
   Show the saved snapshot, cost breakdown, status handling, and PDF export.

## Demo emphasis

- Always describe the output as an unverbindliche Kostenschätzung, not a binding offer.
- Show one normal case first and one manual review case second.
- If time is short, focus on `/`, `/rechner`, `/admin`, and one inquiry detail page.

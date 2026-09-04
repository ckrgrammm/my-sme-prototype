# Industry modules

Each industry has one client-side module:

- `lorry/`
- `workshop/`
- `renovation/`
- `supplier/`
- `tuition/`

Use the industry module for UI metadata, feature flags, industry-specific labels, and future screen overrides. Keep reusable screens and controls in `client/src/components/`.

The corresponding operational data and workflow definitions live in `server/industries/<industry>.js`. When adding an industry, register it in both `client/src/industries/index.js` and `server/industries/index.js`.

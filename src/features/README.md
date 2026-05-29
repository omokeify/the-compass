# Feature Folders

Each product area should eventually live in its own folder:

- `feed/`
- `profile/`
- `spaces/`
- `talent/`
- `events/`
- `messages/`
- `admin/`

Recommended shape:

```text
feature-name/
  components/
  data/
  hooks/
  FeaturePage.jsx
  featureClient.js
```

Views should call feature clients instead of importing raw mock arrays directly. That keeps the later Supabase migration contained.

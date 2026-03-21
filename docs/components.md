# Components

Built-in components that render optimized HTML with zero JavaScript.

## `<Link>`

Renders `<a>` with optional native browser prefetch:

```tsx
import { Link } from "virexjs";

<Link href="/about">About</Link>
<Link href="/blog" prefetch>Blog</Link>  // adds <link rel="prefetch">
<Link href="https://example.com" target="_blank">External</Link>  // adds rel="noopener"
```

## `<Image>`

Optimized images with native lazy loading:

```tsx
import { Image } from "virexjs";

<Image src="/hero.jpg" alt="Hero" width={800} height={400} />
<Image src="/logo.png" alt="Logo" width={200} height={50} priority />  // above-fold
<Image
  src="/photo.jpg"
  alt="Photo"
  srcSet="/photo-400.jpg 400w, /photo-800.jpg 800w"
  sizes="(max-width: 600px) 400px, 800px"
/>
```

Features: `loading="lazy"`, `decoding="async"`, `fetchpriority`, `max-width:100%`.

## `<Head>`

Inject tags into `<head>` from anywhere in the component tree:

```tsx
import { Head } from "virexjs";

<Head>
  <title>My Page</title>
  <meta name="description" content="..." />
  <link rel="stylesheet" href="/style.css" />
</Head>
```

Tags are deduplicated — last `<title>` wins, `<meta>` deduped by name/property.

## `<Script>`

Smart script loading with strategies:

```tsx
import { Script } from "virexjs";

<Script src="/analytics.js" strategy="lazy" />    // load when visible
<Script src="/widget.js" strategy="idle" />        // load during idle time
<Script src="/critical.js" strategy="eager" />     // load immediately (blocking)
<Script src="/app.js" />                           // defer (default)
```

## `<Font>`

Optimized font loading:

```tsx
import { Font } from "virexjs";

// Google Fonts
<Font google="Inter" weights={[400, 600, 700]} />

// Custom font
<Font family="MyFont" src="/fonts/my.woff2" weight="400" />

// With CSS variable
<Font google="Inter" variable="--font-body" />
```

## `<ErrorBoundary>`

Catch rendering errors:

```tsx
import { ErrorBoundary } from "virexjs";

<ErrorBoundary fallback={(err) => <p>Error: {err.message}</p>}>
  <RiskyComponent />
</ErrorBoundary>
```

## `<JsonLd>`

SEO structured data:

```tsx
import { JsonLd, createFAQ } from "virexjs";

<JsonLd data={createFAQ([
  { question: "What is VirexJS?", answer: "A web framework." },
])} />
```

## `useHead()`

Programmatic head management:

```tsx
import { useHead } from "virexjs";

const head = useHead({
  title: "My Page",
  description: "...",
  og: { title: "My Page", image: "/api/og?title=My+Page" },
  twitter: { card: "summary_large_image" },
});

return <>{head}<div>Content</div></>;
```

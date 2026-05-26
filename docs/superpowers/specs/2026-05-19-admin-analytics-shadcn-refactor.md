# Admin Panel: shadcn/ui Refactor + GA4 Analytics Dashboard

**Date:** 2026-05-19  
**Status:** Ready to implement (restart required for shadcn MCP)

---

## Context

The admin panel at `/admin/*` is a custom-built CMS with 91 TSX files. Currently uses hand-rolled components (custom sidebar, tables, cards, form fields, dropdowns). The user wants to:

1. **Full shadcn/ui refactor** — replace all custom UI primitives with shadcn components (except the existing `Button` component which stays as-is)
2. **GA4 Analytics dashboard** at `/admin/analytics` — real data from GA4 Data API + Realtime API
3. **Ask user about more GTM features** needed for admin panel and in general

---

## Part 1 — shadcn/ui Refactor

### What to replace with shadcn

| Current custom component | Replace with shadcn |
|---|---|
| `sidebar.tsx` — hand-rolled nav | `Sidebar`, `SidebarNav`, `SidebarTrigger` |
| Admin layout shell | `SidebarProvider`, `SidebarInset` |
| Tables in forms, doctors, services | `Table`, `TableHeader`, `TableRow`, `TableCell` |
| `form-field.tsx` — custom labels+inputs | `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` |
| `form-status-dropdown.tsx` | `DropdownMenu`, `Select` |
| `translation-tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `admin-list.tsx` — stat cards, page headers | `Card`, `CardHeader`, `CardContent` |
| `locale-inputs.tsx` | `Tabs` (reuse translation-tabs pattern) |
| `save-bar.tsx` — floating save bar | `Sheet` or custom using shadcn primitives |
| `unsaved-changes.tsx` | Alert dialog → `AlertDialog` |
| Status badges | `Badge` |
| Search inputs | `Input` with icons |
| `media-picker.tsx` | `Dialog` |
| `multi-picker.tsx` | `Command` (combobox pattern) |
| `reorderable.tsx` | Keep custom (DnD, no shadcn equivalent) |
| `rich-text-editor.tsx` | Keep custom (TipTap, no shadcn equivalent) |
| Login page form | `Card`, `Form`, `Input`, `Label` |

### What stays custom (no shadcn equivalent)
- `Button` — already has custom design, keep as-is
- `rich-text-editor.tsx` — TipTap editor
- `reorderable.tsx` — drag-and-drop
- `image-upload.tsx`, `pdf-upload.tsx` — file handling
- `gallery-editor.tsx`, `hero-slides-editor.tsx` — complex custom editors

### Install required shadcn components (via MCP after restart)
```
sidebar, table, form, dropdown-menu, select, tabs, card, badge, 
input, label, dialog, alert-dialog, command, sheet, separator, 
avatar, tooltip, scroll-area, skeleton, progress
```

### Layout refactor
- Wrap admin layout in `SidebarProvider`
- Replace hand-rolled `Sidebar` with shadcn `Sidebar` + `SidebarMenu` + `SidebarMenuItem`
- Use `SidebarInset` for main content area
- Add collapsible sidebar for mobile

---

## Part 2 — GA4 Analytics Dashboard

### Route: `/admin/analytics`

### Infrastructure already done ✅
- `@google-analytics/data` installed
- Service account key: `genevity-analytics-d287e299af9d.json` (gitignored)
- Env vars set: `GA4_PROPERTY_ID=533683637`, `GA4_SERVICE_ACCOUNT_KEY=<base64>`
- Service account added to GA4 property with Viewer role
- Connection verified: 32 sessions, 24 active users, 1 booking_submitted today

### API Route: `/api/admin/analytics`
- Protected by `requireSession()`
- Fetches in parallel:
  1. **GA4 Realtime API** — active users right now
  2. **GA4 Data API** — today's sessions, active users, booking_submitted count
  3. **GA4 Data API** — top 5 traffic sources today (sessionSource dimension)
  4. **GA4 Data API** — top 5 service pages today (pagePath contains /services/)
- Returns JSON, no sensitive data exposed to client

### Dashboard widgets (all shadcn Card components)
```
┌─────────────────────────────────────┐
│  👁 Зараз на сайті: 3 особи         │  ← Realtime, updates every 30s
└─────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐
│Відвідувачі│ │  Заявки  │ │Конверсія │
│  сьогодні │ │ сьогодні │ │          │
│    24     │ │    1     │ │  3.1%    │
└──────────┘ └──────────┘ └──────────┘

┌────────────────────┐ ┌────────────────────┐
│  Звідки прийшли    │ │  Популярні послуги │
│  Google — 18       │ │  Ботокс — 12 переглядів │
│  Прямий — 4        │ │  Ліфтинг — 8       │
│  Instagram — 2     │ │  ...               │
└────────────────────┘ └────────────────────┘
```

### Polling
- Client component with `useEffect` + `setInterval(30_000)`
- Show last updated timestamp
- Skeleton loading state on first load (shadcn `Skeleton`)

### Add to sidebar nav
```ts
{ href: "/admin/analytics", label: "Analytics", icon: BarChart2, minRole: "marketing" }
```

---

## Part 3 — Questions to ask user (on restart)

### GTM / Analytics — additional features needed?
1. **Phone call tracking via Ringostat** — Ringostat tag is already in GTM. Should we pull Ringostat call data into the admin analytics dashboard? Need Ringostat API key.
2. **Booking funnel** — should we track form_open → form_start → booking_submitted as a funnel? Currently we only track submission.
3. **Service page conversions** — should each service page track which service led to booking? (currently `interest` param carries this)
4. **Session recordings** — add Hotjar or Microsoft Clarity for heatmaps?

### Admin panel — additional features?
1. **Analytics date range picker** — today / this week / last 30 days switcher
2. **Export bookings to CSV** — currently only viewable in admin
3. **Push notifications for new bookings** — browser push when someone submits form
4. **Booking calendar view** — visualize appointment requests by date
5. **Doctor performance** — which doctor pages drive most bookings

---

## Implementation Order

1. **Install shadcn components** via MCP (after restart)
2. **Refactor admin layout** — SidebarProvider + shadcn Sidebar
3. **Refactor shared components** — Table, Form, Tabs, Card, Badge, Dialog, Command
4. **Refactor individual pages** — use new components (forms, doctors, services, etc.)
5. **Build `/api/admin/analytics` route** — GA4 Data + Realtime API
6. **Build `/admin/analytics` page** — dashboard with shadcn Cards + polling

---

## Notes for next session

- GA4 service account key file: `genevity-analytics-d287e299af9d.json` at project root
- OAuth script: `scripts/add-ga4-service-account.mjs` (one-time, already done)
- OAuth client: `client_secret_996118789186-*.json` at project root (gitignored)
- Both JSON files are in `.gitignore`
- `@google-analytics/data` package already installed
- Test command to verify GA4 works:
  ```bash
  node --input-type=module -e "
  import { readFileSync } from 'fs';
  import { BetaAnalyticsDataClient } from '@google-analytics/data';
  const k = JSON.parse(readFileSync('./genevity-analytics-d287e299af9d.json','utf8'));
  const c = new BetaAnalyticsDataClient({credentials:{client_email:k.client_email,private_key:k.private_key}});
  const [r] = await c.runReport({property:'properties/533683637',dateRanges:[{startDate:'today',endDate:'today'}],metrics:[{name:'sessions'}]});
  console.log('Sessions today:', r.rows?.[0]?.metricValues?.[0]?.value);
  "
  ```
- shadcn MCP will be available after user restarts Claude Code
- Ask user about Part 3 questions on restart before implementing

# Κανόνας — Ψηφιακή Γραμματεία Ναού

SaaS πλατφόρμα διαχείρισης Ορθόδοξων εκκλησιών. Multi-tenant, με πλήρες σύστημα ενοριτών, μυστηρίων, οικονομικών, φιλανθρωπίας, αιμοδοσίας, κατασκηνώσεων και πολλά ακόμα.

---

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **PostgreSQL** + **Prisma 6**
- **Tailwind CSS 4** + **Radix UI** + **Shadcn**
- **Stripe** + **Viva Wallet** για πληρωμές
- **Nodemailer** για email, **Yuboto** για SMS

---

## Γρήγορη εκκίνηση (local)

### 1. Προαπαιτούμενα

- Node.js 20+
- PostgreSQL 14+ (ή Docker)

### 2. Εγκατάσταση

```bash
git clone https://github.com/wpgroun/kanonas.app.git
cd kanonas.app
npm install
```

### 3. Ρύθμιση περιβάλλοντος

```bash
cp .env.example .env
# Συμπλήρωσε τα απαραίτητα πεδία στο .env
```

Ελάχιστα απαραίτητα για dev:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/kanonas_db"
JWT_SECRET="any-long-random-string-for-dev"
```

### 4. Database setup

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Εκκίνηση

```bash
npm run dev
# → http://localhost:3000
```

---

## Docker (production)

```bash
cp .env.example .env
# Συμπλήρωσε το .env

docker compose up -d
# → http://localhost:3000
```

Το `docker-compose.yml` ξεκινάει την εφαρμογή + PostgreSQL. Το migration τρέχει αυτόματα στην εκκίνηση.

---

## Μεταβλητές περιβάλλοντος

Δες το [`.env.example`](.env.example) για πλήρη λίστα. Τα κρίσιμα:

| Μεταβλητή | Απαιτείται | Περιγραφή |
|-----------|-----------|-----------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ (production) | Τουλάχιστον 64 χαρακτήρες |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Για 2FA & email | SMTP ρυθμίσεις |
| `STRIPE_SECRET_KEY` | Για πληρωμές | Stripe API key |

---

## Αρχιτεκτονική

```
src/
├── app/           # Next.js App Router (pages + API routes)
│   ├── admin/     # Διαχειριστικό panel
│   ├── api/       # REST API endpoints
│   └── temple/    # Public citizen portal
├── actions/       # Server Actions (~30 αρχεία)
├── components/    # React components
├── lib/           # Utilities (auth, prisma, email, logger)
└── hooks/         # Custom React hooks
prisma/
├── schema.prisma  # Database schema (~100 models)
└── migrations/    # SQL migrations
```

### Multi-tenancy

Κάθε εκκλησία (`Temple`) έχει το δικό της `templeId`. Όλα τα δεδομένα φιλτράρονται ανά `templeId`.

### Επίπεδα πρόσβασης

| Επίπεδο | Περιγραφή |
|---------|-----------|
| `isSuperAdmin` | Πρόσβαση σε όλους τους ναούς |
| `MetropolisUser` | Read-only πρόσβαση στη Μητρόπολη |
| `isHeadPriest` | Διαχειριστής συγκεκριμένου ναού |
| Custom Role | Ρυθμιζόμενα δικαιώματα ανά ναό |

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server (με prisma migrate deploy)
npm run lint         # ESLint
npx prisma studio    # Database GUI
npx prisma migrate dev --name <name>  # Νέο migration
```

---

## Βασικές λειτουργίες

- **Μητρώο ενοριτών** — CRM με σχέσεις, ιστορικό μυστηρίων
- **Μυστήρια** — Γάμος, Βάπτιση, κλπ. με αυτόματη έκδοση πιστοποιητικών (PDF/DOCX)
- **Citizen Portal** — Online υποβολή αιτήσεων χωρίς λογαριασμό
- **Οικονομικά** — Έσοδα, έξοδα, budget, οικονομικές εκθέσεις
- **Φιλανθρωπία** — Συσσίτιο, δικαιούχοι, αποθήκη
- **Αιμοδοσία** — Μητρώο αιμοδοτών, εκστρατείες
- **Κατασκηνώσεις** — Κατασκηνωτές, ομάδες, ιατρικά, πληρωμές
- **Πρωτόκολλο** — Εισερχόμενη/εξερχόμενη αλληλογραφία
- **Δίπτυχα** — Λίστες υπέρ υγείας και κεκοιμημένων
- **Subscription tiers** — Free, Basic, Premium, Metropolis

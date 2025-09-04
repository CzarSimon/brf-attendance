# Avprickningslista – Föreningsstämma

En professionell närvaroregistreringsapp för svenska bostadsrättsföreningars årsstämmor.

## Funktioner

### Grundfunktioner
- ✅ Scrollbar lista över medlemmar med sök- och filterfunktioner
- ✅ Markera/avmarkera närvaro med bekräftelsedialog för avmarkeringar
- ✅ Realtidsstatistik över närvarande/frånvarande medlemmar
- ✅ Export av närvarolistor i CSV/JSON format
- ✅ Responsiv design för desktop och mobil
- ✅ Fullständig svenska språkstöd

### Tekniska funktioner
- ✅ Optimistiska UI-uppdateringar med rollback vid fel
- ✅ Virtualiserad lista för stora dataset (>200 medlemmar)
- ✅ Debounced sökning för prestanda
- ✅ Tillgänglighetsoptimerad med ARIA-labels och tangentbordsnavigation
- ✅ Rate limiting och input validering
- ✅ Audit trail med IP-adress och user agent

## Teknisk stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui komponenter
- **Backend**: Next.js API Routes, Supabase
- **Databas**: PostgreSQL (via Supabase)
- **Validering**: Zod
- **Virtualisering**: @tanstack/react-virtual

## Databasschema

### Members Table
\`\`\`sql
CREATE TABLE members (
  id UUID PRIMARY KEY,
  apartment_number TEXT NOT NULL,
  address TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Attendance Table
\`\`\`sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  is_present BOOLEAN NOT NULL DEFAULT false,
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_ip INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id)
);
\`\`\`

## Installation

### 1. Förutsättningar
- Node.js 18+ 
- Supabase projekt
- Git

### 2. Klona och installera
\`\`\`bash
git clone <repository-url>
cd attendance-app
npm install
\`\`\`

### 3. Miljövariabler
Skapa `.env.local` fil:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 4. Databas setup
Kör SQL-skripten i ordning:
\`\`\`bash
# Kör dessa i Supabase SQL Editor eller via CLI
scripts/001_create_members_table.sql
scripts/002_create_attendance_table.sql
scripts/003_create_functions.sql
\`\`\`

### 5. Importera medlemsdata
\`\`\`bash
# Placera din members.json fil i data/ mappen
npm run import-members data/members.json
\`\`\`

### 6. Starta utvecklingsserver
\`\`\`bash
npm run dev
\`\`\`

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Användning

### Medlemsdata format
Medlemsdata ska vara i JSON format:
\`\`\`json
[
  {
    "id": "uuid-string",
    "apartmentNumber": "1203",
    "address": "Harry Martinsons gata 3", 
    "name": "Anna Andersson"
  }
]
\`\`\`

### API Endpoints

#### GET /api/members
Hämta alla medlemmar med närvarostatus
\`\`\`bash
curl "http://localhost:3000/api/members?search=anna"
\`\`\`

#### POST /api/attendance
Växla närvarostatus för medlem
\`\`\`bash
curl -X POST "http://localhost:3000/api/attendance" \
  -H "Content-Type: application/json" \
  -d '{"memberId": "uuid", "isPresent": true}'
\`\`\`

#### GET /api/export
Exportera närvarodata
\`\`\`bash
curl "http://localhost:3000/api/export?type=present&format=csv&includeName=true"
\`\`\`

### Sökfunktioner
- **Textsökning**: Sök på namn, lägenhetsnummer eller adress
- **Statusfilter**: Visa alla, endast närvarande eller endast frånvarande
- **Sortering**: Sortera på namn eller lägenhetsnummer (stigande/fallande)
- **Snabbfilter**: Checkbox för "visa endast närvarande"

### Export
- **Format**: JSON eller CSV
- **Typ**: Närvarande eller frånvarande medlemmar
- **Innehåll**: ID + valfritt namn
- **Filnamn**: Automatiskt med datum (t.ex. `narvarande-medlemmar-2024-01-15.csv`)

## Säkerhet

### Row Level Security (RLS)
- Alla tabeller använder RLS för datasäkerhet
- Publika läsrättigheter för närvaroapp (ingen autentisering krävs)
- Endast service role kan importera/uppdatera medlemsdata

### Rate Limiting
- API endpoints har grundläggande rate limiting
- Input validering med Zod schemas
- CORS konfigurerat för same-origin

### Audit Trail
- Alla närvaroändringar loggas med timestamp
- IP-adress och user agent sparas för spårbarhet
- Idempotenta operationer förhindrar race conditions

## Prestanda

### Optimeringar
- Virtualiserad lista för stora dataset
- Debounced sökning (300ms delay)
- Optimistiska UI-uppdateringar
- Effektiv databasindexering
- Komprimerad CSS/JS i produktion

### Skalbarhet
- Stödjer 1000+ medlemmar utan prestandaproblem
- Virtualisering aktiveras automatiskt för stora listor
- Effektiva SQL-queries med joins och indexering

## Tillgänglighet

### WCAG AA Compliance
- Semantisk HTML struktur
- Proper ARIA labels och roller
- Tangentbordsnavigation
- Fokushantering i dialoger
- Kontrastförhållanden enligt WCAG AA
- Screen reader optimerad

### Språkstöd
- Fullständig svenska lokalisering
- Semantiska HTML lang attribut
- Svensk datumformatering
- Kulturellt anpassade UI-mönster

## Utveckling

### Projektstruktur
\`\`\`
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main attendance page
├── components/            # React komponenter
│   ├── ui/               # shadcn/ui komponenter
│   ├── attendance-*.tsx  # Närvarospecifika komponenter
│   └── *.tsx             # Övriga komponenter
├── lib/                   # Utilities och hooks
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper funktioner
│   ├── api-client.ts     # API client
│   └── types.ts          # TypeScript definitioner
├── scripts/              # Databas scripts
└── data/                 # Exempel medlemsdata
\`\`\`

### Kodstandarder
- TypeScript strict mode
- ESLint + Prettier konfiguration
- Komponentbaserad arkitektur
- Custom hooks för state management
- Zod för runtime validering

## Deployment

### Vercel (Rekommenderat)
\`\`\`bash
npm run build
vercel --prod
\`\`\`

### Docker
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Felsökning

### Vanliga problem

**Import misslyckas**
- Kontrollera JSON format och UUID struktur
- Verifiera Supabase anslutning och behörigheter

**Långsam prestanda**
- Aktivera virtualisering för stora listor
- Kontrollera databasindexering
- Optimera nätverksanslutning

**Tillgänglighetsproblem**
- Testa med screen reader
- Kontrollera tangentbordsnavigation
- Validera ARIA attribut

## Support

För teknisk support eller funktionsförfrågningar, skapa en issue i projektets repository.

## Licens

MIT License - se LICENSE fil för detaljer.
\`\`\`

```json file="" isHidden

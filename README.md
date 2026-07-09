# Vizinho — Marketplace de serviços para casa (Portugal)

Plataforma de serviços domésticos (marido de aluguer, canalização, eletricidade,
montagens, pintura, casa inteligente e jardim) para Portugal. Os clientes pedem
serviços com preço definido; os profissionais registam-se, definem a sua
disponibilidade e recebem pedidos.

Construído sobre Next.js 14 (App Router), TypeScript, Prisma + PostgreSQL,
Auth.js (NextAuth v5), Tailwind CSS e Radix UI.

## Arranque rápido

```bash
pnpm install

# 1. Configurar variáveis de ambiente
cp .env.example .env
#   - defina DATABASE_URL para o seu PostgreSQL
#   - gere AUTH_SECRET:  openssl rand -base64 32

# 2. Criar o schema e popular dados de exemplo
pnpm db:push        # aplica o schema Prisma à base de dados
pnpm db:seed        # cria categorias, serviços, localidades, profissionais e pedidos

# 3. Arrancar
pnpm dev            # http://localhost:3000
```

### Contas de demonstração (password: `password123`)

| Papel        | Email                | Vai para        |
| ------------ | -------------------- | --------------- |
| Admin        | `admin@vizinho.pt`   | `/admin`        |
| Cliente      | `cliente@vizinho.pt` | `/dashboard`    |
| Profissional | `joao@vizinho.pt`    | `/profissional` |

## Estrutura

```
app/
  (marketing)/            Páginas públicas com header/footer (SEO)
    page.tsx              Homepage
    servicos/…            Categorias e páginas de serviço
    [roleSlug]/[locationSlug]/   Landing pages SEO (ex.: /canalizador/lisboa)
    marcar/[serviceSlug]/        Fluxo de marcação (BookingWizard)
    pedido/[reference]/          Confirmação do pedido
    profissionais/[slug]/        Perfil público do profissional
    como-funciona, para-profissionais, termos, privacidade, ajuda, contactos
  login, registar, registar/profissional     Autenticação
  dashboard/…             Área de cliente
  profissional/…          Área de profissional (pedidos, disponibilidade, serviços, áreas…)
  admin/…                 Administração
  sitemap.ts, robots.ts   SEO
components/               UI partilhada (cards, badges, SEO, dashboard shell…)
features/
  booking/                Wizard, matching e server actions de marcação
  professional/           Grelha de disponibilidade, gestão de perfil/serviços/áreas
  client/                 Ações do cliente (cancelar, reagendar, avaliar)
  admin/                  Ações de administração (aprovar, moderar, preços)
lib/
  data/catalog.ts         Catálogo de categorias/serviços (fonte única)
  data/locations.ts       Distritos e concelhos de Portugal
  availability.ts         Cálculo de slots + conversão grelha↔regras
  seo.ts, format.ts       JSON-LD, formatação PT-PT
prisma/                   schema.prisma + seed.ts
```

## Funcionalidades

- **Catálogo & SEO**: 7 categorias, ~35 serviços, páginas de serviço, categoria e
  landing pages programáticas por `serviço/profissão × localidade` (220+ páginas
  pré-renderizadas), com metadata dinâmica, canonical, Open Graph e JSON-LD
  (LocalBusiness, Service, FAQPage, BreadcrumbList).
- **Marcação**: wizard de 5 passos (localização → detalhes → data/hora → contacto
  → resumo), com matching por serviço + localização + disponibilidade, e modos
  "primeiro disponível" ou "escolher profissional".
- **Profissionais**: onboarding, grelha semanal de disponibilidade (clique/arrasto,
  copiar dias, bloquear datas), gestão de serviços e áreas, aceitar/recusar pedidos.
- **Cliente**: dashboard, histórico, cancelar/reagendar, avaliar após conclusão.
- **Admin**: aprovação de profissionais, gestão de serviços/preços, moderação de
  avaliações, visão geral de pedidos e utilizadores.
- **Papéis** (`CLIENT` / `PROFESSIONAL` / `ADMIN`) com redirecionamento por papel
  e proteção de rotas via middleware.

## Notas / próximos passos

- **Pagamentos**: arquitetura preparada (campos `paymentStatus`), integração Stripe
  por fazer. Ver `Booking.paymentStatus`.
- **Emails**: `lib/notifications.ts` cria notificações in-app e regista o email que
  seria enviado (stub). Ligar a um fornecedor (Resend/SendGrid) — ver `sendEmail`.
- **Upload de fotos**: o uploader do wizard faz pré-visualização local; ligar a
  armazenamento (S3/UploadThing) e passar os URLs para a marcação.

## Scripts

| Comando          | Descrição                   |
| ---------------- | --------------------------- |
| `pnpm dev`       | Servidor de desenvolvimento |
| `pnpm build`     | Build de produção           |
| `pnpm db:push`   | Aplicar schema Prisma       |
| `pnpm db:seed`   | Popular dados de exemplo    |
| `pnpm db:studio` | Prisma Studio               |
| `pnpm typecheck` | Verificação de tipos        |
| `pnpm lint`      | ESLint                      |

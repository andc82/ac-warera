## Obiettivo

In ogni sezione delle pagine `/app/warera/*`, accanto al pannello API collassabile esistente, aggiungere un editor del **body della request** che parte dai parametri di default (incluso il tuo `warera_user_id` quando rilevante) e permette di rilanciare la chiamata con valori personalizzati.

## Approccio

### 1. Nuovo componente generico (in `src/components/warera-ui.tsx`)

Estendere `ApiInfo` (o aggiungere `ApiPanel`) con supporto editing:

```tsx
<ApiInfo calls={[{
  endpoint: "/user.getUserById",
  request: currentBody,           // mostrato in Request
  data, error,
  editable: true,                 // mostra editor
  defaults: { userId: myWid },    // bottone "Reset ai default"
  onApply: (newBody) => setBody(newBody), // callback
}]} />
```

Editor: textarea JSON con validazione, bottoni **Applica** / **Reset ai default** / **Ricarica**. Errori di parsing mostrati inline. Resta dentro il `<Collapsible>` esistente.

### 2. Pattern nelle pagine

Ogni `useWarEra(endpoint, body)` con body parametrizzabile passa da costante a `useState`:

```tsx
const myWid = profile?.warera_user_id ?? "";
const [meBody, setMeBody] = useState({ userId: myWid });
const meQ = useWarEra("/user.getUserById", meBody, { enabled: !!meBody.userId });
```

Quando `profile` carica dopo il primo render, un `useEffect` aggiorna il body se è ancora ai default.

### 3. Sezioni interessate

Solo le call con parametri "interessanti" (skip endpoint senza body o con solo `id` di route già fissato dall'URL):

- **`/me`** — `user.getUserById`, `user.getMmrHistory`, `user.getActivity`, transactions → tutti con default `userId = mio wid`
- **`/rankings`** — `tier`, `category`, `limit`, paginazione
- **`/articles`** — filtri di lista (limit, country, ecc.)
- **`/battles`** — `limit`, `isActive`, country filters
- **`/companies`** — `limit`, `country`
- **`/countries`** — eventuali filtri di lista
- **`/regions`** — eventuali filtri
- **`/users`** (lista) — query/limit
- **`/items`** — filtri categoria
- **`/work`** — `limit`, `regionId`, `country`
- **`/transactions`** — `userId` default = mio wid, `limit`
- **`/search`** — già è una form, lasciare com'è
- **Pagine dettaglio (`$id`)** — il param principale resta dall'URL (non editabile per non confondere il routing), ma le call **secondarie** (es. battaglie di una regione, holdings di un'azienda) ricevono editor per `limit` / filtri opzionali
- **`/dashboard`** — call aggregate con editor opzionale

### 4. Default basati sull'userId

Per le call dove ha senso (`/me`, `/transactions`, qualunque endpoint che accetta `userId`), il valore iniziale è `profile.warera_user_id`. Se manca, mostriamo banner "Imposta il tuo WarEra UserId in Settings" e disabilitiamo il bottone Applica.

## Tecnico

- Editor JSON minimale (textarea monospace) per evitare di aggiungere dipendenze. Validazione con `JSON.parse` in try/catch.
- Limite lunghezza testo (es. 8KB) per evitare body abnormi.
- Lo stato del body vive nel componente pagina; refetch automatico via react-query quando cambia la queryKey (già succede perché `body` fa parte della key in `use-warera.ts`).
- Nessun cambio al backend o a `warera-api.ts`.

## Out of scope

- Nessun cambio al routing o all'auth.
- Nessun editor sui campi `id` provenienti dai route params delle pagine `$id` (modificare quello equivale a navigare ad altra entità: non utile).
- Niente persistenza dei valori personalizzati tra reload (solo stato locale).

## Ordine di implementazione

1. Estendere `ApiInfo` con modalità editor in `warera-ui.tsx`.
2. Migrare `/me` (caso d'uso principale per il default userId).
3. Migrare le pagine di lista (rankings, articles, battles, companies, countries, regions, users, items, work, transactions).
4. Migrare le pagine dettaglio per le sole call secondarie.
5. Verifica visiva su preview.

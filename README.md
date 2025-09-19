# API Azure — Documentation rapide

## Architecture

```
[Client]
   |
   v
[Azure Functions HTTP]
   |  (SDK @azure/functions)
   v
[Cosmos DB]
  ├─ Container: users (partition: id)
  └─ Container: votes (partition: userId)
```

- Entrées HTTP gérées par Azure Functions en TypeScript (dossier `src/functions`).
- Accès aux données via Cosmos DB (fichier `src/cosmo.ts` centralise le client et les conteneurs).
- 3 fonctions HTTP exposées: `user` (création d’utilisateur), `vote` (soumission d’un vote), `votes` (agrégats et liste des votes).
- Convention d’URL locale: les fonctions HTTP sont accessibles sous `http://localhost:7071/api/{functionName}`.

## Endpoints (API REST)

- POST `/api/user`
  - Body JSON: `{ "pseudo": string, "email": string }`
  - Réponses:
    - 201: `{"id","pseudo","email","createdAt"}`
    - 400: `{ "error": "pseudo and email are required" }`
    - 500: `{ "error": "internal server error" }`

- POST `/api/vote`
  - Body JSON: `{ "userId": string, "choice": "Oui" | "Non" }` (insensible à la casse, "oui"/"non" accepté)
  - Effet: remplace un vote précédent du même `userId` si présent.
  - Réponses:
    - 201: `{"id","userId","choice","createdAt"}`
    - 400: `{ "error": "userId and choice ('Oui' or 'Non') are required" }`
    - 500: `{ "error": "internal server error" }`

- GET `/api/votes`
  - Renvoie les agrégats et la liste brute des votes.
  - 200: `{ "total": number, "yes": number, "no": number, "pctYes": number, "items": Vote[] }`

## Exécution locale

Prérequis:
- Node.js 18+
- Azure Functions Core Tools v4 (peut être installé via npm)
- Azurite (stockage local) recommandé pour `AzureWebJobsStorage=UseDevelopmentStorage=true`

Installation:
```
npm install
```

Configuration (fichier `local.settings.json`):
```
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",

    "COSMOS_ENDPOINT": "<https://your-account.documents.azure.com:443/>",
    "COSMOS_KEY": "<your-cosmos-key>",
    "COSMOS_DB": "<database-name>",
    "USERS_CONTAINER": "users",
    "VOTES_CONTAINER": "votes"
  }
}
```
Note: Ne commitez pas de secrets. Utilisez des variables d’environnement ou un fichier non versionné.

Démarrer l’API en local:
```
npm start
# puis accéder aux fonctions sur http://localhost:7071/api
```

## Tests rapides (cURL)

Créer un utilisateur:
```
curl -X POST http://localhost:7071/api/user \
  -H "Content-Type: application/json" \
  -d '{"pseudo":"Alice","email":"alice@example.com"}'
```

Voter:
```
# Remplacez <USER_ID> par l'id retourné lors de la création d'utilisateur
curl -X POST http://localhost:7071/api/vote \
  -H "Content-Type: application/json" \
  -d '{"userId":"<USER_ID>","choice":"Oui"}'
```

Consulter les résultats:
```
curl http://localhost:7071/api/votes
```

## Arborescence utile
```
src/
  cosmo.ts          # client Cosmos DB et conteneurs
  functions/
    user.ts         # POST /api/user
    vote.ts         # POST /api/vote
    votes.ts        # GET  /api/votes
```

## Dépannage
- Erreur de connexion Cosmos: vérifier `COSMOS_ENDPOINT` et `COSMOS_KEY`.
- Stockage local: lancez Azurite (`npx azurite`) si nécessaire.
- Rebuild TypeScript: `npm run build` (exécuté automatiquement avant `npm start`).


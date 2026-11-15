# Architecture de Sécurité & Modèle de Menaces — LevelUp

> **Document ID :** SEC-LVLUP-005  
> **Version :** 3.1.0 (Édition Pareto Simplifiée)  
> **Statut :** Approuvé pour Implémentation  

---

## 1. Modèle de Menaces & Surface d'Attaque

Le système LevelUp met en œuvre une politique de sécurité stricte pour garantir l'intégrité des données, la légitimité des accomplissements et l'inviolabilité des sanctions.

| Vecteur d'Attaque | Risque Identifié | Contre-Mesure Implémentée |
| :--- | :--- | :--- |
| **Double Dépense d'XP** | Validation multiple d'une même quête par requêtes concurrentes. | Verrou distribué Redis (**Redlock**) + Contrainte SQL unique `(questId, userId)`. |
| **Usurpation d'Oracle** | Faux webhooks d'opportunités ou fausses preuves soumises. | Signature cryptographique obligatoire **HMAC-SHA256** sur l'en-tête `X-Deerflow-Signature`. |
| **Contournement de Pénalité** | Modification des fichiers hosts ou suppression des règles DNS. | Verrouillage dynamique via l'API cloud **NextDNS** + filtrage Windows Filtering Platform (WFP). |
| **Vol de Session / Token** | Interception de jetons d'accès JWT. | Tokens JWT à courte durée de vie (15 min) + Refresh tokens en cookies stricts `HttpOnly`, `Secure`, `SameSite=Strict`. |
| **Simulation de Posture** | Envoi de données cinématiques falsifiées pour valider les exercices physiques. | Détection de repères anatomiques temporels et cohérence biomécanique dans MediaPipe Pose. |

---

## 2. Standards Cryptographiques (`packages/crypto`)

### 2.1 Hachage des Mots de Passe & Identifiants
* **Algorithme** : **Argon2id** (recommandé par l'OWASP).
* **Paramètres** :
  * Mémoire : 65 536 KiB (64 MiB)
  * Itérations (Time cost) : 3
  * Parallélisme : 1 thread

### 2.2 Chiffrement des Données Sensibles au Repos
* **Algorithme** : **AES-256-GCM** (chiffrement d'enveloppe authentifié).
* **Spécifications** :
  * Clé de chiffrement : 256 bits (dérivée de `APP_SECRET` via HKDF).
  * Vecteur d'Initialisation (IV) : 96 bits aléatoires générés via `crypto.randomBytes(12)`.
  * Tag d'authentification : 128 bits pour garantir l'intégrité des charges chiffrées.

### 2.3 Validation des Webhooks Externes (HMAC)
Tout webhook reçu depuis le moteur Deerflow ou un oracle distant est validé avant traitement :
```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');
  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(signatureBuffer, expectedBuffer);
}
```

---

## 3. Sécurité du Protocole de Restriction Réseau (NextDNS)

1. **Isolation Cloud** : La restriction ne repose pas uniquement sur la machine locale. L'API cloud de NextDNS bloque la résolution des domaines distrayants (réseaux sociaux, streaming récréatif) directement au niveau du résolveur réseau.
2. **Double Barrière Locale** : En complément, les règles Windows Filtering Platform (WFP) interceptent le trafic sortant sur les ports 80/443 vers les adresses IP associées aux distractions.
3. **Condition de Déverrouillage Inviolable** : Seule une preuve physique validée (200 pompes détectées par MediaPipe ou activité Strava certifiée de 10 km) émet l'appel API autorisé pour lever la restriction.

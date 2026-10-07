# day-night-buttons

Des boutons jour / nuit animés en React + TypeScript, à copier dans ton projet. Un dossier par design dans `src/components/`.

| Bouton | Dossier |
|---|---|
| Montagne et lac | [`DayNightToggle`](src/components/DayNightToggle) |

## Lancer la démo

```
npm install
npm run dev
```

## Utiliser un bouton

Copie le dossier du bouton dans ton projet, puis :

```tsx
import { DayNightToggle } from './components/DayNightToggle'

<DayNightToggle />                                          // autonome
<DayNightToggle checked={isNight} onChange={setIsNight} />  // contrôlé
<DayNightToggle width={300} duration={2} />                 // taille et vitesse
```

`video/` contient la version canvas utilisée pour fabriquer les vidéos.

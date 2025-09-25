# Constants

## Colors
- From: `constants/Colors.ts`
- Export: `Colors` theme object with `light` and `dark`

Example:
```ts
import { Colors } from '@/constants/Colors';

const primary = Colors.light.primary;
```

### Helpers
- `getLiturgicalColor(season, isDark?)`
- `getFeastColor(rank, isDark?)`
- `getLiturgicalColorHex(liturgicalColor, isDark?): string`

Example:
```ts
import { getLiturgicalColor } from '@/constants/Colors';

const adventColor = getLiturgicalColor('advent');
```
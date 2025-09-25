# Dominicana - Dominican Liturgical Companion

A comprehensive liturgical companion mobile application for the Order of Preachers (Dominicans) that aids in praying the Liturgy of the Hours and the Rosary, featuring a specialized Dominican calendar with saints database and interactive community features.

## 📚 Documentation

- See the full project documentation in `docs/`: [Documentation Index](docs/README.md)

## 🎯 Overview

Dominicana serves as a complete spiritual resource for Dominican friars and the faithful, integrating the four pillars of Dominican life:

- **Prayer**: Liturgy of the Hours and Dominican Rosary
- **Study**: Catholic classics library with epub reader
- **Community**: Liturgical calendar, saints directory, and provinces map
- **Preaching**: Daily reflections and spiritual writings

## ✨ Features

### 🕯️ Prayer Module
- **Liturgy of the Hours**: Complete Dominican breviary with all prayer hours
- **Dominican Rosary**: Traditional mysteries with meditations
- **Anonymous Access**: Prayer functions available without login
- **Feast Banner**: Prominent display of current liturgical information

### 📚 Study Module
- **Catholic Classics Library**: Extensive collection of theological works
- **Epub Reader**: Integrated reading experience
- **Search & Bookmarks**: Advanced library management
- **Login Required**: Authentication for ebook features

### 👥 Community Module
- **Liturgical Calendar**: Dynamic Dominican calendar with movable feasts
- **Saints Directory**: Comprehensive database of Catholic and Dominican saints
- **Provinces Map**: Interactive world map of Dominican communities
- **Feast Day Information**: Detailed celebration information

### 📢 Preaching Module
- **Daily Reflections**: Spiritual insights from Dominican friars
- **Blog Posts**: Extended theological writings
- **Audio Content**: Homilies and meditations (subscription required)
- **Search Functionality**: Find specific content easily

## 🎨 Design Philosophy

Inspired by the Vatican's official liturgical resources and Universalis app, Dominicana features:

- **Traditional Catholic Aesthetic**: Reverent design with liturgical symbols
- **Liturgical Color Schemes**: Seasonal adaptations (Advent purple, Lent violet, Easter white)
- **Serif Typography**: Georgia font for headers, clean sans-serif for body text
- **Responsive Layout**: Card-based design with ornamental borders
- **Dominican Identity**: Black and white color scheme with gold accents

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dominicana-tabs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📱 Platform Support

- **iOS**: Native iOS app with full feature support
- **Android**: Native Android app with full feature support
- **Web**: Progressive Web App (PWA) for browser access

## 🔧 Technical Architecture

### Framework & Libraries
- **Expo**: React Native framework with TypeScript
- **Expo Router**: File-based navigation system
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development

### Key Dependencies
- `@react-native-async-storage/async-storage`: Local data persistence
- `expo-sqlite`: Local database for offline functionality
- `expo-file-system`: File management for ebooks
- `expo-av`: Audio playback for homilies and meditations
- `react-native-maps`: Interactive province mapping
- `@react-native-community/datetimepicker`: Date selection for liturgical calendar

### Project Structure
```
dominicana-tabs/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── prayer.tsx     # Prayer module
│   │   ├── study.tsx      # Study module
│   │   ├── community.tsx  # Community module
│   │   └── preaching.tsx  # Preaching module
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   └── FeastBanner.tsx   # Liturgical day banner
├── constants/            # App constants and configuration
│   └── Colors.ts         # Liturgical color scheme
├── services/             # Business logic and data services
│   └── LiturgicalCalendar.ts # Calendar calculations
├── types/                # TypeScript type definitions
│   └── index.ts          # App-wide type definitions
└── assets/               # Images, fonts, and static assets
```

## 🎨 Color Scheme

### Primary Colors
- **Liturgical Red**: `#8B0000` - Primary brand color
- **Royal Purple**: `#4B0082` - Secondary color
- **Liturgical Gold**: `#DAA520` - Accent color
- **Warm Cream**: `#F5F5DC` - Background color
- **Charcoal**: `#2F2F2F` - Text color

### Liturgical Seasons
- **Advent**: Purple (`#4B0082`)
- **Christmas**: White (`#FFFFFF`)
- **Ordinary Time**: Green (`#2E7D32`)
- **Lent**: Violet (`#6A1B9A`)
- **Easter**: White (`#FFFFFF`)
- **Pentecost**: Orange/Red (`#FF6F00`)

## 🔐 Authentication & Permissions

### Access Levels
- **Anonymous**: Prayer functions, basic liturgical information
- **User Login**: Ebook library access, reading progress tracking
- **Premium Subscription**: Audio content, advanced features

### Required Permissions
- **Location**: For province mapping and nearby communities
- **Storage**: For offline ebook storage and audio downloads
- **Calendar**: For liturgical event integration

## 📊 Data Sources

## 📖 Bible Reference API (for Liturgy of the Hours)

The app can retrieve Scripture by simple bible references, so your LOH JSON only needs to include a reference string.

### Supported reference forms
- Single verse: `"Genesis 1:1"`, `"Jn 1:1"`
- Intra-chapter range: `"Mat 5:3-9"`
- Cross-chapter range: `"Genesis 1:1-2:7"`
- Book names/abbreviations: flexible (e.g., `Gen`, `Gn`, `Genesis`, `Mt`, `Mat`, `Matthew`, `1 Sam`, `1 Samuel`, `1SA`)
- Dashes: en/em dashes are accepted and normalized

### Services
- Single-version (Douay-Rheims USX): `services/BibleService.ts`
- Multi-version (DR + Vulgate): `services/MultiVersionBibleService.ts`

### API
```ts
// Get structured verses for a reference
const passage = await bibleService.getPassageByReference('Genesis 1:1-2:7');
// {
//   bookCode: 'GEN',
//   startChapter: 1,
//   startVerse: 1,
//   endChapter: 2,
//   endVerse: 7,
//   verses: [{ number, text, reference }, ...],
//   reference: 'GEN 1:1-2:7'
// }

// Get a single string suitable for LOH content
const text = await bibleService.getPassageText('Mat 5:3-9', {
  includeVerseNumbers: false,   // omit or include verse numbers
  separator: ' '                // string used to join verses
});

// Multi-version: same API, with optional versionId
const mvText = await multiVersionBibleService.getPassageText('Jn 1:1');
const mvPassage = await multiVersionBibleService.getPassageByReference('Sir 1:1');
```

### Utilities (if you need to format or validate references)
`utils/bibleReference.ts` provides:
- `parseBibleReference(input)` → `{ bookCode, startChapter, startVerse, endChapter, endVerse } | null`
- `normalizeRangeOrder(parsed)` → ensures start ≤ end (swaps if reversed)
- `formatReference(parsed, style)` → returns a human-facing string
  - `style`: `'code' | 'abbr' | 'full'` (e.g., `GEN`, `Gen`, `Genesis`)

### Notes for LOH integration
- Prefer using `getPassageText` with `includeVerseNumbers: false` for reading texts.
- Use `separator: '\n'` if you need each verse on a new line; for continuous readings keep the default single space.
- Deuterocanonical books are supported (Sir, Tob, Bar, etc.). Internally, Baruch may appear as `BAR_LjeInBar`; utilities format it as `Bar/Baruch` for display.
- Reversed ranges like `Gen 1:5-1:2` are normalized automatically to `Gen 1:2-1:5`.

### Liturgical Calendar
- **Movable Feasts**: Easter cycle calculations using Meeus/Jones/Butcher algorithm
- **Fixed Celebrations**: Christmas, Corpus Christi, and other fixed feasts
- **Dominican Saints**: Comprehensive database of Dominican saints and blesseds
- **Universal Calendar**: Integration with Roman Catholic liturgical calendar

### Content Library
- **Catholic Classics**: Summa Theologica, Divine Comedy, Confessions, etc.
- **Dominican Writings**: Works by St. Thomas Aquinas, St. Catherine of Siena, etc.
- **Contemporary Resources**: Modern theological and spiritual writings

## 🚀 Deployment

### Expo Build
```bash
# Build for production
expo build:ios
expo build:android

# Submit to app stores
expo submit:ios
expo submit:android
```

### Web Deployment
```bash
# Build for web
expo build:web

# Deploy to hosting service
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain liturgical accuracy in all content
- Respect Dominican tradition and charism
- Test on multiple platforms before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Order of Preachers**: For spiritual guidance and Dominican tradition
- **Vatican Resources**: For liturgical inspiration and accuracy
- **Expo Team**: For the excellent development framework
- **Catholic Community**: For feedback and support

## 📞 Support

For support, questions, or feature requests:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common questions

---

*"To contemplate and to give to others the fruits of contemplation" - St. Thomas Aquinas, OP*

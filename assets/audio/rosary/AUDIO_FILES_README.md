# Rosary Audio Files Structure

This directory contains pre-recorded MP4 audio files for the rosary prayers.

## Directory Structure

```
assets/audio/rosary/
├── sign-of-cross.mp4
├── apostles-creed.mp4
├── our-father.mp4
├── hail-mary.mp4
├── glory-be.mp4
├── fatima-prayer.mp4
├── final-prayer.mp4
├── dominican-opening-1.mp4
├── dominican-opening-2.mp4
├── dominican-opening-3.mp4
├── transitions/
│   ├── bell.mp4
│   └── chime.mp4
├── background/
│   └── gregorian-chant.mp4
└── mysteries/
    ├── joyful-mysteries/
    │   ├── decade-1.mp4  (The Annunciation)
    │   ├── decade-2.mp4  (The Visitation)
    │   ├── decade-3.mp4  (The Nativity)
    │   ├── decade-4.mp4  (The Presentation)
    │   └── decade-5.mp4  (The Finding in the Temple)
    ├── sorrowful-mysteries/
    │   ├── decade-1.mp4  (The Agony in the Garden)
    │   ├── decade-2.mp4  (The Scourging)
    │   ├── decade-3.mp4  (The Crowning with Thorns)
    │   ├── decade-4.mp4  (The Carrying of the Cross)
    │   └── decade-5.mp4  (The Crucifixion)
    ├── glorious-mysteries/
    │   ├── decade-1.mp4  (The Resurrection)
    │   ├── decade-2.mp4  (The Ascension)
    │   ├── decade-3.mp4  (The Descent of the Holy Spirit)
    │   ├── decade-4.mp4  (The Assumption)
    │   └── decade-5.mp4  (The Coronation)
    └── luminous-mysteries/
        ├── decade-1.mp4  (The Baptism of Jesus)
        ├── decade-2.mp4  (The Wedding at Cana)
        ├── decade-3.mp4  (The Proclamation of the Kingdom)
        ├── decade-4.mp4  (The Transfiguration)
        └── decade-5.mp4  (The Institution of the Eucharist)
```

## File Specifications

- **Format**: MP4 audio
- **Codec**: AAC preferred
- **Bitrate**: 128kbps or higher
- **Sample Rate**: 44.1kHz or 48kHz
- **Channels**: Mono or Stereo

## Audio Content Guide

### Core Prayers

- **sign-of-cross.mp4**: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen."
- **apostles-creed.mp4**: Full Apostles' Creed
- **our-father.mp4**: Full Our Father prayer
- **hail-mary.mp4**: Full Hail Mary prayer
- **glory-be.mp4**: Full Glory Be prayer
- **fatima-prayer.mp4**: "O my Jesus, forgive us our sins..." (Standard rosary only)
- **final-prayer.mp4**: Hail Holy Queen and closing prayer

### Dominican Opening Prayers

- **dominican-opening-1.mp4**: "V. Hail Mary, full of grace... R. Blessed art thou..."
- **dominican-opening-2.mp4**: "V. O Lord, open my lips... R. And my mouth will proclaim..."
- **dominican-opening-3.mp4**: "V. O God, come to my assistance... R. O Lord, make haste..."

### Mystery Announcements

Each decade-N.mp4 file should contain:
1. Mystery name announcement
2. Brief meditation text
3. Optional silence for personal meditation

Example for joyful-mysteries/decade-1.mp4:
"The First Joyful Mystery: The Annunciation. Mary's 'yes' to God changed the world..."

### Transition Sounds

- **bell.mp4**: Brief bell chime for bead transitions (1-2 seconds)
- **chime.mp4**: Alternative chime sound (1-2 seconds)

### Background Music

- **gregorian-chant.mp4**: Ambient Gregorian chant music (loopable, 3-5 minutes)

## Usage in Code

Audio files are referenced in `services/RosaryService.ts` when generating beads:

```typescript
{
  id: 'opening-our-father',
  type: 'our-father',
  title: 'Our Father',
  text: PRAYER_TEXTS.ourFather,
  audioFile: 'assets/audio/rosary/our-father.mp4'
}
```

## Implementation Notes

1. **Mobile (React Native)**: Use `expo-av` Audio API
2. **Web**: Use HTML5 `<audio>` element
3. **Offline Support**: All files should be bundled with the app
4. **Optional**: Implement progressive download for web version
5. **Playback Features**:
   - Adjustable speed (0.5x - 2x)
   - Volume control
   - Auto-advance to next bead
   - Background music mixing

## File Size Optimization

- Keep individual prayer files under 500KB
- Mystery meditation files can be up to 2MB
- Background music should be optimized for looping
- Consider providing both high-quality and compressed versions

## Recording Guidelines

- Use professional voice talent or high-quality recordings
- Maintain consistent volume levels across all files
- Include 0.5 second silence at start and end of each file
- Use room tone or subtle reverb for natural sound
- Avoid background noise or artifacts
- Consider recording in a prayer-appropriate tone (reverent, peaceful)

## Future Enhancements

- Multiple language support (Spanish, Latin)
- Multiple voice options (male, female, various accents)
- Downloadable audio packs for different preferences
- User-uploaded custom recordings


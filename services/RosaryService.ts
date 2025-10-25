/**
 * Rosary Service
 * Generates the complete rosary bead structure for prayer navigation
 */

import { RosaryBead, RosaryForm, MysterySet, FinalPrayerConfig } from '../types/rosary-types';
import { PRAYER_TEXTS, ROSARY_MYSTERIES, FINAL_PRAYERS } from '../constants/rosaryData';
import { isLent } from '../assets/data/calendar/liturgical-seasons';

export class RosaryService {
  /**
   * Generate all beads for a complete rosary
   */
  generateRosaryBeads(form: RosaryForm, mysterySet: MysterySet, isLentSeason?: boolean, finalPrayers?: FinalPrayerConfig[]): RosaryBead[] {
    const beads: RosaryBead[] = [];
    let order = 0;

    // Opening prayers - DIFFERENT for Dominican vs Standard forms
    if (form === 'dominican') {
      // DOMINICAN FORM: Liturgical opening from Divine Office
      // Then goes directly to the decades
      
      beads.push({
        id: 'opening-sign-of-cross',
        type: 'sign-of-cross',
        title: 'Sign of the Cross',
        text: PRAYER_TEXTS.signOfCross,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/sign-of-cross.m4a'
      });

      beads.push({
        id: 'dominican-opening-1',
        type: 'dominican-opening',
        title: 'Dominican Opening - Hail Mary',
        text: PRAYER_TEXTS.dominicanOpening1,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/dominican-opening-1.m4a'
      });

      beads.push({
        id: 'dominican-opening-2',
        type: 'dominican-opening',
        title: 'Dominican Opening - Open My Lips',
        text: PRAYER_TEXTS.dominicanOpening2,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/dominican-opening-2.m4a'
      });

      beads.push({
        id: 'dominican-opening-3',
        type: 'dominican-opening',
        title: 'Dominican Opening - Come to My Assistance',
        text: PRAYER_TEXTS.dominicanOpening3,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/dominican-opening-3.m4a'
      });

      // Glory Be + Alleluia (combined, Alleluia omitted during Lent)
      // Use passed isLentSeason parameter if provided, otherwise check liturgical calendar
      const isLentPeriod = isLentSeason !== undefined ? isLentSeason : isLent(new Date());
      const gloryBeText = isLentPeriod 
        ? PRAYER_TEXTS.dominicanOpeningGloryBe 
        : `${PRAYER_TEXTS.dominicanOpeningGloryBe}\n\n${PRAYER_TEXTS.alleluia}`;
      
      beads.push({
        id: 'dominican-opening-glory-be',
        type: 'glory-be',
        title: 'Glory Be',
        text: gloryBeText,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/dominican-opening-glory-be.m4a'
      });

      // Dominican form goes DIRECTLY to the decades now
      // No Apostles' Creed, no Our Father, no 3 Hail Marys
      // Alleluia is combined with Glory Be (not a separate bead)
      
    } else {
      // STANDARD FORM: Traditional preparatory prayers
      
      beads.push({
        id: 'opening-sign-of-cross',
        type: 'sign-of-cross',
        title: 'Sign of the Cross',
        text: PRAYER_TEXTS.signOfCross,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/sign-of-cross.m4a'
      });

      // Apostles' Creed (ONLY in Standard form) - randomly select from 2 variations
      const apostlesCreedVariation = Math.floor(Math.random() * 2) + 1;
      beads.push({
        id: 'opening-apostles-creed',
        type: 'apostles-creed',
        title: 'Apostles\' Creed',
        text: PRAYER_TEXTS.apostlesCreed,
        order: order++,
        decadeNumber: 0,
        audioFile: `assets/audio/rosary/apostles-creed-${apostlesCreedVariation}.m4a`
      });

      // Our Father (ONLY in Standard form opening) - randomly select from 3 variations
      const openingOurFatherVariation = Math.floor(Math.random() * 3) + 1;
      beads.push({
        id: 'opening-our-father',
        type: 'our-father',
        title: 'Our Father',
        text: PRAYER_TEXTS.ourFather,
        order: order++,
        decadeNumber: 0,
        audioFile: `assets/audio/rosary/our-father-${openingOurFatherVariation}.m4a`
      });

      // Three Hail Marys (ONLY in Standard form)
      beads.push({
        id: 'opening-hail-mary-faith',
        type: 'hail-mary',
        title: 'Hail Mary (Faith)',
        text: `${PRAYER_TEXTS.hailMary}`,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/hail-mary-01.m4a'
      });

      beads.push({
        id: 'opening-hail-mary-hope',
        type: 'hail-mary',
        title: 'Hail Mary (Hope)',
        text: `${PRAYER_TEXTS.hailMary}`,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/hail-mary-02.m4a'
      });

      beads.push({
        id: 'opening-hail-mary-charity',
        type: 'hail-mary',
        title: 'Hail Mary (Charity)',
        text: `${PRAYER_TEXTS.hailMary}`,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/hail-mary-03.m4a'
      });

      // Glory Be after opening (ONLY in Standard form) - randomly select from 4 variations
      const openingGloryBeVariation = Math.floor(Math.random() * 5) + 1;
      beads.push({
        id: 'opening-glory-be-final',
        type: 'glory-be',
        title: 'Glory Be',
        text: PRAYER_TEXTS.gloryBe,
        order: order++,
        decadeNumber: 0,
        audioFile: `assets/audio/rosary/glory-be-${openingGloryBeVariation}.m4a`
      });
    }

    // Get the mystery data
    const mysteryData = ROSARY_MYSTERIES.find(m => m.name === mysterySet);
    if (!mysteryData) {
      throw new Error(`Mystery set not found: ${mysterySet}`);
    }

    // Generate 5 decades
    for (let decade = 1; decade <= 5; decade++) {
      const mystery = mysteryData.mysteries[decade - 1];

      // Mystery announcement
      beads.push({
        id: `decade-${decade}-mystery`,
        type: 'mystery-announcement',
        title: mystery.name,
        text: `${mystery.name}\n\n${mystery.meditation}\n\nScripture: ${mystery.bibleReference}`,
        order: order++,
        decadeNumber: decade,
        beadNumber: 0,
        audioFile: `assets/audio/rosary/mysteries/${mysterySet.toLowerCase().replace(/ /g, '-')}/decade-${decade}.m4a`
      });

      // Our Father - randomly select from 3 variations
      const ourFatherVariation = Math.floor(Math.random() * 3) + 1;
      beads.push({
        id: `decade-${decade}-our-father`,
        type: 'our-father',
        title: 'Our Father',
        text: PRAYER_TEXTS.ourFather,
        order: order++,
        decadeNumber: decade,
        beadNumber: 0,
        audioFile: `assets/audio/rosary/our-father-${ourFatherVariation}.m4a`
      });

      // 10 Hail Marys - randomly select from 20 variations
      for (let hailMary = 1; hailMary <= 10; hailMary++) {
        // Randomly select from 1-20
        const variation = Math.floor(Math.random() * 20) + 1;
        const paddedVariation = variation.toString().padStart(2, '0');
        beads.push({
          id: `decade-${decade}-hail-mary-${hailMary}`,
          type: 'hail-mary',
          title: `Hail Mary ${hailMary}`,
          text: PRAYER_TEXTS.hailMary,
          order: order++,
          decadeNumber: decade,
          beadNumber: hailMary,
          audioFile: `assets/audio/rosary/hail-mary-${paddedVariation}.m4a`
        });
      }

      // Glory Be - randomly select from 5 variations
      // Use dominican-glory-be for Dominican form, regular glory-be for Standard form
      const gloryBeVariation = Math.floor(Math.random() * 5) + 1;
      const gloryBePrefix = form === 'dominican' ? 'dominican-glory-be' : 'glory-be';
      const gloryBeText = form === 'dominican' ? PRAYER_TEXTS.dominicanGloryBe : PRAYER_TEXTS.gloryBe;
      beads.push({
        id: `decade-${decade}-glory-be`,
        type: 'glory-be',
        title: 'Glory Be',
        text: gloryBeText,
        order: order++,
        decadeNumber: decade,
        beadNumber: 11,
        audioFile: `assets/audio/rosary/${gloryBePrefix}-${gloryBeVariation}.m4a`
      });

      // Fatima Prayer (standard form only)
      if (form === 'standard') {
        beads.push({
          id: `decade-${decade}-fatima`,
          type: 'fatima',
          title: 'Fatima Prayer',
          text: PRAYER_TEXTS.fatimaPrayer,
          order: order++,
          decadeNumber: decade,
          beadNumber: 12,
          audioFile: 'assets/audio/rosary/fatima-prayer.m4a'
        });
      }
    }

    // Final prayers - single bead on medallion with all selected prayers
    const finalPrayersConfig = finalPrayers || [
      { id: 'hail_holy_queen', order: 1 },
      { id: 'versicle_response', order: 2 },
      { id: 'rosary_prayer', order: 3 }
    ];

    // Sort by order and combine all selected prayers into one text
    const selectedPrayers = finalPrayersConfig
      .sort((a, b) => a.order - b.order)
      .map((prayerConfig) => {
        const prayerMeta = FINAL_PRAYERS.find(p => p.id === prayerConfig.id);
        if (!prayerMeta) return null;
        
        const textKey = prayerMeta.textKey as keyof typeof PRAYER_TEXTS;
        return {
          name: prayerMeta.name,
          text: PRAYER_TEXTS[textKey],
          audioFile: `assets/audio/rosary/${prayerConfig.id}.m4a`
        };
      })
      .filter(Boolean);

    if (selectedPrayers.length > 0) {
      // Combine all prayers into one text
      const combinedText = selectedPrayers
        .map(prayer => prayer.text)
        .join('\n\n');
      
      // Create single final prayer bead on medallion
      beads.push({
        id: 'final-prayers',
        type: 'our-father', // This represents the medallion
        title: 'Final Prayers',
        text: combinedText,
        order: order++,
        decadeNumber: 6, // Medallion is at the center
        audioFile: selectedPrayers.length === 1 
          ? selectedPrayers[0].audioFile 
          : 'assets/audio/rosary/final-prayer.m4a' // Use combined audio if multiple prayers
      });
    }

    return beads;
  }

  /**
   * Get bead by ID
   */
  getBeadById(beads: RosaryBead[], id: string): RosaryBead | undefined {
    return beads.find(bead => bead.id === id);
  }

  /**
   * Get next bead
   */
  getNextBead(beads: RosaryBead[], currentBeadId: string): RosaryBead | null {
    const currentIndex = beads.findIndex(bead => bead.id === currentBeadId);
    if (currentIndex === -1 || currentIndex === beads.length - 1) {
      return null;
    }
    return beads[currentIndex + 1];
  }

  /**
   * Get previous bead
   */
  getPreviousBead(beads: RosaryBead[], currentBeadId: string): RosaryBead | null {
    const currentIndex = beads.findIndex(bead => bead.id === currentBeadId);
    if (currentIndex <= 0) {
      return null;
    }
    return beads[currentIndex - 1];
  }

  /**
   * Get all beads for a specific decade
   */
  getBeadsForDecade(beads: RosaryBead[], decadeNumber: number): RosaryBead[] {
    return beads.filter(bead => bead.decadeNumber === decadeNumber);
  }

  /**
   * Jump to a specific decade's first bead
   */
  getFirstBeadOfDecade(beads: RosaryBead[], decadeNumber: number): RosaryBead | null {
    const decadeBeads = this.getBeadsForDecade(beads, decadeNumber);
    return decadeBeads.length > 0 ? decadeBeads[0] : null;
  }

  /**
   * Calculate progress percentage
   */
  getProgress(beads: RosaryBead[], currentBeadId: string): number {
    const currentIndex = beads.findIndex(bead => bead.id === currentBeadId);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / beads.length) * 100);
  }

  /**
   * Get opening beads (decade 0)
   */
  getOpeningBeads(beads: RosaryBead[]): RosaryBead[] {
    return beads.filter(bead => bead.decadeNumber === 0);
  }

  /**
   * Get closing beads (decade 6)
   */
  getClosingBeads(beads: RosaryBead[]): RosaryBead[] {
    return beads.filter(bead => bead.decadeNumber === 6);
  }
}

export const rosaryService = new RosaryService();


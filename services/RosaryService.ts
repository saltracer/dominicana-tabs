/**
 * Rosary Service
 * Generates the complete rosary bead structure for prayer navigation
 */

import { RosaryBead, RosaryForm, MysterySet } from '../types/rosary-types';
import { PRAYER_TEXTS, ROSARY_MYSTERIES } from '../constants/rosaryData';

export class RosaryService {
  /**
   * Generate all beads for a complete rosary
   */
  generateRosaryBeads(form: RosaryForm, mysterySet: MysterySet): RosaryBead[] {
    const beads: RosaryBead[] = [];
    let order = 0;

    // Opening prayers
    if (form === 'dominican') {
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

      beads.push({
        id: 'opening-glory-be',
        type: 'glory-be',
        title: 'Glory Be',
        text: PRAYER_TEXTS.gloryBe,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/glory-be.m4a'
      });
    } else {
      // Standard form
      beads.push({
        id: 'opening-sign-of-cross',
        type: 'sign-of-cross',
        title: 'Sign of the Cross',
        text: PRAYER_TEXTS.signOfCross,
        order: order++,
        decadeNumber: 0,
        audioFile: 'assets/audio/rosary/sign-of-cross.m4a'
      });
    }

    // Apostles' Creed
    beads.push({
      id: 'opening-apostles-creed',
      type: 'apostles-creed',
      title: 'Apostles\' Creed',
      text: PRAYER_TEXTS.apostlesCreed,
      order: order++,
      decadeNumber: 0,
        audioFile: 'assets/audio/rosary/apostles-creed.m4a'
    });

    // Our Father
    beads.push({
      id: 'opening-our-father',
      type: 'our-father',
      title: 'Our Father',
      text: PRAYER_TEXTS.ourFather,
      order: order++,
      decadeNumber: 0,
      audioFile: 'assets/audio/rosary/our-father.mp4'
    });

    // Three Hail Marys
    beads.push({
      id: 'opening-hail-mary-faith',
      type: 'hail-mary',
      title: 'Hail Mary (Faith)',
      text: `${PRAYER_TEXTS.hailMary}\n\n${PRAYER_TEXTS.hailMaryFaith}`,
      order: order++,
      decadeNumber: 0,
      audioFile: 'assets/audio/rosary/hail-mary.mp4'
    });

    beads.push({
      id: 'opening-hail-mary-hope',
      type: 'hail-mary',
      title: 'Hail Mary (Hope)',
      text: `${PRAYER_TEXTS.hailMary}\n\n${PRAYER_TEXTS.hailMaryHope}`,
      order: order++,
      decadeNumber: 0,
      audioFile: 'assets/audio/rosary/hail-mary.mp4'
    });

    beads.push({
      id: 'opening-hail-mary-charity',
      type: 'hail-mary',
      title: 'Hail Mary (Charity)',
      text: `${PRAYER_TEXTS.hailMary}\n\n${PRAYER_TEXTS.hailMaryCharity}`,
      order: order++,
      decadeNumber: 0,
      audioFile: 'assets/audio/rosary/hail-mary.mp4'
    });

    // Glory Be after opening
    beads.push({
      id: 'opening-glory-be-final',
      type: 'glory-be',
      title: 'Glory Be',
      text: PRAYER_TEXTS.gloryBe,
      order: order++,
      decadeNumber: 0,
      audioFile: 'assets/audio/rosary/glory-be.mp4'
    });

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
        text: `The ${mystery.name}\n\n${mystery.meditation}\n\nScripture: ${mystery.bibleReference}`,
        order: order++,
        decadeNumber: decade,
        beadNumber: 0,
        audioFile: `assets/audio/rosary/mysteries/${mysterySet.toLowerCase().replace(/ /g, '-')}/decade-${decade}.m4a`
      });

      // Our Father
      beads.push({
        id: `decade-${decade}-our-father`,
        type: 'our-father',
        title: 'Our Father',
        text: PRAYER_TEXTS.ourFather,
        order: order++,
        decadeNumber: decade,
        beadNumber: 0,
        audioFile: 'assets/audio/rosary/our-father.m4a'
      });

      // 10 Hail Marys
      for (let hailMary = 1; hailMary <= 10; hailMary++) {
        beads.push({
          id: `decade-${decade}-hail-mary-${hailMary}`,
          type: 'hail-mary',
          title: `Hail Mary ${hailMary}`,
          text: PRAYER_TEXTS.hailMary,
          order: order++,
          decadeNumber: decade,
          beadNumber: hailMary,
          audioFile: 'assets/audio/rosary/hail-mary.m4a'
        });
      }

      // Glory Be
      beads.push({
        id: `decade-${decade}-glory-be`,
        type: 'glory-be',
        title: 'Glory Be',
        text: PRAYER_TEXTS.gloryBe,
        order: order++,
        decadeNumber: decade,
        beadNumber: 11,
        audioFile: 'assets/audio/rosary/glory-be.m4a'
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

    // Final prayers
    beads.push({
      id: 'closing-final-prayer',
      type: 'our-father',
      title: 'Final Prayer',
      text: PRAYER_TEXTS.finalPrayer,
      order: order++,
      decadeNumber: 6,
        audioFile: 'assets/audio/rosary/final-prayer.m4a'
    });

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


import { MarianHymnComponent } from '@/types/compline-types';
import { 
  calculateEaster, 
  getAshWednesday, 
  getPentecostSunday,
  getBaptismOfLordSunday,
  calculateFirstAdventSunday
} from '../../calendar/liturgical-seasons';

// The four seasonal Marian antiphons with their hymn data
const marianHymnsData = {
  'alma-redemptoris-mater': {
    title: {
      en: { text: "Loving Mother of the Redeemer" },
      la: { text: "Alma Redemptoris Mater" }
    },
    content: {
      en: {
        text: "Loving Mother of the Redeemer,\nGate of heaven, star of the sea,\nAssist your people who have fallen yet strive to rise again.\nTo the wonderment of nature you bore your Creator,\nYet remained a virgin after as before.\nYou who received Gabriel's joyful greeting,\nHave pity on us poor sinners."
      },
      la: {
        text: "Alma Redemptoris Mater,\nquae pervia caeli porta manes,\net stella maris, succurre cadenti,\nsurgere qui curat, populo:\ntu quae genuisti, natura mirante,\ntuum sanctum Genitorem,\nVirgo prius ac posterius,\nGabrielis ab ore sumens illud Ave,\npeccatorum miserere."
      }
    },
    metadata: {
      composer: "Traditional",
      century: "11th century",
      meter: "Irregular",
      tune: "Alma Redemptoris Mater"
    }
  },
  'ave-regina-caelorum': {
    title: {
      en: { text: "Hail, Queen of Heaven" },
      la: { text: "Ave Regina Caelorum" }
    },
    content: {
      en: {
        text: "Hail, Queen of Heaven, hail, Mistress of Angels;\nHail, root of Jesse, hail, the gate through which the Light rose over the earth.\nRejoice, O glorious Virgin, beautiful among all women.\nHail, O radiant light, and pour forth your mercy upon us.\nVouchsafe that I may praise you, O sacred Virgin;\ngive me strength against your enemies."
      },
      la: {
        text: "Ave, Regina caelorum,\nAve, Domina Angelorum:\nSalve, radix, salve, porta,\nEx qua mundo lux est orta:\n\nGaude, Virgo gloriosa,\nSuper omnes speciosus,\nVale, o valde decora,\nEt pro nobis Christum exora."
      }
    },
    metadata: {
      composer: "Traditional",
      century: "12th century",
      meter: "Irregular",
      tune: "Ave Regina Caelorum"
    }
  },
  'regina-caeli': {
    title: {
      en: { text: "Queen of Heaven" },
      la: { text: "Regina Caeli" }
    },
    content: {
      en: {
        text: "Queen of Heaven, rejoice, alleluia.\nFor He whom you merited to bear, alleluia,\nHas risen, as He said, alleluia.\nPray for us to God, alleluia.\n\nRejoice and be glad, O Virgin Mary, alleluia.\nFor the Lord has truly risen, alleluia."
      },
      la: {
        text: "Regina caeli, laetare, alleluia,\nQuia quem meruisti portare, alleluia,\nResurrexit, sicut dixit, alleluia,\nOra pro nobis Deum, alleluia.\n\nGaude et laetare, Virgo Maria, alleluia,\nQuia surrexit Dominus vere, alleluia."
      }
    },
    metadata: {
      composer: "Traditional",
      century: "12th century",
      meter: "Irregular",
      tune: "Regina Caeli"
    }
  },
  'salve-regina': {
    title: {
      en: { text: "Hail, Holy Queen" },
      la: { text: "Salve Regina" }
    },
    content: {
      en: {
        text: "Hail, holy Queen, Mother of mercy,\nour life, our sweetness, and our hope.\nTo thee do we cry, poor banished children of Eve;\nto thee do we send up our sighs,\nmourning and weeping in this valley of tears.\n\nTurn then, most gracious advocate,\nthine eyes of mercy toward us;\nand after this our exile,\nshow unto us the blessed fruit of thy womb, Jesus.\nO clement, O loving, O sweet Virgin Mary.\n\nPray for us, O holy Mother of God,\nthat we may be made worthy of the promises of Christ."
      },
      la: {
        text: "Salve Regina, Mater misericordiae,\nVita, dulcedo, et spes nostra, salve.\nAd te clamamus, exsules filii Evae;\nAd te suspiramus, gementes et flentes\nin hac lacrimarum valle.\n\nEia ergo, advocata nostra,\nillos tuos misericordes oculos\nad nos converte;\nEt Iesum, benedictum fructum ventris tui,\nnobis post hoc exsilium ostende.\nO clemens, O pia, O dulcis Virgo Maria.\n\nOra pro nobis, sancta Dei Genitrix,\nut digni efficiamur promissionibus Christi."
      }
    },
    metadata: {
      composer: "Traditional",
      century: "11th century",
      meter: "Irregular",
      tune: "Salve Regina"
    }
  }
};

/**
 * Gets the appropriate Marian hymn for a given date based on liturgical calendar
 */
export function getMarianHymnForDate(date: Date): MarianHymnComponent {
  const year = date.getFullYear();
  
  // Calculate key liturgical dates for the year
  const easterDate = calculateEaster(year);
  const pentecostDate = getPentecostSunday(year);
  const baptismOfLordDate = getBaptismOfLordSunday(year);
  const firstAdventDate = calculateFirstAdventSunday(new Date(year, 0, 1));
  
  // Calculate the day of year for comparison
  const dateYday = getDayOfYear(date);
  const easterYday = getDayOfYear(easterDate);
  const pentecostYday = getDayOfYear(pentecostDate);
  const baptismYday = getDayOfYear(baptismOfLordDate);
  const firstAdventYday = getDayOfYear(firstAdventDate);
  
  // Determine which Marian hymn to use based on exact liturgical boundaries
  let hymnId: string;
  
  // Handle year boundary case: First Sunday of Advent (late Nov/Dec) to Baptism of Lord (early Jan)
  if (firstAdventYday > baptismYday) {
    // Year boundary case: Advent in year N, Baptism in year N+1
    if (dateYday >= firstAdventYday || dateYday <= baptismYday) {
      // Alma Redemptoris Mater: First Sunday of Advent to Baptism of the Lord
      hymnId = 'alma-redemptoris-mater';
    } else if (dateYday > baptismYday && dateYday < easterYday) {
      // Ave Regina Caelorum: Day after Baptism of the Lord to day before Easter
      hymnId = 'ave-regina-caelorum';
    } else if (dateYday >= easterYday && dateYday <= pentecostYday) {
      // Regina Caeli: Easter Sunday to Pentecost Sunday
      hymnId = 'regina-caeli';
    } else {
      // Salve Regina: Day after Pentecost to day before First Sunday of Advent
      hymnId = 'salve-regina';
    }
  } else {
    // Normal case: All dates in same year (shouldn't happen with current liturgical calendar)
    if (dateYday >= firstAdventYday && dateYday <= baptismYday) {
      // Alma Redemptoris Mater: First Sunday of Advent to Baptism of the Lord
      hymnId = 'alma-redemptoris-mater';
    } else if (dateYday > baptismYday && dateYday < easterYday) {
      // Ave Regina Caelorum: Day after Baptism of the Lord to day before Easter
      hymnId = 'ave-regina-caelorum';
    } else if (dateYday >= easterYday && dateYday <= pentecostYday) {
      // Regina Caeli: Easter Sunday to Pentecost Sunday
      hymnId = 'regina-caeli';
    } else {
      // Salve Regina: Day after Pentecost to day before First Sunday of Advent
      hymnId = 'salve-regina';
    }
  }
  
  console.warn(`🎵 Liturgical Marian hymn selection:`, {
    date: date.toDateString(),
    dateYday,
    firstAdventDate: firstAdventDate.toDateString(),
    firstAdventYday,
    baptismDate: baptismOfLordDate.toDateString(),
    baptismYday,
    easterDate: easterDate.toDateString(),
    easterYday,
    pentecostDate: pentecostDate.toDateString(),
    pentecostYday,
    yearBoundaryCase: firstAdventYday > baptismYday,
    selectedHymn: hymnId
  });
  
  // Get the hymn data and convert to MarianHymnComponent
  const hymnData = marianHymnsData[hymnId as keyof typeof marianHymnsData];
  
  return {
    id: hymnId,
    type: 'marian-hymn',
    title: hymnData.title,
    content: hymnData.content,
    metadata: {
      ...hymnData.metadata,
      season: hymnId
    }
  };
}

/**
 * Helper function to get day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

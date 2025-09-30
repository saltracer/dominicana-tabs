import { ComplineDataByDay } from '@/types/compline-types';

export const ordinaryTimeCompline: ComplineDataByDay = {
  id: 'compline-ordinary-time',
  version: '1.0.0',
  lastUpdated: '2024-01-15T00:00:00Z',
  season: {
    name: 'Ordinary Time',
    color: '#228B22',
    startDate: '2024-01-08',
    endDate: '2024-02-13',
    description: 'The season of Ordinary Time in the liturgical year'
  },
  rank: 'ferial',
  sharedComponents: {
    opening: {
      id: 'opening-ot',
      type: 'opening',
      content: {
        en: {
          text: "God, come to my assistance.\n - Lord, make haste to help me.\n Glory to the Father, and to the Son, and to the Holy Spirit,\n as it was in the beginning, is now, and will be for ever. Amen."
        },
        la: {
          text: "Deus, in adiutorium meum intende.\nDomine, ad adiuvandum me festina.\nGloria Patri, et Filio, et Spiritui Sancto, sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen."
        }
      }
    },
    examinationOfConscience: {
      id: 'examination-ot',
      type: 'examination',
      content: {
        en: {
          text: ""
        },
        la: {
          text: ""
        }
      },
      rubric: {
        en: {
          text: "A brief examination of conscience may be made. In the communal celebration of the office, a penitential rite using the formulas of the Mass my be inserted here."
        },
        la: {
          text: "Examen conscientiae fieri potest in silentio vel his vel similibus verbis:"
        }
      }
    },
    hymn: {
      id: 'hymn-te-lucis',
      type: 'hymn',
      title: {
        en: { text: "Now that the daylight dies away" },
        la: { text: "Te Lucis Ante Terminum" }
      },
      content: {
        en: {
          text: "Now that the daylight dies away,\nBy all thy grace and love\nThee maker of the world we pray\nTo watch our bed above.\n\nLet dreams depart and phantoms fly,\nThe offspring of the night,\nKeep us like shrines, beneath thing eye,\nPure in our foe's despite.\n\nThis grace on they redeemed confer,\nFather, co-equal Son,\nAnd Holy Ghost, the Comforter,\nEternal Three in One."
        },
        la: {
          text: "Te lucis ante terminum,\nrerum Creator, poscimus,\nut pro tua clementia\nsis praesul et custodia.\n\nProcul recedant somnia\net noctium phantasmata;\nhostemque nostrum comprime,\nne polluantur corpora.\n\nPraesta, Pater piissime,\nPatrique compar Unice,\ncum Spiritu Paraclito\nregnans per omne saeculum."
        }
      },
      metadata: {
        composer: "Traditional",
        century: "7th century",
        meter: "8.8.8.8",
        tune: "Te Lucis"
      }
    },
    responsory: {
      id: 'responsory-compline',
      type: 'responsory',
      content: {
        en: {
          text: "Into your hands, O Lord, I commend my spirit.\n - Into your hands, Lord, I commend my spirit.\nYou have redeemed us, Lord God of truth.\n - I commend my spirit. \nGlory to the Father, and to the Son, and to the Holy Spirit.\n - Into your hands, Lord, I commend my spirit."
        },
        la: {
          text: "℟. In manus tuas, Domine, commendo spiritum meum.\n℣. Redemisti nos, Domine, Deus veritatis.\n℟. Gloria Patri, et Filio, et Spiritui Sancto."
        }
      }
    },
    canticle: {
      id: 'canticle-simeon',
      type: 'canticle',
      name: "Canticle of Simeon",
      antiphon: {
        en: { text: "Protect us, Lord, as we stay awake; watch over us as we sleep; that awake, we may keep watch with Christ, and asleep, rest in his peace." },
        la: { text: "Salva nos, Domine, vigilantes, custodi nos dormientes." }
      },
      scriptureRef: {
        book: "LUK",
        chapter: 2,
        verse: "29-32",
        translation: "DRA"
      },
      content: {
        en: {
          text: "Lord, now you let your servant go in peace; your word has been fulfilled:\nMy own eyes have seen the salvation which you have prepared in the sight of every people:\na light to reveal you to the nations and the glory of your people Israel."
        },
        la: {
          text: "Nunc dimittis servum tuum, Domine,\nsecundum verbum tuum in pace:\nquia viderunt oculi mei salutare tuum,\nquod parasti ante faciem omnium populorum,\nlumen ad revelationem gentium,\net gloriam plebis tuae Israel."
        }
      },
      metadata: {
        biblical_reference: "Luke 2:29-32",
        mode: 8
      }
    },
    finalBlessing: {
      id: 'blessing-final',
      type: 'blessing',
      content: {
        en: {
          text: "May the all-powerful Lord grant us a restful night and a peaceful death.\nAmen."
        },
        la: {
          text: "Benedicat nos omnipotens Dominus, quiete nocte et perfecto fine.\nAmen."
        }
      }
    }
  },
  days: {
    sunday: {
      psalmody: {
        id: 'psalm-91',
        type: 'psalm',
        psalmNumber: 91,
        antiphon: {
          en: { text: "Night holds no terror for me sleeping under God's wings." },
          la: { text: "Alis suis obrmbrabit tibi; non timebis a timore nocturno." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 90,
          verse: "1-16",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 2",
          mode: 2
        }
      },
      reading: {
        id: 'reading-revelation',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "REV",
          chapter: 22,
          verse: "4-5",
          translation: "DRA"
        },
        source: {
          en: { text: "Revelation 22:4-5" },
          la: { text: "Apocalypsi 22:4-5" }
        },
        metadata: {
          author: "Saint John"
        }
      },
      concludingPrayer: {
        id: 'prayer-compline',
        type: 'prayer',
        title: {
          en: { text: "Concluding Prayer" },
          la: { text: "Oratio Conclusiva" }
        },
        content: {
          en: {
            text: "Lord, we have celebrated today the mystery of the rising of Christ to new life.\nMay we now rest in your peace, safe from all that could harm us,\nand rise again refreshed and joyful, to praise you throughout another day.\nWe ask this through Christ our Lord."
          },
          la: {
            text: "Domine, celebramus hodie mysterium de resurrectione Christi ad novam vitam.\n Nos tibi nocte reponemus, ut non deficiamus ab omnibus quae nos possunt perire, et resurgere renovati et laetiti, ad te laudare per omne die. Per Dominum nostrum Iesum Christum."
          }
        }
      }
    },
    monday: {
      psalmody: {
        id: 'psalm-134',
        type: 'psalm',
        psalmNumber: 134,
        antiphon: {
          en: { text: "Come, bless the Lord, all you servants of the Lord." },
          la: { text: "Ecce nunc benedicite Dominum, omnes servi Domini." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 134,
          verse: "1-3",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 4",
          mode: 4
        }
      },
      reading: {
        id: 'reading-james',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "JAS",
          chapter: 4,
          verse: "7-8",
          translation: "DRA"
        },
        source: {
          en: { text: "From the Letter of James" },
          la: { text: "Ex Epistula Iacobi" }
        },
        metadata: {
          author: "Saint James"
        }
      },
      concludingPrayer: {
        id: 'prayer-compline',
        type: 'prayer',
        title: {
          en: { text: "Concluding Prayer" },
          la: { text: "Oratio Conclusiva" }
        },
        content: {
          en: {
            text: "Visit this place, O Lord, and drive far from it all snares of the enemy; let your holy angels dwell with us to preserve us in peace; and let your blessing be upon us always. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever."
          },
          la: {
            text: "Visita, quaesumus, Domine, habitationem istam, et omnes insidias inimici ab ea longe repelle: angeli tui sancti habitent in ea, qui nos in pace custodiant, et benedictio tua sit super nos semper. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
          }
        }
      }
    },
    tuesday: {
      psalmody: {
        id: 'psalm-16',
        type: 'psalm',
        psalmNumber: 16,
        antiphon: {
          en: { text: "You show me the path of life." },
          la: { text: "Notas mihi fecisti vias vitae." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 16,
          verse: "1-11",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 5",
          mode: 5
        }
      },
      reading: {
        id: 'reading-romans',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "ROM",
          chapter: 8,
          verse: "38-39",
          translation: "DRA"
        },
        source: {
          en: { text: "From the Letter to the Romans" },
          la: { text: "Ex Epistula ad Romanos" }
        },
        metadata: {
          author: "Saint Paul"
        }
      },
      concludingPrayer: {
        id: 'prayer-compline',
        type: 'prayer',
        title: {
          en: { text: "Concluding Prayer" },
          la: { text: "Oratio Conclusiva" }
        },
        content: {
          en: {
            text: "Visit this place, O Lord, and drive far from it all snares of the enemy; let your holy angels dwell with us to preserve us in peace; and let your blessing be upon us always. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever."
          },
          la: {
            text: "Visita, quaesumus, Domine, habitationem istam, et omnes insidias inimici ab ea longe repelle: angeli tui sancti habitent in ea, qui nos in pace custodiant, et benedictio tua sit super nos semper. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
          }
        }
      }
    },
    wednesday: {
      psalmody: {
        id: 'psalm-86',
        type: 'psalm',
        psalmNumber: 86,
        antiphon: {
          en: { text: "Incline your ear, O Lord, and answer me." },
          la: { text: "Inclina, Domine, aurem tuam et exaudi me." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 86,
          verse: "1-17",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 6",
          mode: 6
        }
      },
      reading: {
        id: 'reading-corinthians',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "2CO",
          chapter: 4,
          verse: "7-9",
          translation: "DRA"
        },
        source: {
          en: { text: "From the Second Letter to the Corinthians" },
          la: { text: "Ex Epistula secunda ad Corinthios" }
        },
        metadata: {
          author: "Saint Paul"
        }
      },
      concludingPrayer: {
        id: 'prayer-compline',
        type: 'prayer',
        title: {
          en: { text: "Concluding Prayer" },
          la: { text: "Oratio Conclusiva" }
        },
        content: {
          en: {
            text: "Visit this place, O Lord, and drive far from it all snares of the enemy; let your holy angels dwell with us to preserve us in peace; and let your blessing be upon us always. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever."
          },
          la: {
            text: "Visita, quaesumus, Domine, habitationem istam, et omnes insidias inimici ab ea longe repelle: angeli tui sancti habitent in ea, qui nos in pace custodiant, et benedictio tua sit super nos semper. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
          }
        }
      }
    },
    thursday: {
      psalmody: {
        id: 'psalm-143',
        type: 'psalm',
        psalmNumber: 143,
        antiphon: {
          en: { text: "Let me hear of your steadfast love in the morning." },
          la: { text: "Audire me fac mane misericordiam tuam." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 143,
          verse: "1-12",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 7",
          mode: 7
        }
      },
      reading: {
        id: 'reading-ephesians',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "EPH",
          chapter: 6,
          verse: "10-12",
          translation: "DRA"
        },
        source: {
          en: { text: "From the Letter to the Ephesians" },
          la: { text: "Ex Epistula ad Ephesios" }
        },
        metadata: {
          author: "Saint Paul"
        }
      },
      concludingPrayer: {
        id: 'prayer-compline',
        type: 'prayer',
        title: {
          en: { text: "Concluding Prayer" },
          la: { text: "Oratio Conclusiva" }
        },
        content: {
          en: {
            text: "Visit this place, O Lord, and drive far from it all snares of the enemy; let your holy angels dwell with us to preserve us in peace; and let your blessing be upon us always. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever."
          },
          la: {
            text: "Visita, quaesumus, Domine, habitationem istam, et omnes insidias inimici ab ea longe repelle: angeli tui sancti habitent in ea, qui nos in pace custodiant, et benedictio tua sit super nos semper. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
          }
        }
      }
    },
    friday: {
      psalmody: {
        id: 'psalm-31',
        type: 'psalm',
        psalmNumber: 31,
        antiphon: {
          en: { text: "Into your hands I commend my spirit." },
          la: { text: "In manus tuas commendo spiritum meum." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 31,
          verse: "1-5",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 3",
          mode: 3
        }
      },
      reading: {
        id: 'reading-hebrews',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "HEB",
          chapter: 4,
          verse: "14-15",
          translation: "DRA"
        },
        verses: {
          en: { text: "Having therefore a great high priest that hath passed into the heavens, Jesus the Son of God: let us hold fast our confession. For we have not a high priest, who cannot have compassion on our infirmities: but one tempted in all things like as we are, without sin." }
        },
        source: {
          en: { text: "From the Letter to the Hebrews" },
          la: { text: "Ex Epistula ad Hebraeos" }
        },
        metadata: {
          author: "Unknown"
        }
      },
      concludingPrayer: {
        id: 'prayer-compline',
        type: 'prayer',
        title: {
          en: { text: "Concluding Prayer" },
          la: { text: "Oratio Conclusiva" }
        },
        content: {
          en: {
            text: "Visit this place, O Lord, and drive far from it all snares of the enemy; let your holy angels dwell with us to preserve us in peace; and let your blessing be upon us always. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever."
          },
          la: {
            text: "Visita, quaesumus, Domine, habitationem istam, et omnes insidias inimici ab ea longe repelle: angeli tui sancti habitent in ea, qui nos in pace custodiant, et benedictio tua sit super nos semper. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
          }
        }
      }
    },
    saturday: {
      psalmody: {
        id: 'psalm-4',
        type: 'psalm',
        psalmNumber: 4,
        antiphon: {
          en: { text: "Have mercy, Lord, and hear my voice." },
          la: { text: "Miserere mei, Domine." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 4,
          verse: "1-10",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 8",
          mode: 8
        },
        secondPsalm: {
          psalmNumber: 134,
          antiphon: {
            en: { text: "In the silent hours of night, bless the Lord." },
            la: { text: "In noctibus extollite manus vestras in sancta, et benedicite Dominum." }
          },
          scriptureRef: {
            book: "PSA",
            chapter: 134,
            verse: "1-3",
            translation: "DRA"
          },
          metadata: {
            tone: "Psalm tone 8",
            mode: 8
          }
        }
      },
      reading: {
        id: 'reading-deuteronomy',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "DEU",
          chapter: 6,
          verse: "4-7",
          translation: "DRA"
        },
        source: {
          en: { text: "From the Letter to the Colossians" },
          la: { text: "Ex Epistula ad Colossenses" }
        },
        metadata: {
          author: "Saint Paul"
        }
      },
      concludingPrayer: {
        id: 'prayer-compline',
        type: 'prayer',
        title: {
          en: { text: "Concluding Prayer" },
          la: { text: "Oratio Conclusiva" }
        },
        content: {
          en: {
            text: "Lord, be with us through this night, \n When day somes may we rise from sleep to rejoice in the resurrection of your Christ, who live and reigns for ever and ever."
          },
          la: {
            text: "Domine, custodi nos hodie nocte, ut, quando die resurgat, a dormiente reviviscamus in resurrectione Christi, qui vivis et regnat in saecula saeculorum. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
          }
        }
      }
    }
  },
  metadata: {
    created: '2024-01-15T00:00:00Z',
    lastModified: '2024-01-15T00:00:00Z',
    version: '1.0.0',
    contributors: ['Dominican Liturgical Commission'],
    sources: ['Liturgy of the Hours', 'Liber Hymnarius'],
    notes: 'Standard Compline for Ordinary Time'
  }
};

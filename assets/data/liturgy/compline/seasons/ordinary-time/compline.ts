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
    examinationOfConscience: {
      id: 'examination-ot',
      type: 'examination',
      content: {
        en: {
          text: "Brothers and sisters, let us examine our conscience and repent of our sins, that we may be worthy to offer our prayers to God.\n\nI confess to almighty God, and to you, my brothers and sisters, that I have greatly sinned, in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault.\n\nTherefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God."
        },
        la: {
          text: "Fratres, examinemus conscientiam nostram et paenitentiam agamus de peccatis nostris, ut digni simus orationes nostras Deo offerre.\n\nConfiteor Deo omnipotenti, et vobis fratres, quia peccavi nimis cogitatione, verbo et opere: mea culpa, mea culpa, mea maxima culpa.\n\nIdeo precor beatam Mariam semper Virginem, omnes Angelos et Sanctos, et vos fratres, orare pro me ad Dominum Deum nostrum."
        }
      },
      rubric: {
        en: {
          text: "The examination of conscience may be made in silence or with the following or similar words:"
        },
        la: {
          text: "Examen conscientiae fieri potest in silentio vel his vel similibus verbis:"
        }
      }
    },
    opening: {
      id: 'opening-ot',
      type: 'opening',
      content: {
        en: {
          text: "O God, come to my assistance.\nO Lord, make haste to help me.\nGlory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be for ever. Amen."
        },
        la: {
          text: "Deus, in adiutorium meum intende.\nDomine, ad adiuvandum me festina.\nGloria Patri, et Filio, et Spiritui Sancto, sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen."
        }
      }
    },
    responsory: {
      id: 'responsory-compline',
      type: 'responsory',
      content: {
        en: {
          text: "℟. Into your hands, O Lord, I commend my spirit.\n℣. You have redeemed us, Lord God of truth.\n℟. Glory to the Father, and to the Son, and to the Holy Spirit."
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
        en: { text: "Protect us, Lord, while we are awake and safeguard us while we sleep." },
        la: { text: "Salva nos, Domine, vigilantes, custodi nos dormientes." }
      },
      content: {
        en: {
          text: "Lord, now you let your servant go in peace;\nyour word has been fulfilled:\nmy own eyes have seen the salvation\nwhich you have prepared in the sight of every people:\na light to reveal you to the nations\nand the glory of your people Israel."
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
          text: "May the almighty Lord grant us a quiet night and a perfect end.\nAmen."
        },
        la: {
          text: "Benedicat nos omnipotens Dominus, quiete nocte et perfecto fine.\nAmen."
        }
      }
    }
  },
  days: {
    sunday: {
      hymn: {
        id: 'hymn-sunday-compline',
        type: 'hymn',
        title: {
          en: { text: "Christ, the Fair Glory" },
          la: { text: "Christe, qui lux es et dies" }
        },
        content: {
          en: {
            text: "Christ, the fair glory of the holy angels,\nthou who art the light of the world,\nthou who art the light of the world,\nthou who art the light of the world,\nthou who art the light of the world."
          },
          la: {
            text: "Christe, qui lux es et dies,\nnoctis tenebras detegis,\nlucisque lumen crederis,\nlumen beatum praedicans."
          }
        },
        metadata: {
          composer: "Traditional",
          century: "6th century",
          meter: "8.8.8.8",
          tune: "Christe Qui Lux"
        }
      },
      psalmody: {
        id: 'psalm-91',
        type: 'psalm',
        psalmNumber: 91,
        antiphon: {
          en: { text: "He who dwells in the shelter of the Most High." },
          la: { text: "Qui habitat in adiutorio Altissimi." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 91,
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
          chapter: 14,
          verse: "13",
          translation: "DRA"
        },
        source: {
          en: { text: "From the Book of Revelation" },
          la: { text: "Ex Apocalypsi" }
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
            text: "Visit this place, O Lord, and drive far from it all snares of the enemy; let your holy angels dwell with us to preserve us in peace; and let your blessing be upon us always. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever."
          },
          la: {
            text: "Visita, quaesumus, Domine, habitationem istam, et omnes insidias inimici ab ea longe repelle: angeli tui sancti habitent in ea, qui nos in pace custodiant, et benedictio tua sit super nos semper. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
          }
        }
      }
    },
    monday: {
      hymn: {
        id: 'hymn-monday-compline',
        type: 'hymn',
        title: {
          en: { text: "O God, Our Help in Ages Past" },
          la: { text: "Deus, refugium nostrum" }
        },
        content: {
          en: {
            text: "O God, our help in ages past,\nour hope for years to come,\nour shelter from the stormy blast,\nand our eternal home.\n\nUnder the shadow of thy throne\nthy saints have dwelt secure;\nsufficient is thine arm alone,\nand our defense is sure."
          },
          la: {
            text: "Deus, refugium nostrum et virtus,\nadiutor in tribulationibus quae invenerunt nos nimis.\nPropterea non timebimus dum turbabitur terra,\net transferentur montes in cor maris."
          }
        },
        metadata: {
          composer: "Traditional",
          century: "18th century",
          meter: "8.8.8.8",
          tune: "St. Anne"
        }
      },
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
      hymn: {
        id: 'hymn-tuesday-compline',
        type: 'hymn',
        title: {
          en: { text: "All Praise to Thee, My God" },
          la: { text: "Te Deum laudamus" }
        },
        content: {
          en: {
            text: "All praise to thee, my God, this night,\nfor all the blessings of the light;\nkeep me, O keep me, King of kings,\nunder thine own almighty wings.\n\nForgive me, Lord, for thy dear Son,\nthe ill that I this day have done,\nthat with the world, myself, and thee,\nI, ere I sleep, at peace may be."
          },
          la: {
            text: "Te Deum laudamus, te Dominum confitemur.\nTe aeternum Patrem omnis terra veneratur.\nTibi omnes Angeli, tibi caeli et universae Potestates,\nTibi Cherubim et Seraphim incessabili voce proclamant."
          }
        },
        metadata: {
          composer: "Traditional",
          century: "17th century",
          meter: "8.8.8.8",
          tune: "Tallis' Canon"
        }
      },
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
      hymn: {
        id: 'hymn-wednesday-compline',
        type: 'hymn',
        title: {
          en: { text: "Now the Day is Over" },
          la: { text: "Iam lucis orto sidere" }
        },
        content: {
          en: {
            text: "Now the day is over,\nnight is drawing nigh,\nshadows of the evening\nsteal across the sky.\n\nJesus, give the weary\ncalm and sweet repose;\nwith thy tenderest blessing\nmay mine eyelids close."
          },
          la: {
            text: "Iam lucis orto sidere,\nDeum precemur supplices,\nut in diurnis actibus\nnos servet a nocentibus."
          }
        },
        metadata: {
          composer: "Traditional",
          century: "19th century",
          meter: "8.7.8.7",
          tune: "Merrial"
        }
      },
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
      hymn: {
        id: 'hymn-thursday-compline',
        type: 'hymn',
        title: {
          en: { text: "Abide with Me" },
          la: { text: "Mane nobiscum, Domine" }
        },
        content: {
          en: {
            text: "Abide with me; fast falls the eventide;\nthe darkness deepens; Lord, with me abide.\nWhen other helpers fail and comforts flee,\nHelp of the helpless, O abide with me.\n\nI need thy presence every passing hour;\nwhat but thy grace can foil the tempter's power?\nWho, like thyself, my guide and stay can be?\nThrough cloud and sunshine, Lord, abide with me."
          },
          la: {
            text: "Mane nobiscum, Domine, quoniam advesperascit,\net inclinata est iam dies.\nEt cognoverunt eum in fractione panis.\nEt ipse evanuit ex oculis eorum."
          }
        },
        metadata: {
          composer: "Traditional",
          century: "19th century",
          meter: "10.10.10.10",
          tune: "Eventide"
        }
      },
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
      hymn: {
        id: 'hymn-friday-compline',
        type: 'hymn',
        title: {
          en: { text: "O Sacred Head" },
          la: { text: "Salve Caput Cruentatum" }
        },
        content: {
          en: {
            text: "O sacred Head, sore wounded,\ndefiled and put to scorn;\nO kingly Head surrounded\nwith mocking crown of thorn:\nWhat sorrow mars thy grandeur?\nCan death thy bloom deflower?\nO countenance whose splendor\nthe hosts of heaven adore!"
          },
          la: {
            text: "Salve caput cruentatum,\ntotum spinis coronatum,\nconquassatum, vulneratum,\narundine sic verberatum,\nfacie sputis illita."
          }
        },
        metadata: {
          composer: "Traditional",
          century: "12th century",
          meter: "8.7.8.7.8.7.8.7",
          tune: "Passion Chorale"
        }
      },
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
      hymn: {
        id: 'hymn-saturday-compline',
        type: 'hymn',
        title: {
          en: { text: "Hail, Queen of Heaven" },
          la: { text: "Salve Regina" }
        },
        content: {
          en: {
            text: "Hail, Queen of Heaven, the ocean star,\nGuide of the wanderer here below,\nThrown on life's surge, we claim thy care,\nSave us from peril and from woe.\n\nMother of Christ, Star of the sea,\nPray for the wanderer, pray for me."
          },
          la: {
            text: "Salve Regina, Mater misericordiae,\nVita, dulcedo, et spes nostra, salve.\nAd te clamamus, exsules filii Evae,\nAd te suspiramus, gementes et flentes\nin hac lacrimarum valle."
          }
        },
        metadata: {
          composer: "Traditional",
          century: "11th century",
          meter: "8.8.8.8",
          tune: "Salve Regina"
        }
      },
      psalmody: {
        id: 'psalm-130',
        type: 'psalm',
        psalmNumber: 130,
        antiphon: {
          en: { text: "Out of the depths I cry to you, O Lord." },
          la: { text: "De profundis clamavi ad te, Domine." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 129,
          verse: "1-8",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 8",
          mode: 8
        }
      },
      reading: {
        id: 'reading-colossians',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "COL",
          chapter: 3,
          verse: "17, 23-24",
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
            text: "Visit this place, O Lord, and drive far from it all snares of the enemy; let your holy angels dwell with us to preserve us in peace; and let your blessing be upon us always. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever."
          },
          la: {
            text: "Visita, quaesumus, Domine, habitationem istam, et omnes insidias inimici ab ea longe repelle: angeli tui sancti habitent in ea, qui nos in pace custodiant, et benedictio tua sit super nos semper. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
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

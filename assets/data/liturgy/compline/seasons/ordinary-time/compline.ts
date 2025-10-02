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
        id: 'psalm-86',
        type: 'psalm',
        psalmNumber: 86,
        antiphon: {
          en: { text: "Oh Lord, our God, unwearied is your love for us." },
          la: { text: "Ecce nunc benedicite Dominum, omnes servi Domini." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 85,
          verse: "1-17",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 4",
          mode: 4
        }
      },
      reading: {
        id: 'reading-1thessalonians',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "1TH",
          chapter: 5,
          verse: "9-10",
          translation: "DRA"
        },
        source: {
          en: { text: "From the First Letter to the Thessalonians" },
          la: { text: "Ex Epistula ad Thessalonicenses" }
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
            text: "Lord, give our bodies resful sleep\nand let the work we have done today\nbear fruit in eternal life.\nWe ask this through Christ our Lord."
          },
          la: {
            text: "Domine, da nobis corpora nostra nocte remedia\net fructum laboris nostrae hodie in vitam aeternam. Per Dominum nostrum Iesum Christum."
          }
        }
      }
    },
    tuesday: {
      psalmody: {
        id: 'psalm-143',
        type: 'psalm',
        psalmNumber: 143,
        antiphon: {
          en: { text: "Do not hide your face from me; in you I put my trust." },
          la: { text: "Notas mihi fecisti vias vitae." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 143,
          verse: "1-11",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 5",
          mode: 5
        }
      },
      reading: {
        id: 'reading-1peter',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "1PE",
          chapter: 5,
          verse: "8-9",
          translation: "DRA"
        },
        source: {
          en: { text: "From the First Letter of Peter" },
          la: { text: "Ex Epistula ad Petros" }
        },
        metadata: {
          author: "Saint Peter"
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
            text: "Lord, fill this night with your radience.\nMay we sleep in peace and rise with joy to welcome the light of a new day in your name.\nWe ask this through Christ our Lord."
          },
          la: {
            text: "Domine, plenite noctem hodie radientem.\n Nos dormimum nocte pacem, et resurgimus laetiti, ad te laudare in nomine tuo. Per Dominum nostrum Iesum Christum."
          }
        }
      }
    },
    wednesday: {
      psalmody: {
        id: 'psalm-31',
        type: 'psalm',
        psalmNumber: 31,
        antiphon: {
          en: { text: "Lord God, be my refuge and my strength." },
          la: { text: "Inclina, Domine, aurem tuam et exaudi me." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 31,
          verse: "1-6",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 6",
          mode: 6
        },
        secondPsalm: {
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
            tone: "Psalm tone 6",
            mode: 6
          }
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
          chapter: 4,
          verse: "26-27",
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
            text: "Lord Jesus Christ,\nyou have given your followers and example of gentleness and humility, a task that is easy, a burden that is light. Accept the prayers and work of this day, and give us the rest that will strengthn us to render more faithful service to you who live and reign for ever and ever."
          },
          la: {
            text: "Domine Iesu Christe, qui nos servis tuis exemplum gentilitatis et humilitatis dedisti, quae labor est leva, quae labor est leve, accipite, quaesumus, orationes et labores hodie, et datis nobis remedia noctis, ut fortiores ad servitium tuum facias, qui vivis et regnat in saecula saeculorum."
          }
        }
      }
    },
    thursday: {
      psalmody: {
        id: 'psalm-16',
        type: 'psalm',
        psalmNumber: 16,
        antiphon: {
          en: { text: "In you, my God, my body will rest in hope" },
          la: { text: "In te, Domine, sperabo." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 15,
          verse: "1-11",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 7",
          mode: 7
        }
      },
      reading: {
        id: 'reading-1thessalonians',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "1TH",
          chapter: 5,
          verse: "23",
          translation: "DRA"
        },
        source: {
          en: { text: "From the First Letter to the Thessalonians" },
          la: { text: "Ex Epistula ad Thessalonicenses" }
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
            text: "Lord God,\nsend peaceful sleep to refresh our tired bodies. May your help always renew us and keep us strong in your service. We ask this through Christ our Lord."
          },
          la: {
            text: "Domine, da nobis corpora nostra nocte remedia\net fructum laboris nostrae hodie in vitam aeternam. Per Dominum nostrum Iesum Christum."
          }
        }
      }
    },
    friday: {
      psalmody: {
        id: 'psalm-88',
        type: 'psalm',
        psalmNumber: 88,
        antiphon: {
          en: { text: "Day and night I cry to you, my God." },
          la: { text: "Diurnum et noctum invocabo te, Domine." }
        },
        scriptureRef: {
          book: "PSA",
          chapter: 87,
          verse: "1-19",
          translation: "DRA"
        },
        metadata: {
          tone: "Psalm tone 3",
          mode: 3
        }
      },
      reading: {
        id: 'reading-jeremiah',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        scriptureRef: {
          book: "JER",
          chapter: 14,
          verse: "9",
          translation: "DRA"
        },
        verses: {
          en: { text: "Having therefore a great high priest that hath passed into the heavens, Jesus the Son of God: let us hold fast our confession. For we have not a high priest, who cannot have compassion on our infirmities: but one tempted in all things like as we are, without sin." }
        },
        source: {
          en: { text: "From the Prophet Jeremiah" },
          la: { text: "Ex Prophetis Jeremias" }
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
            text: "All-powerful God,\nkeep us united with your Son in his death and burial so that we may rise to new life with him, who lives and reigns for ever and ever."
          },
          la: {
            text: "Domine omnipotens, et filio tuo Iesu Christi, cum eius morte et interitu, ut resurrectio eius et vitam nostram habeamus, qui vivis et regnat in saecula saeculorum. Per Dominum nostrum Iesum Christum, Filium tuum, qui tecum vivit et regnat in unitate Spiritus Sancti, Deus, per omnia saecula saeculorum."
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

import { ComplineData, DayOfWeekVariations } from '@/types/compline-types';

export const ordinaryTimeCompline: ComplineData = {
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
  components: {
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
    hymn: {
      type: 'day-of-week-variations',
      default: {
        id: 'hymn-te-lucis',
        type: 'hymn',
        title: {
          en: { text: "Te Lucis Ante Terminum" },
          la: { text: "Te Lucis Ante Terminum" }
        },
        content: {
          en: {
            text: "Before the ending of the day,\nCreator of the world, we pray,\nthat with thy wonted favor thou\nwouldst be our guard and keeper now.\n\nFrom all ill dreams defend our eyes,\nfrom nightly fears and fantasies;\ntread underfoot our ghostly foe,\nthat no pollution we may know.\n\nO Father, that we ask be done,\nthrough Jesus Christ, thine only Son;\nwho, with the Holy Ghost and thee,\ndoth live and reign eternally."
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
      variations: {
        sunday: {
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
        friday: {
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
        }
      }
    } as DayOfWeekVariations<any>,
    psalmody: {
      type: 'day-of-week-variations',
      default: {
        id: 'psalm-4',
        type: 'psalm',
        psalmNumber: 4,
        antiphon: {
          en: { text: "In peace I will lie down and sleep." },
          la: { text: "In pace in idipsum dormiam et requiescam." }
        },
        verses: {
          en: {
            text: "Answer me when I call, O God of my righteousness!\nYou have given me relief when I was in distress.\nBe gracious to me and hear my prayer!\n\nO men, how long shall my honor be turned into shame?\nHow long will you love vain words and seek after lies?\n\nBut know that the Lord has set apart the godly for himself;\nthe Lord hears when I call to him.\n\nBe angry, and do not sin;\nponder in your own hearts on your beds, and be silent.\n\nOffer right sacrifices,\nand put your trust in the Lord.\n\nIn peace I will both lie down and sleep;\nfor you alone, O Lord, make me dwell in safety."
          },
          la: {
            text: "Cum invocarem exaudivit me Deus iustitiae meae;\nin tribulatione dilatasti mihi.\nMiserere mei et exaudi orationem meam.\n\nFilii hominum, usquequo gravi corde?\nUt quid diligitis vanitatem et quaeritis mendacium?\n\nEt scitote quoniam mirificavit Dominus sanctum suum;\nDominus exaudiet me cum clamavero ad eum.\n\nIrascimini et nolite peccare;\nquae dicitis in cordibus vestris, in cubilibus vestris compungimini.\n\nSacrificate sacrificium iustitiae et sperate in Domino.\n\nIn pace in idipsum dormiam et requiescam."
          }
        },
        metadata: {
          tone: "Psalm tone 1",
          mode: 1
        }
      },
      variations: {
        sunday: {
          id: 'psalm-91',
          type: 'psalm',
          psalmNumber: 91,
          antiphon: {
            en: { text: "He who dwells in the shelter of the Most High." },
            la: { text: "Qui habitat in adiutorio Altissimi." }
          },
          verses: {
            en: {
              text: "He who dwells in the shelter of the Most High,\nwho abides in the shadow of the Almighty,\nwill say to the Lord, 'My refuge and my fortress;\nmy God, in whom I trust.'\n\nFor he will deliver you from the snare of the fowler\nand from the deadly pestilence;\nhe will cover you with his pinions,\nand under his wings you will find refuge;\nhis faithfulness is a shield and buckler."
            },
            la: {
              text: "Qui habitat in adiutorio Altissimi,\nin protectione Dei caeli commorabitur.\nDicet Domino: 'Susceptor meus es tu et refugium meum;\nDeus meus, sperabo in eum.'\n\nQuoniam ipse liberabit me de laqueo venantium\net a verbo aspero.\nScapulis suis obumbrabit tibi,\net sub alis eius sperabis;\nscuto circumdabit te veritas eius."
            }
          },
          metadata: {
            tone: "Psalm tone 2",
            mode: 2
          }
        },
        friday: {
          id: 'psalm-31',
          type: 'psalm',
          psalmNumber: 31,
          antiphon: {
            en: { text: "Into your hands I commend my spirit." },
            la: { text: "In manus tuas commendo spiritum meum." }
          },
          verses: {
            en: {
              text: "In you, O Lord, I seek refuge;\nlet me never be put to shame;\nin your righteousness deliver me.\nIncline your ear to me;\nrescue me speedily.\nBe a rock of refuge for me,\na strong fortress to save me.\n\nFor you are my rock and my fortress;\nfor your name's sake lead me and guide me,\ntake me out of the net that is hidden for me,\nfor you are my refuge.\nInto your hand I commit my spirit;\nyou have redeemed me, O Lord, faithful God."
            },
            la: {
              text: "In te, Domine, speravi, non confundar in aeternum;\nin iustitia tua libera me.\nInclina ad me aurem tuam,\naccelera ut eripias me.\nEsto mihi in petram refugii,\net in domum munitam ut salvum me facias.\n\nQuoniam fortitudo mea et refugium meum es tu,\net propter nomen tuum deduces me et enutries me.\nEduces me de laqueo hoc quem absconderunt mihi,\nquoniam tu es protector meus.\nIn manus tuas commendo spiritum meum;\nredemisti me, Domine, Deus veritatis."
            }
          },
          metadata: {
            tone: "Psalm tone 3",
            mode: 3
          }
        }
      }
    } as DayOfWeekVariations<any>,
    reading: {
      type: 'day-of-week-variations',
      default: {
        id: 'reading-1peter',
        type: 'reading',
        title: {
          en: { text: "Short Reading" },
          la: { text: "Lectio Brevis" }
        },
        content: {
          en: {
            text: "Cast all your anxiety on him because he cares for you. Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour. Resist him, standing firm in the faith."
          },
          la: {
            text: "Omnem sollicitudinem vestram proicientes in eum, quoniam ipsi cura est de vobis. Sobrii estote et vigilate, quia adversarius vester diabolus tamquam leo rugiens circuit, quaerens quem devoret: cui resistite fortes in fide."
          }
        },
        source: {
          en: { text: "From the First Letter of Peter" },
          la: { text: "Ex Epistula prima Petri" }
        },
        metadata: {
          book: "1 Peter",
          chapter: 5,
          verse: "7-9",
          author: "Saint Peter"
        }
      },
      variations: {
        sunday: {
          id: 'reading-revelation',
          type: 'reading',
          title: {
            en: { text: "Short Reading" },
            la: { text: "Lectio Brevis" }
          },
          content: {
            en: {
              text: "Blessed are the dead who die in the Lord henceforth. 'Blessed indeed,' says the Spirit, 'that they may rest from their labors, for their deeds follow them!'"
            },
            la: {
              text: "Beati mortui qui in Domino moriuntur. Amodo dicit Spiritus ut requiescant a laboribus suis; opera enim illorum sequuntur illos."
            }
          },
          source: {
            en: { text: "From the Book of Revelation" },
            la: { text: "Ex Apocalypsi" }
          },
          metadata: {
            book: "Revelation",
            chapter: 14,
            verse: "13",
            author: "Saint John"
          }
        },
        friday: {
          id: 'reading-hebrews',
          type: 'reading',
          title: {
            en: { text: "Short Reading" },
            la: { text: "Lectio Brevis" }
          },
          content: {
            en: {
              text: "Since we have a great high priest who has passed through the heavens, Jesus, the Son of God, let us hold fast our confession. For we do not have a high priest who is unable to sympathize with our weaknesses, but one who in every respect has been tempted as we are, yet without sin."
            },
            la: {
              text: "Habentes igitur pontificem magnum qui penetravit caelos, Iesum Filium Dei, teneamus confessionem. Non enim habemus pontificem qui non possit compati infirmitatibus nostris: tentatum autem per omnia pro similitudine absque peccato."
            }
          },
          source: {
            en: { text: "From the Letter to the Hebrews" },
            la: { text: "Ex Epistula ad Hebraeos" }
          },
          metadata: {
            book: "Hebrews",
            chapter: 4,
            verse: "14-15",
            author: "Unknown"
          }
        }
      }
    } as DayOfWeekVariations<any>,
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
  metadata: {
    created: '2024-01-15T00:00:00Z',
    lastModified: '2024-01-15T00:00:00Z',
    version: '1.0.0',
    contributors: ['Dominican Liturgical Commission'],
    sources: ['Liturgy of the Hours', 'Liber Hymnarius'],
    notes: 'Standard Compline for Ordinary Time'
  }
};

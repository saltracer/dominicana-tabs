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
        monday: {
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
        tuesday: {
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
        wednesday: {
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
        thursday: {
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
        saturday: {
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
        monday: {
          id: 'psalm-134',
          type: 'psalm',
          psalmNumber: 134,
          antiphon: {
            en: { text: "Come, bless the Lord, all you servants of the Lord." },
            la: { text: "Ecce nunc benedicite Dominum, omnes servi Domini." }
          },
          verses: {
            en: {
              text: "Come, bless the Lord, all you servants of the Lord,\nwho stand by night in the house of the Lord!\nLift up your hands to the holy place,\nand bless the Lord!\n\nMay the Lord bless you from Zion,\nhe who made heaven and earth!"
            },
            la: {
              text: "Ecce nunc benedicite Dominum,\nomnes servi Domini,\nqui statis in domo Domini,\nin atriis domus Dei nostri.\n\nIn noctibus extollite manus vestras in sancta,\net benedicite Dominum.\nBenedicat te Dominus ex Sion,\nqui fecit caelum et terram."
            }
          },
          metadata: {
            tone: "Psalm tone 4",
            mode: 4
          }
        },
        tuesday: {
          id: 'psalm-16',
          type: 'psalm',
          psalmNumber: 16,
          antiphon: {
            en: { text: "You show me the path of life." },
            la: { text: "Notas mihi fecisti vias vitae." }
          },
          verses: {
            en: {
              text: "Protect me, O God, for in you I take refuge.\nI say to the Lord, 'You are my Lord;\nI have no good apart from you.'\n\nThe Lord is my chosen portion and my cup;\nyou hold my lot.\nThe boundary lines have fallen for me in pleasant places;\nI have a goodly heritage.\n\nI bless the Lord who gives me counsel;\nin the night also my heart instructs me.\nI keep the Lord always before me;\nbecause he is at my right hand, I shall not be moved.\n\nTherefore my heart is glad, and my soul rejoices;\nmy body also rests secure.\nFor you do not give me up to Sheol,\nor let your faithful one see the Pit.\n\nYou show me the path of life.\nIn your presence there is fullness of joy;\nat your right hand are pleasures forevermore."
            },
            la: {
              text: "Conserva me, Domine, quoniam speravi in te.\nDixi Domino: 'Dominus meus es tu,\nbonorum meorum non eges.'\n\nDominus pars hereditatis meae et calicis mei:\ntu es qui restitues hereditatem meam mihi.\nFunes ceciderunt mihi in praeclaris;\net hereditas mea praeclara est mihi.\n\nBenedicam Dominum qui tribuit mihi intellectum;\ninsuper et usque ad noctem increpuerunt me renes mei.\nProvidebam Dominum in conspectu meo semper,\nquoniam a dextris est mihi, ne commovear.\n\nPropter hoc laetatum est cor meum et exsultavit lingua mea,\ninsuper et caro mea requiescet in spe.\nQuoniam non derelinques animam meam in inferno,\nnec dabis sanctum tuum videre corruptionem.\n\nNotas mihi fecisti vias vitae;\nadimplebis me laetitia cum vultu tuo,\ndelectationes in dextera tua usque in finem."
            }
          },
          metadata: {
            tone: "Psalm tone 5",
            mode: 5
          }
        },
        wednesday: {
          id: 'psalm-86',
          type: 'psalm',
          psalmNumber: 86,
          antiphon: {
            en: { text: "Incline your ear, O Lord, and answer me." },
            la: { text: "Inclina, Domine, aurem tuam et exaudi me." }
          },
          verses: {
            en: {
              text: "Incline your ear, O Lord, and answer me,\nfor I am poor and needy.\nPreserve my life, for I am devoted to you;\nsave your servant who trusts in you.\nYou are my God; be gracious to me, O Lord,\nfor to you do I cry all day long.\n\nGladden the soul of your servant,\nfor to you, O Lord, I lift up my soul.\nFor you, O Lord, are good and forgiving,\nabounding in steadfast love to all who call on you.\n\nGive ear, O Lord, to my prayer;\nlisten to my cry of supplication.\nIn the day of my trouble I call on you,\nfor you will answer me.\n\nThere is none like you among the gods, O Lord,\nnor are there any works like yours.\nAll the nations you have made shall come\nand bow down before you, O Lord,\nand shall glorify your name.\nFor you are great and do wondrous things;\nyou alone are God."
            },
            la: {
              text: "Inclina, Domine, aurem tuam et exaudi me,\nquoniam inops et pauper sum ego.\nCustodi animam meam, quoniam sanctus sum;\nsalvum fac servum tuum, Deus meus, sperantem in te.\nMiserere mei, Domine, quoniam ad te clamavi tota die.\n\nLaetifica animam servi tui,\nquoniam ad te, Domine, animam meam levavi.\nQuoniam tu, Domine, suavis et mitis,\net multae misericordiae omnibus invocantibus te.\n\nAuribus percipe, Domine, orationem meam,\net intende voci deprecationis meae.\nIn die tribulationis meae clamavi ad te,\nquia exaudisti me.\n\nNon est similis tui in diis, Domine,\net non est secundum opera tua.\nOmnes gentes quascumque fecisti venient\net adorabunt coram te, Domine,\net glorificabunt nomen tuum.\nQuoniam magnus es tu et faciens mirabilia:\ntu es Deus solus."
            }
          },
          metadata: {
            tone: "Psalm tone 6",
            mode: 6
          }
        },
        thursday: {
          id: 'psalm-143',
          type: 'psalm',
          psalmNumber: 143,
          antiphon: {
            en: { text: "Let me hear of your steadfast love in the morning." },
            la: { text: "Audire me fac mane misericordiam tuam." }
          },
          verses: {
            en: {
              text: "Hear my prayer, O Lord;\ngive ear to my supplications in your faithfulness;\nanswer me in your righteousness.\nDo not enter into judgment with your servant,\nfor no one living is righteous before you.\n\nFor the enemy has pursued me,\ncrushing my life to the ground,\nmaking me sit in darkness like those long dead.\nTherefore my spirit faints within me;\nmy heart within me is appalled.\n\nI remember the days of old,\nI think about all your deeds,\nI meditate on the works of your hands.\nI stretch out my hands to you;\nmy soul thirsts for you like a parched land.\n\nAnswer me quickly, O Lord;\nmy spirit fails.\nDo not hide your face from me,\nor I shall be like those who go down to the Pit.\nLet me hear of your steadfast love in the morning,\nfor in you I put my trust.\nTeach me the way I should go,\nfor to you I lift up my soul."
            },
            la: {
              text: "Domine, exaudi orationem meam,\nauribus percipe obsecrationem meam in veritate tua;\nexaudi me in tua iustitia.\nEt non intres in iudicium cum servo tuo,\nquia non iustificabitur in conspectu tuo omnis vivens.\n\nQuia persecutus est inimicus animam meam,\nhumiliavit in terra vitam meam,\ncollocavit me in obscuris sicut mortuos saeculi.\nEt anxiatus est super me spiritus meus,\nin me turbatum est cor meum.\n\nMemor fui dierum antiquorum,\nmeditatus sum in omnibus operibus tuis,\nin factis manuum tuarum meditabar.\nExpandi manus meas ad te,\nanima mea sicut terra sine aqua tibi.\n\nVelociter exaudi me, Domine;\ndefecit spiritus meus.\nNon abscondas faciem tuam a me,\net similis ero descendentibus in lacum.\nAudire me fac mane misericordiam tuam,\nquia in te speravi.\nNotam fac mihi viam in qua ambulem,\nquia ad te levavi animam meam."
            }
          },
          metadata: {
            tone: "Psalm tone 7",
            mode: 7
          }
        },
        saturday: {
          id: 'psalm-130',
          type: 'psalm',
          psalmNumber: 130,
          antiphon: {
            en: { text: "Out of the depths I cry to you, O Lord." },
            la: { text: "De profundis clamavi ad te, Domine." }
          },
          verses: {
            en: {
              text: "Out of the depths I cry to you, O Lord.\nLord, hear my voice!\nLet your ears be attentive\nto the voice of my supplications!\n\nIf you, O Lord, should mark iniquities,\nLord, who could stand?\nBut there is forgiveness with you,\nso that you may be revered.\n\nI wait for the Lord, my soul waits,\nand in his word I hope;\nmy soul waits for the Lord\nmore than those who watch for the morning,\nmore than those who watch for the morning.\n\nO Israel, hope in the Lord!\nFor with the Lord there is steadfast love,\nand with him is great power to redeem.\nIt is he who will redeem Israel\nfrom all its iniquities."
            },
            la: {
              text: "De profundis clamavi ad te, Domine;\nDomine, exaudi vocem meam.\nFiant aures tuae intendentes\nin vocem deprecationis meae.\n\nSi iniquitates observaveris, Domine,\nDomine, quis sustinebit?\nQuia apud te propitiatio est;\net propter legem tuam sustinui te, Domine.\n\nSustinuit anima mea in verbo eius;\nsperavit anima mea in Domino.\nMagis quam custodes auroram,\nsperet Israel in Domino.\n\nQuia apud Dominum misericordia,\net copiosa apud eum redemptio.\nEt ipse redimet Israel\nex omnibus iniquitatibus eius."
            }
          },
          metadata: {
            tone: "Psalm tone 8",
            mode: 8
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
        monday: {
          id: 'reading-james',
          type: 'reading',
          title: {
            en: { text: "Short Reading" },
            la: { text: "Lectio Brevis" }
          },
          content: {
            en: {
              text: "Submit yourselves therefore to God. Resist the devil, and he will flee from you. Draw near to God, and he will draw near to you. Cleanse your hands, you sinners, and purify your hearts, you double-minded."
            },
            la: {
              text: "Subditi igitur estote Deo, resistite autem diabolo, et fugiet a vobis. Appropinquate Deo, et appropinquabit vobis. Emundate manus, peccatores, et purificate corda, duplices animo."
            }
          },
          source: {
            en: { text: "From the Letter of James" },
            la: { text: "Ex Epistula Iacobi" }
          },
          metadata: {
            book: "James",
            chapter: 4,
            verse: "7-8",
            author: "Saint James"
          }
        },
        tuesday: {
          id: 'reading-romans',
          type: 'reading',
          title: {
            en: { text: "Short Reading" },
            la: { text: "Lectio Brevis" }
          },
          content: {
            en: {
              text: "For I am convinced that neither death, nor life, nor angels, nor rulers, nor things present, nor things to come, nor powers, nor height, nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord."
            },
            la: {
              text: "Certus sum enim quia neque mors neque vita neque angeli neque principatus neque instantia neque futura neque virtutes neque altitudo neque profundum neque creatura alia poterit nos separare a caritate Dei quae est in Christo Iesu Domino nostro."
            }
          },
          source: {
            en: { text: "From the Letter to the Romans" },
            la: { text: "Ex Epistula ad Romanos" }
          },
          metadata: {
            book: "Romans",
            chapter: 8,
            verse: "38-39",
            author: "Saint Paul"
          }
        },
        wednesday: {
          id: 'reading-corinthians',
          type: 'reading',
          title: {
            en: { text: "Short Reading" },
            la: { text: "Lectio Brevis" }
          },
          content: {
            en: {
              text: "But we have this treasure in clay jars, so that it may be made clear that this extraordinary power belongs to God and does not come from us. We are afflicted in every way, but not crushed; perplexed, but not driven to despair; persecuted, but not forsaken; struck down, but not destroyed."
            },
            la: {
              text: "Habemus autem thesaurum istum in vasis fictilibus, ut sublimitas sit virtutis Dei et non ex nobis. In omnibus tribulationem patimur, sed non angustiamur; aporiamur, sed non destituimur; persecutionem patimur, sed non derelinquimur; deicimur, sed non perimus."
            }
          },
          source: {
            en: { text: "From the Second Letter to the Corinthians" },
            la: { text: "Ex Epistula secunda ad Corinthios" }
          },
          metadata: {
            book: "2 Corinthians",
            chapter: 4,
            verse: "7-9",
            author: "Saint Paul"
          }
        },
        thursday: {
          id: 'reading-ephesians',
          type: 'reading',
          title: {
            en: { text: "Short Reading" },
            la: { text: "Lectio Brevis" }
          },
          content: {
            en: {
              text: "Finally, be strong in the Lord and in the strength of his power. Put on the whole armor of God, so that you may be able to stand against the wiles of the devil. For our struggle is not against enemies of blood and flesh, but against the rulers, against the authorities, against the cosmic powers of this present darkness, against the spiritual forces of evil in the heavenly places."
            },
            la: {
              text: "De cetero, fratres, confortamini in Domino et in potentia virtutis eius. Induite vos armaturam Dei, ut possitis stare adversus insidias diaboli. Quia non est nobis conluctatio adversus carnem et sanguinem, sed adversus principes et potestates, adversus mundi rectores tenebrarum harum, contra spiritualia nequitiae in caelestibus."
            }
          },
          source: {
            en: { text: "From the Letter to the Ephesians" },
            la: { text: "Ex Epistula ad Ephesios" }
          },
          metadata: {
            book: "Ephesians",
            chapter: 6,
            verse: "10-12",
            author: "Saint Paul"
          }
        },
        saturday: {
          id: 'reading-colossians',
          type: 'reading',
          title: {
            en: { text: "Short Reading" },
            la: { text: "Lectio Brevis" }
          },
          content: {
            en: {
              text: "And whatever you do, in word or deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him. And whatever you do, work at it with all your heart, as working for the Lord, not for human masters, since you know that you will receive an inheritance from the Lord as a reward."
            },
            la: {
              text: "Et omne quodcumque facitis in verbo aut in opere, omnia in nomine Domini Iesu Christi gratias agentes Deo et Patri per ipsum. Et quodcumque facitis, ex animo operamini sicut Domino et non hominibus, scientes quoniam a Domino accipietis retributionem hereditatis."
            }
          },
          source: {
            en: { text: "From the Letter to the Colossians" },
            la: { text: "Ex Epistula ad Colossenses" }
          },
          metadata: {
            book: "Colossians",
            chapter: 3,
            verse: "17, 23-24",
            author: "Saint Paul"
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

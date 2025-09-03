import type { Saint } from "@/types/saint-types"
import { LiturgicalColor } from "@/types/liturgical-types"
import { CelebrationRank } from "@/types/celebrations-types"

// December saints
export const decemberGeneralSaints: Saint[] = [
  {
    id: "dominic-of-silos",
    name: "St. Dominic of Silos",
    feast_day: "12-20",
    short_bio: "Spanish abbot and miracle-worker, patron of prisoners and shepherds",
    biography: [
      "St. Dominic of Silos was born around the year 1000 in Cañas, La Rioja, Spain, to a peasant family. As a young boy, he worked as a shepherd, which gave him ample time for prayer and contemplation. Recognizing his intelligence and piety, his parents sent him to be educated by the local monks at the monastery of San Millán de la Cogolla.",
      "After completing his education, Dominic became a Benedictine monk at San Millán de la Cogolla. His wisdom and holiness led to his appointment as prior of the monastery. However, when King García Sánchez III of Navarre attempted to claim the monastery's lands, Dominic refused to hand them over, leading to his exile.",
      "In 1041, Dominic found refuge in Castile under the protection of King Ferdinand I of León. The king appointed him abbot of the monastery of San Sebastián de Silos (now known as Santo Domingo de Silos), which had fallen into disrepair. Dominic restored the monastery both spiritually and physically, transforming it into a center of learning, spirituality, and charitable works.",
      "Under Dominic's leadership, the monastery became renowned for its scholarship, particularly in the copying and preservation of manuscripts. The scriptorium at Silos produced some of the finest illuminated manuscripts of the period. Dominic also established a hospice for the poor and sick, personally caring for those in need.",
      "Dominic was known for his miracles, particularly his power to free Christian captives from Muslim rule. Many prisoners claimed to have been miraculously freed from their chains after praying for Dominic's intercession. This led to his veneration as a patron of prisoners and those unjustly detained.",
      "He died on December 20, 1073, and was buried in the abbey church. His tomb became a popular pilgrimage site, and numerous miracles were attributed to his intercession. In the 16th century, a Spanish woman named Joan Aza prayed at his shrine for a son, promising to name him Dominic. Her son became St. Dominic de Guzmán, founder of the Dominican Order, who was named in honor of Dominic of Silos.",
      "St. Dominic of Silos was canonized in 1076 by Pope Gregory VII. His abbey church remains an important spiritual and cultural center, famous for its Romanesque architecture and the monks' Gregorian chant recordings.",
    ],
    image_url: "/saints/st-dominic-of-silos.jpg",
    patronage: "Prisoners, shepherds, pregnant women, against rabies, against mad dogs, against insects, against rabies, captives, and the falsely accused",
    birth_year: 1000,
    birth_place: "Cañas, La Rioja, Spain",
    death_year: 1073,
    death_place: "Santo Domingo de Silos, Castile (now Spain)",
    canonization_date: "1076-01-01",
    quotes: [
      "The Lord has given me the grace to be a good shepherd, to guide souls to heaven.",
      "The true monk is he who is separated from all and united to all.",
      "In silence and in hope shall your strength be.",
      "The measure of love is to love without measure.",
      "The cross is the school of love.",
      "He who labors as he prays lifts his heart to God with his hands.",
      "The more we empty ourselves, the more room we give God to fill us.",
      "Obedience is the mother of all virtues, the key to the spiritual life.",
      "The humble man receives praise the way a clean window takes the light of the sun. The truer and more intense the light is, the less you see of the glass.",
      "The soul that is united with God is feared by the devil as though it were God Himself.",
    ],
    prayers: `
      O God, who to the blessed Abbot Dominic gave the grace to be a model of perfect penance and a great protector of the poor, grant, we beseech Thee, that by his intercession and example we may be delivered from all temporal and spiritual ills, and may always be found in the number of the elect. Through our Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.
  
      O holy St. Dominic of Silos, you who were a model of charity and compassion, a father to the poor and a refuge for sinners, intercede for us before the throne of God. Help us to imitate your virtues, especially your love for prayer, your obedience to God's will, and your tender care for those in need. May we, like you, be instruments of God's mercy and peace in the world. Amen.
    `,
    books: [
      "the-rule-of-st-benedict",
      "sermons-of-st-dominic-of-silos",
      "the-life-and-miracles-of-st-dominic-of-silos",
    ],
    is_dominican: false,
    is_doctor: false,
    rank: CelebrationRank.OPTIONAL_MEMORIAL,
    color: LiturgicalColor.WHITE,
    proper: "Proper of Saints",
  },
  {
    id: "stephen",
    name: "St. Stephen",
    feast_day: "12-26",
    short_bio: "First martyr of the Church",
    biography: [
      "St. Stephen was one of the first seven deacons chosen by the early Christian community to assist the Apostles in their ministry. He is described in the Acts of the Apostles as 'a man full of faith and of the Holy Spirit' (Acts 6:5).",
      "Stephen was known for his powerful preaching and the miracles he performed. His eloquence and wisdom in defending the faith led to opposition from various synagogues in Jerusalem. Unable to defeat him in debate, his opponents brought false charges against him, claiming he had spoken blasphemy against Moses and God.",
      "When brought before the Sanhedrin (the Jewish high court), Stephen delivered a powerful speech recounting Israel's history and God's covenant relationship with His people. He boldly accused the religious leaders of resisting the Holy Spirit and betraying and murdering the 'Righteous One' (Jesus).",
      "Enraged by his words, the crowd dragged Stephen outside the city and stoned him to death. As he was dying, Stephen saw a vision of Jesus standing at the right hand of God. His last words echoed those of Jesus on the cross: 'Lord, do not hold this sin against them' (Acts 7:60).",
      "Stephen's martyrdom marked the beginning of a great persecution against the Church in Jerusalem, which ironically helped spread Christianity as believers scattered throughout Judea and Samaria. Among those who approved of Stephen's execution was Saul of Tarsus, who would later become the Apostle Paul after his conversion.",
      "St. Stephen is venerated as the first martyr (protomartyr) of Christianity. His feast day follows immediately after Christmas, emphasizing that the birth of Christ ultimately leads to the sacrifice of one's life for the faith. He is the patron saint of deacons, stonemasons, and those suffering from headaches.",
    ],
    image_url: "/saints/st-stephen.jpg",
    patronage: "Deacons, stonemasons, casket makers, headaches",
    birth_year: null,
    death_year: 34,
    prayers:
      "Grant, Lord, we pray, that we may imitate what we worship, and so learn to love even our enemies, for we celebrate the heavenly birthday of a man who knew how to pray even for his persecutors. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever. Amen.",
    is_dominican: false,
    rank: CelebrationRank.FEAST,
    color: LiturgicalColor.RED,
    proper: "Proper of Saints",
  },
  {
    id: "john-apostle",
    name: "St. John the Apostle and Evangelist",
    feast_day: "12-27",
    short_bio: "Beloved disciple of Jesus, apostle, and author of the fourth Gospel",
    biography: [
      "St. John was the son of Zebedee and Salome, and the brother of James the Greater. As fishermen on the Sea of Galilee, John and his brother were among the first disciples called by Jesus. Along with Peter and James, John formed the inner circle of Jesus' closest companions, witnessing key events such as the Transfiguration and the Agony in the Garden of Gethsemane.",
      "In his Gospel, John refers to himself as 'the disciple whom Jesus loved,' highlighting his special relationship with Christ. He was the only one of the Twelve Apostles who did not forsake Jesus during His crucifixion and stood at the foot of the cross, where Jesus entrusted His mother Mary to John's care.",
      "After Pentecost, John played a significant role in the early Church in Jerusalem. According to tradition, he later moved to Ephesus, where he wrote his Gospel, three Epistles, and possibly the Book of Revelation during his exile on the island of Patmos under the Emperor Domitian.",
      "Unlike most of the other apostles, John is believed to have died of natural causes at an advanced age, around the year 100 AD. He is the only apostle who was not martyred, though not for lack of attempts on his life. One tradition holds that an attempt to poison him failed miraculously.",
      "John's Gospel differs significantly from the Synoptic Gospels (Matthew, Mark, and Luke), focusing more on the divinity of Christ and containing extended discourses rather than parables. His writings emphasize love, light, and life, with the famous declaration that 'God is love' (1 John 4:8).",
      "St. John is often depicted in art as a young, beardless man, sometimes with an eagle, symbolizing the soaring, spiritual nature of his Gospel. He is the patron saint of theologians, writers, and friendship.",
    ],
    image_url: "/saints/st-john-apostle.jpg",
    patronage: "Theologians, writers, editors, publishers, friendship, Asia Minor",
    birth_year: 6,
    death_year: 100,
    prayers:
      "O God, who through the blessed Apostle John have unlocked for us the secrets of your Word, grant, we pray, that we may grasp with proper understanding what he has so marvelously brought to our ears. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever. Amen.",
    is_dominican: false,
    rank: CelebrationRank.FEAST,
    color: LiturgicalColor.WHITE,
    proper: "Proper of Saints",
  },
]

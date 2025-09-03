import { LiturgicalColor } from "@/types/liturgical-types"
import { FixedCelebration, CelebrationRank } from "@/types/celebrations-types"

// Define the fixed Dominican celebrations of the liturgical year
export function fixedDominicanCelebrations(): FixedCelebration[] {
  return [
    {
      id: "all-saints-of-the-order",
      name: "All Saints of the Order of Preachers",
      date: "11-07",
      rank: CelebrationRank.FEAST,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Dominican Saints",
      type: "dominican",
      short_desc: "Honors all the saints of the Dominican Order throughout its history.",
      description: [
        "This feast honors all the saints of the Dominican Order—canonized, beatified, and unknown—who have lived the Dominican charism of contemplation and sharing the fruits of contemplation throughout the Order's history. It celebrates the diverse expressions of Dominican holiness across eight centuries, from the Order's founding in 1216 to the present day.",
        "It celebrates the diversity of Dominican sanctity, from the Order's founder St. Dominic to modern witnesses to the Gospel. This includes great theologians like St. Thomas Aquinas, mystics like St. Catherine of Siena, missionaries like St. Rose of Lima, reformers like St. Vincent Ferrer, and countless others who embodied the Dominican ideal in various ways.",
        "The feast reminds Dominicans of their rich spiritual heritage and the call to holiness that is at the heart of Dominican life, expressed through the four pillars: prayer, study, community, and preaching. These pillars, established by St. Dominic, continue to guide Dominican life and ministry today.",
        "The celebration of this feast began in the 14th century and was officially extended to the entire Order in 1674. It is celebrated the day after the feast of All Saints in the universal Church, emphasizing the particular contribution of Dominican saints to the communion of saints.",
        "The liturgical texts for this feast emphasize the Dominican vocation to preach for the salvation of souls, following Christ the Preacher. The readings and prayers highlight the diverse ways in which Dominican saints have fulfilled this mission through contemplation, study, teaching, writing, missionary work, and witness of life.",
        "This feast has special significance for all branches of the Dominican family—friars, nuns, sisters, and laity—as it celebrates their shared charism and spirituality. It is an occasion for Dominicans to renew their commitment to the Order's motto: Veritas (Truth).",
        "Among the notable Dominican saints honored on this day are St. Dominic himself, St. Thomas Aquinas, St. Catherine of Siena (both Doctors of the Church), St. Martin de Porres, St. Rose of Lima (the first canonized saint of the Americas), St. Albert the Great, and many others who exemplify different aspects of the Dominican vocation.",
      ],
    },
    {
      id: "anniversary-of-deceased-dominicans",
      name: "Anniversary of All Deceased Brothers and Sisters of the Order",
      date: "11-08",
      rank: CelebrationRank.MEMORIAL,
      color: LiturgicalColor.VIOLET,
      proper: "Proper of Dominican Saints",
      type: "dominican",
      short_desc: "Commemorates all deceased members of the Dominican family.",
      description: [
        "This memorial commemorates all deceased members of the Dominican family—friars, nuns, sisters, and laity—who have gone before us marked with the sign of faith. It is a day of prayer and remembrance for the thousands of Dominicans who, over eight centuries, have contributed to the Order's mission and now await the fullness of resurrection.",
        "Following the feast of All Saints of the Order, it expresses the communion that exists between the living and the dead in the Dominican family. This sequence of celebrations reflects the Catholic understanding of the communion of saints, which includes both those who have achieved the beatific vision and those who are still being purified.",
        "The Order prays for its deceased members, trusting in God's mercy and the promise of resurrection. The liturgy for this day includes special prayers for the dead and often the Office of the Dead from the Liturgy of the Hours.",
        "This commemoration reflects the Dominican emphasis on community, which extends beyond death, and the eschatological dimension of Christian faith. St. Dominic himself, on his deathbed, promised his brothers: 'Do not weep, for I shall be more useful to you after my death and I shall help you then more effectively than during my life.'",
        "The tradition of praying for the deceased members of the Order dates back to the earliest days of Dominican history. The Constitutions of the Order have always included provisions for prayers and Masses to be offered for deceased brothers and sisters.",
        "In Dominican priories and monasteries, this day often includes a procession to the community cemetery or memorial chapel, where the names of recently deceased members are read aloud and prayers are offered for their eternal rest.",
        "This commemoration also serves as a reminder of the Dominican tradition of preparing for a 'happy death.' Many Dominican saints, including St. Dominic himself, are remembered for the peaceful and holy manner of their deaths, surrounded by their brothers or sisters in prayer.",
      ],
    },
    {
      id: "patronage-of-the-blessed-virgin-mary",
      name: "Patronage of the Blessed Virgin Mary over the Order of Preachers",
      date: "12-22",
      rank: CelebrationRank.MEMORIAL,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Dominican Saints",
      type: "dominican",
      short_desc: "Celebrates Mary's special protection over the Dominican Order.",
      description: [
        "This memorial celebrates the special protection of the Blessed Virgin Mary over the Dominican Order. From its foundation, the Order of Preachers has had a profound devotion to Mary, whom St. Dominic called the 'Light of the Order' and to whom he entrusted his friars and their mission of preaching for the salvation of souls.",
        "According to tradition, St. Dominic had a vision in which Mary spread her mantle over members of the Order, symbolizing her maternal care. This vision, similar to the 'Protecting Veil' tradition in Eastern Christianity, has been depicted in numerous works of Dominican art throughout the centuries.",
        "The Dominican tradition holds that Mary is the special patroness and protector of the Order of Preachers. This relationship is expressed in various Dominican prayers and customs, including the singing of the Salve Regina procession each night after Compline, a tradition that dates back to the 13th century.",
        "This feast, celebrated just before Christmas, highlights Mary's role in the incarnation and in the mission of the Church. It connects the Dominican devotion to Mary with the approaching celebration of the birth of her Son, whom Dominicans are called to preach.",
        "It reminds Dominicans of their call to imitate Mary's contemplation of the Word and her readiness to bring Christ to others. The Dominican motto 'Contemplare et contemplata aliis tradere' (to contemplate and to hand on to others the fruits of contemplation) finds its perfect model in Mary, who pondered God's word in her heart and brought Christ into the world.",
        "The feast was officially established in the Dominican calendar in 1921, though devotion to Mary as patroness of the Order dates back to its beginnings. The timing in late December connects it with the medieval tradition of the 'O Antiphons,' which express the longing for Christ's coming.",
        "Throughout Dominican history, many saints and blesseds have had a special devotion to Mary, including St. Dominic himself, who is said to have received the Rosary from Mary; St. Albert the Great, who wrote extensively on Marian theology; and St. Louis de Montfort, whose Marian spirituality has influenced the entire Church.",
      ],
    },
    {
      id: "translation-of-st-dominic",
      name: "Translation of Our Holy Father Dominic",
      date: "05-24",
      rank: CelebrationRank.MEMORIAL,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Dominican Saints",
      type: "dominican",
      short_desc: "Commemorates the transfer of St. Dominic's relics to a more worthy tomb.",
      description: [
        "This memorial commemorates the translation (transfer) of St. Dominic's relics on May 24, 1233, from his original burial place to a more worthy tomb in the Church of San Niccolò delle Vigne in Bologna, which later became the Basilica of San Domenico. This event occurred nearly twelve years after Dominic's death on August 6, 1221.",
        "When his tomb was opened, a sweet fragrance filled the church, which was taken as a sign of his sanctity. This 'odor of sanctity' is mentioned in the accounts of many witnesses, including Blessed Jordan of Saxony, Dominic's successor as Master of the Order, who presided over the translation.",
        "This event, occurring nearly twelve years after his death, marked an important moment in the development of devotion to St. Dominic. It preceded his canonization by Pope Gregory IX on July 3, 1234, and helped to spread his cult throughout the Order and the universal Church.",
        "The memorial provides an opportunity for Dominicans to reflect on the enduring legacy of their founder and to renew their commitment to the charism he established. Dominic's dying words to his brothers—'Have charity for one another, guard humility, make your treasure out of voluntary poverty'—continue to inspire Dominicans today.",
        "The current tomb of St. Dominic in Bologna is a magnificent marble sarcophagus known as the Arca di San Domenico, adorned with relief sculptures by several artists, including a young Michelangelo. It remains an important pilgrimage site for Dominicans and others seeking the saint's intercession.",
        "The celebration of this feast includes special readings and prayers that highlight Dominic's holiness and the impact of his life and work. The liturgical texts emphasize his role as founder of the Order of Preachers and his zeal for the salvation of souls.",
        "In Dominican communities, this day is often marked by special observances that recall the Order's history and traditions. These may include processions, the blessing of roses (in memory of the roses found in Dominic's tomb), and communal renewal of commitment to the Dominican charism.",
      ],
    },
  ]
}

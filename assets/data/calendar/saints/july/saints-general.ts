import type { Saint } from "@/types/saint-types"
import { LiturgicalColor } from "@/types/liturgical-types"
import { CelebrationRank } from "@/types/celebrations-types"

// July saints
export const julyGeneralSaints: Saint[] = [
  {
    id: "mary-magdalene",
    name: "St. Mary Magdalene",
    feast_day: "07-22",
    short_bio: "Disciple of Jesus and witness to the Resurrection",
    biography: [
      "St. Mary Magdalene is one of the most prominent women mentioned in the New Testament. She was a faithful disciple of Jesus Christ who accompanied him during his ministry and witnessed his crucifixion, burial, and resurrection.",
      "According to the Gospels, Jesus cast seven demons out of Mary Magdalene (Luke 8:2), after which she became one of his followers, supporting his ministry from her own resources. She is often identified as the woman who anointed Jesus' feet with expensive perfume and wiped them with her hair, though this identification is not explicitly stated in Scripture.",
      "Mary Magdalene showed remarkable courage and loyalty by remaining at the foot of the cross during Jesus' crucifixion when most of his disciples had fled. She was also among the women who went to anoint Jesus' body on Easter morning and became the first witness to the Resurrection.",
      "In John's Gospel, Mary encounters the risen Christ outside the empty tomb. At first, she mistakes him for a gardener, but when Jesus calls her by name, she recognizes him. Jesus then entrusts her with the message of his resurrection, telling her to inform the disciples. For this reason, she is often called the 'Apostle to the Apostles.'",
      "After the Ascension, little is known with certainty about Mary Magdalene's life. According to Eastern tradition, she went to Ephesus with the Virgin Mary and died there. Western tradition, particularly popular in France, holds that she evangelized Provence and spent her final years in contemplation in a cave at La Sainte-Baume.",
      "Throughout history, Mary Magdalene has been misidentified as a repentant prostitute, but this characterization is not supported by Scripture. In 2016, Pope Francis elevated her liturgical celebration from a memorial to a feast, recognizing her important role as the first witness to Christ's resurrection and as an example of true and authentic evangelization.",
    ],
    image_url: "/saints/st-mary-magdalene.jpg",
    patronage: "Converts, penitents, perfumers, hairdressers, pharmacists, contemplative life",
    birth_year: 4,
    death_year: 63,
    prayers:
      "O God, whose Only Begotten Son entrusted Mary Magdalene before all others with announcing the great joy of the Resurrection, grant, we pray, that through her intercession and example we may proclaim the living Christ and come to see him reigning in your glory. Who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever. Amen.",
    is_dominican: false,
    rank: CelebrationRank.MEMORIAL,
    color: LiturgicalColor.WHITE,
    proper: "Proper of Saints",
  },
]

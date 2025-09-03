import type { Saint } from "@/types/saint-types"
import { LiturgicalColor } from "@/types/liturgical-types"
import { CelebrationRank } from "@/types/celebrations-types"

// February saints
export const februaryGeneralSaints: Saint[] = [
  {
    id: "scholastica",
    name: "St. Scholastica",
    feast_day: "02-10",
    short_bio: "Virgin, twin sister of St. Benedict, and foundress of Benedictine monasticism for women",
    biography: [
      "St. Scholastica was born around 480 AD in Nursia, Italy, to wealthy and noble parents. She was the twin sister of St. Benedict, who would later become known as the father of Western monasticism. From an early age, Scholastica was dedicated to God, possibly as a consecrated virgin.",
      "When Benedict established his monastery at Monte Cassino, Scholastica founded a convent about five miles away at Plombariola, where she lived with a community of religious women under her brother's spiritual direction. She is considered the foundress of the female branch of Benedictine monasticism.",
      "The most famous story about Scholastica comes from St. Gregory the Great's 'Dialogues.' According to this account, Benedict and Scholastica met once a year at a house midway between their monasteries to spend the day in prayer and discussion of spiritual matters. During their last meeting, Scholastica, sensing her death was near, asked Benedict to stay the night to continue their spiritual conversation.",
      "When Benedict refused, insisting he needed to return to his monastery, Scholastica prayed to God. Suddenly, a violent thunderstorm erupted, making it impossible for Benedict to leave. 'What have you done?' Benedict asked. Scholastica replied, 'I asked you and you would not listen; so I asked my God and He did listen.'",
      "This story is often interpreted as showing how Scholastica's love and faith were more powerful than her brother's adherence to monastic rules. Benedict stayed the night, and they continued their spiritual discussions until morning. Three days later, Benedict saw his sister's soul ascending to heaven in the form of a dove.",
      "St. Scholastica died around 543 AD. According to tradition, Benedict had her body brought to Monte Cassino and buried in the tomb he had prepared for himself. When Benedict died later, he was buried in the same tomb with his sister, uniting in death the two who had been so close in life and in their dedication to God.",
      "While little is known about the specific rules Scholastica established for her community, it is believed that her convent followed a female adaptation of the Rule of St. Benedict, which emphasized prayer, work, study, and community life. Her legacy lives on in the thousands of Benedictine women who have followed her example throughout the centuries.",
    ],
    image_url: "/saints/st-scholastica.jpg",
    patronage: "Nuns, convulsive children, against storms and rain, education",
    birth_year: 480,
    death_year: 543,
    prayers:
      "O God, who, to show us the way of innocence, caused the soul of your virgin Saint Scholastica to soar to heaven in the likeness of a dove, grant, through her merits and intercession, that we may so live in innocence as to attain to joys everlasting. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever. Amen.",
    is_dominican: false,
    rank: CelebrationRank.MEMORIAL,
    color: LiturgicalColor.WHITE,
    proper: "Proper of Saints",
  },
]

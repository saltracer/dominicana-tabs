import type { Saint } from "@/types/saint-types"
import { LiturgicalColor } from "@/types/liturgical-types"
import { CelebrationRank } from "@/types/celebrations-types"

// January saints
export const januaryGeneralSaints: Saint[] = [
  {
    id: "john-bosco",
    name: "St. John Bosco",
    feast_day: "01-31",
    short_bio:
      "Priest, educator, and founder of the Salesian Society dedicated to the education of poor and disadvantaged youth",
    biography: [
      "St. John Bosco was born on August 16, 1815, in Becchi, a small hamlet in Piedmont, Italy. He was the youngest son of Francesco Bosco and Margherita Occhiena. His father died when he was only two years old, leaving his mother to raise him and his two older brothers in poverty but with strong faith.",
      "From an early age, John showed a deep spiritual sensitivity. At the age of nine, he had a prophetic dream that would shape his future vocation. In this dream, he saw himself transforming wild animals into gentle lambs, and a majestic figure (later understood to be Jesus) and a lady (later understood to be Mary) told him: 'Not with blows, but with charity and gentleness must you draw these friends to the path of virtue.'",
      "Despite financial hardships, John was determined to pursue education. He worked as a shepherd, tailor, carpenter, and baker to support himself while studying. A kind priest, Fr. Joseph Cafasso, recognized his potential and helped him enter the seminary. John was ordained a priest on June 5, 1841, in Turin.",
      "As a young priest in industrializing Turin, Don Bosco (as he came to be called) was deeply affected by the plight of poor boys who flocked to the city looking for work. Many ended up homeless, exploited, or imprisoned. He began gathering these boys on Sundays for recreation, catechism, and Mass, establishing what he called an 'oratory' – a combination of playground, school, church, and home.",
      "Don Bosco developed a unique educational approach called the 'Preventive System,' based on reason, religion, and loving-kindness rather than punishment. He believed in creating a family atmosphere where young people could grow in faith, honesty, and skills for life and work. His method emphasized presence among the young, looking for the good in each person, and creating an environment that encouraged growth.",
      "In 1859, Don Bosco founded the Society of St. Francis de Sales (Salesians), a religious congregation dedicated to the education and care of poor and disadvantaged youth. With St. Mary Domenica Mazzarello, he later co-founded the Daughters of Mary Help of Christians (Salesian Sisters) in 1872 to extend similar work among girls. He also established the Salesian Cooperators, lay people who shared in the Salesian mission.",
      "Despite facing opposition and numerous challenges, Don Bosco's work expanded rapidly. He was a prolific writer, publishing numerous books and pamphlets on education and spirituality. He was also known for his prophetic dreams, practical wisdom, and tireless work for the salvation of souls, particularly the young.",
      "Don Bosco was also a skilled negotiator who helped ease tensions between the Vatican and the newly formed Italian state. He supervised the building of the Basilica of Mary Help of Christians in Turin and sent the first Salesian missionaries to Argentina in 1875, beginning the international expansion of his work.",
      "Worn out by his tireless efforts, Don Bosco died on January 31, 1888, in Turin. His last words to his Salesians were: 'Love each other as brothers. Do good to all and evil to none.' At the time of his death, there were 250 Salesian houses in 10 different countries serving over 130,000 children.",
      "Don Bosco was canonized by Pope Pius XI on Easter Sunday, April 1, 1934. He is known as the 'Father and Teacher of Youth' and his educational method continues to influence modern pedagogy. Today, the Salesian Family serves young people in more than 130 countries worldwide.",
    ],
    image_url: "/saints/st-john-bosco.jpg",
    patronage: "Youth, apprentices, students, young workers, editors, publishers, magicians",
    birth_year: 1815,
    death_year: 1888,
    prayers:
      "O God, who raised up Saint John Bosco as a father and teacher of the young, grant, we pray, that, aflame with the same fire of love, we may seek out souls and serve you alone. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever. Amen.",
    is_dominican: false,
    rank: CelebrationRank.MEMORIAL,
    color: LiturgicalColor.WHITE,
    proper: "Proper of Saints",
  },
]

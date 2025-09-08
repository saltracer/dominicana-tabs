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
  {
    id: "pier-giorgio-frassati",
    name: "St. Pier Giorgio Frassati",
    feast_day: "07-04",
    short_bio: "Young lay Dominican, mountaineer, and social activist who served the poor",
    biography: [
      "Pier Giorgio Frassati was born on April 6, 1901, in Turin, Italy, to a wealthy and influential family. His father, Alfredo Frassati, was the founder and director of the newspaper 'La Stampa' and served as Italian ambassador to Germany. His mother, Adelaide Ametis, was a talented painter. Despite their wealth and social status, Pier Giorgio's parents were not particularly religious, but they provided their children with a good education and comfortable upbringing.",
      "From an early age, Pier Giorgio displayed a deep spiritual sensitivity and a natural inclination toward helping others. He was educated by the Jesuits at the Royal Gymnasium and later studied mining engineering at the Polytechnic University of Turin. However, his true passion lay not in academics but in his faith and his desire to serve the poor and marginalized in society.",
      "At the age of 17, Pier Giorgio joined the Third Order of Saint Dominic, taking the name 'Girolamo' after the Dominican saint Jerome. This decision marked a turning point in his life, as he became more deeply committed to living out his Catholic faith through service to others. He was also active in Catholic Action, a lay organization dedicated to social justice and evangelization, and became a member of the Society of Saint Vincent de Paul.",
      "Pier Giorgio's life was characterized by a remarkable balance between his social activities and his spiritual life. He attended daily Mass, spent hours in prayer, and had a deep devotion to the Eucharist and the Virgin Mary. He was known for his joyful personality, his love of mountaineering and outdoor activities, and his ability to bring people together. His friends called him 'Terror' because of his playful and energetic nature, but they also recognized his deep spirituality and commitment to helping others.",
      "Despite his family's wealth, Pier Giorgio chose to live simply and used his resources to help the poor. He would often give away his money, clothes, and even his shoes to those in need. He visited the slums of Turin regularly, bringing food, medicine, and comfort to the sick and destitute. He was particularly drawn to helping children and the elderly, and he would often spend his evenings visiting the poor in their homes, bringing them not only material assistance but also spiritual comfort and friendship.",
      "Pier Giorgio was also deeply committed to social justice and political reform. He was active in the Catholic student movement and participated in demonstrations against fascism. He believed that his faith called him to work for a more just and equitable society, and he was not afraid to speak out against injustice, even when it put him at odds with his family's political connections.",
      "In the summer of 1925, Pier Giorgio contracted polio, likely from one of the poor people he was helping. Despite his illness, he continued to think of others, asking his family to give his medicine to a poor man who was also sick. He died on July 4, 1925, at the age of 24, after just six days of illness. His funeral was attended by thousands of people, many of whom were the poor and marginalized he had served throughout his life.",
      "The cause for Pier Giorgio's canonization was opened in 1932, just seven years after his death, due to the widespread recognition of his holiness and the many people who had been touched by his life and witness. He was declared Venerable in 1987, beatified on May 20, 1990, by Pope John Paul II, and canonized on September 7, 2025, by Pope Leo XIV. His canonization was particularly significant as it recognized the holiness possible in young lay people who live their faith in the world.",
      "St. Pier Giorgio Frassati is remembered as a model for young Catholics, showing how faith can be lived joyfully and authentically in the modern world. His life demonstrates that holiness is not reserved for priests and religious but is accessible to all Christians, regardless of their age or state in life. He is particularly revered by young people, mountaineers, and those involved in social justice work, and his example continues to inspire countless people to live their faith more fully and to serve others with love and joy.",
    ],
    image_url: "/saints/st-pier-giorgio-frassati.jpg",
    patronage: "Young people, students, mountaineers, Catholic Action, social justice, the poor",
    birth_year: 1901,
    death_year: 1925,
    birth_place: "Turin, Italy",
    death_place: "Turin, Italy",
    canonization_date: "2025-09-07",
    prayers: "O God, who gave to the young Pier Giorgio Frassati the joy of meeting Christ and of living his faith in service of the poor and the needy, grant through his intercession that we too may walk the path of the beatitudes and follow Jesus in generous service of our brothers and sisters. Through Christ our Lord. Amen.",
    is_dominican: true,
    rank: CelebrationRank.MEMORIAL,
    color: LiturgicalColor.WHITE,
    proper: "Proper of Saints",
    type: "dominican",
    quotes: [
      "To live without faith, without a patrimony to defend, without a steady struggle for truth, that is not living, but existing.",
      "The faith given to me in Baptism suggests to me surely: by yourself you will do nothing, but if you have God as the center of all your action, then you will reach the goal.",
      "I want to live, not just exist.",
      "Verso l'alto! (To the heights! - his mountaineering motto that became his spiritual motto as well).",
    ],
  },
]

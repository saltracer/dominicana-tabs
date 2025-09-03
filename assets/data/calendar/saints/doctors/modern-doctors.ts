import type { Saint } from "@/types/saint-types"
import { LiturgicalColor } from "@/types/liturgical-types"
import { CelebrationRank } from "@/types/celebrations-types"

// Modern Doctors of the Church (18th century onward)
export const modernDoctors: Saint[] = [
  // Add modern doctors here - this would include figures like:
  // St. Thérèse of Lisieux, etc.
  // For now, keeping this array empty as the original file structure
  // needs to be analyzed to properly categorize existing doctors  
  {
    id: "therese-of-lisieux",
    name: "St. Thérèse of Lisieux",
    feast_day: "10-01",
    short_bio: "French Carmelite nun known as 'The Little Flower' and Doctor of the Church",
    biography: [
      "St. Thérèse was born Marie Françoise-Thérèse Martin in Alençon, France, on January 2, 1873, the youngest of nine children, four of whom died in infancy. Her parents, Louis and Zélie Martin, were both canonized in 2015.",
      "Thérèse suffered the loss of her mother to breast cancer when she was only four years old. This loss deeply affected her, and she became a sensitive and sometimes difficult child. The family moved to Lisieux after her mother's death.",
      "From an early age, Thérèse felt called to religious life. After a profound conversion experience on Christmas Eve 1886, she sought to enter the Carmelite convent in Lisieux where two of her older sisters had already entered. Despite her young age, she received special permission from Pope Leo XIII and entered Carmel in 1888, at the age of 15.",
      "In the convent, Thérèse developed her 'Little Way' of spiritual childhood, focusing on doing small things with great love. She served in various roles, including assistant to the novice mistress, despite her youth and lack of formal education.",
      "In 1896, Thérèse was diagnosed with tuberculosis. During her illness, at the request of her sister who was also her prioress, she wrote her autobiography, 'The Story of a Soul,' which has become a spiritual classic.",
      "She died on September 30, 1897, at the age of 24, after a painful illness borne with remarkable patience. Her last words were, 'My God, I love You!' She was canonized in 1925 by Pope Pius XI and declared a Doctor of the Church by Pope John Paul II in 1997, one of only four women to receive this honor.",
    ],
    image_url: "/saints/st-therese-of-lisieux.jpg",
    patronage: "Missions, France, Russia, florists, gardeners, loss of parents, tuberculosis patients",
    birth_year: 1873,
    birth_place: "Alençon, Orne, France",
    death_year: 1897,
    death_place: "Lisieux, Calvados, France",
    canonization_date: "1925-05-17",
    quotes: [
      "My mission - to make God loved - will begin after my death. I will spend my heaven doing good on earth. I will let fall a shower of roses.",
      "The splendor of the rose and the whiteness of the lily do not rob the little violet of its scent nor the daisy of its simple charm... Perfection consists in being what God wants us to be.",
      "Without love, deeds, even the most brilliant, count as nothing.",
      "For me, prayer is a surge of the heart; it is a simple look turned toward heaven, it is a cry of recognition and of love, embracing both trial and joy.",
      "I have always kept my childish ways, and even now I ask Jesus to draw me into the flames of His love, to unite me so closely to Him that He may live and act in me.",
      "Miss no single opportunity of making some small sacrifice, here by a smiling look, there by a kindly word; always doing the smallest right and doing it all for love.",
      "You cannot be half a saint; you must be a whole saint or no saint at all.",
      "The good God does not need years to accomplish His work of love in a soul; one ray from His Heart can, in an instant, make His flower bloom for eternity.",
      "I know now that true charity consists in bearing all our neighbors' defects—not being surprised at their weakness, but edified at their smallest virtues.",
      "When we yield to discouragement or despair, it is usually because we are thinking about ourselves.",
      "Jesus, help me to simplify my life by learning what you want me to be — and becoming that person.",
      "The only way to make rapid progress along the path of divine love is to remain very little.",
      "I understood that love comprises all vocations, that love is everything, that it embraces all times and places...in a word, that it is eternal!"
    ],
    prayers:
      "O Little Flower of Jesus, during your short life on earth you became a mirror of angelic purity, of love strong as death, and of wholehearted abandonment to God. I now place my request in your hands. Obtain for me from God, through your intercession, the favors I seek. St. Thérèse, help me to always believe as you did, in God's great love for me, so that I might imitate your 'Little Way' each day. Amen.",
    books: ["story-of-a-soul", "letters-of-st-therese", "poems-of-st-therese"],
    is_dominican: false,
    is_doctor: true,
    rank: CelebrationRank.MEMORIAL,
    color: LiturgicalColor.WHITE,
    proper: "Proper of Saints",
  },

]

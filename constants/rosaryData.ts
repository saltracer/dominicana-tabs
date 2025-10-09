/**
 * Rosary Prayer Data
 * Contains all mysteries, prayers, and meditations for the rosary
 */

import { MysteryData, MysterySet } from '../types/rosary-types';

export const ROSARY_MYSTERIES: MysteryData[] = [
  {
    name: 'Joyful Mysteries',
    day: 'Monday & Saturday',
    icon: 'happy-outline',
    description: 'The Annunciation, Visitation, Nativity, Presentation, and Finding in the Temple',
    mysteries: [
      {
        name: 'The Annunciation',
        bibleReference: 'Luke 1:26-38',
        meditation: 'Mary\'s "yes" to God changed the world. The angel Gabriel announces to Mary that she will conceive and bear the Son of God. With perfect faith and humility, Mary accepts God\'s will, saying "Behold, I am the handmaid of the Lord. Let it be done to me according to your word." Consider how Mary\'s trust in God\'s plan brought salvation to the world.'
      },
      {
        name: 'The Visitation',
        bibleReference: 'Luke 1:39-56',
        meditation: 'Mary visits her cousin Elizabeth, who is also with child. When Mary greets her, the infant John the Baptist leaps for joy in Elizabeth\'s womb, recognizing the presence of the Lord. Elizabeth proclaims Mary "blessed among women," and Mary responds with the Magnificat, praising God for His mercy. Consider how we too can bring Christ to others through our words and actions.'
      },
      {
        name: 'The Nativity',
        bibleReference: 'Luke 2:1-20',
        meditation: 'In a humble stable in Bethlehem, the Son of God is born into the world. Angels announce the good news to shepherds, who come to adore the newborn King. The Word becomes flesh and dwells among us. Consider the humility of God, who chose to be born in poverty to show us that true wealth is found in love and service.'
      },
      {
        name: 'The Presentation',
        bibleReference: 'Luke 2:22-38',
        meditation: 'Mary and Joseph present Jesus in the Temple according to the Law of Moses. The holy man Simeon recognizes Jesus as the Messiah and prophesies that Mary\'s heart will be pierced. The prophetess Anna also gives thanks for the child. Consider how we too are called to present ourselves to God in service and dedication.'
      },
      {
        name: 'The Finding in the Temple',
        bibleReference: 'Luke 2:41-52',
        meditation: 'After three days of anxious searching, Mary and Joseph find the twelve-year-old Jesus in the Temple, discussing the Law with the teachers. Jesus says, "Did you not know I must be in my Father\'s house?" Consider how Jesus shows us that seeking God must be our first priority, even as we fulfill our earthly duties.'
      }
    ]
  },
  {
    name: 'Sorrowful Mysteries',
    day: 'Tuesday & Friday',
    icon: 'heart-outline',
    description: 'The Agony in the Garden, Scourging, Crowning with Thorns, Carrying the Cross, and Crucifixion',
    mysteries: [
      {
        name: 'The Agony in the Garden',
        bibleReference: 'Luke 22:39-46',
        meditation: 'In the Garden of Gethsemane, Jesus prays in anguish, knowing the suffering that awaits Him. He asks the Father, "If you are willing, take this cup away from me; still, not my will but yours be done." His sweat becomes like drops of blood. Consider how Jesus teaches us to accept God\'s will, even in our darkest moments of fear and suffering.'
      },
      {
        name: 'The Scourging at the Pillar',
        bibleReference: 'John 19:1',
        meditation: 'Pilate orders Jesus to be scourged, a brutal punishment that tears the flesh from His body. Jesus endures this agony in silence, bearing the punishment for our sins. Consider how Jesus suffers for us, taking upon Himself the consequences of all human sin. His wounds heal our spiritual wounds.'
      },
      {
        name: 'The Crowning with Thorns',
        bibleReference: 'Matthew 27:27-31',
        meditation: 'Roman soldiers mock Jesus, placing a crown of thorns on His head and a reed in His hand, kneeling before Him in false homage. They spit on Him and strike Him. The King of Kings is ridiculed and humiliated. Consider how Jesus endures mockery and contempt for our sake, teaching us humility and patience in suffering.'
      },
      {
        name: 'The Carrying of the Cross',
        bibleReference: 'Luke 23:26-32',
        meditation: 'Jesus carries His cross through the streets of Jerusalem to Calvary. Weakened by torture and loss of blood, He falls repeatedly under its weight. Simon of Cyrene is compelled to help Him. Women weep for Him along the way. Consider how we too must carry our daily crosses, following in the footsteps of Christ.'
      },
      {
        name: 'The Crucifixion',
        bibleReference: 'Luke 23:33-46',
        meditation: 'Jesus is nailed to the cross between two criminals. He forgives those who crucified Him, promising paradise to the repentant thief, and entrusts His mother to John\'s care. After three hours of agony, Jesus cries out, "Father, into your hands I commend my spirit," and dies. Consider the infinite love that led Jesus to give His life for our salvation.'
      }
    ]
  },
  {
    name: 'Glorious Mysteries',
    day: 'Wednesday & Sunday',
    icon: 'star-outline',
    description: 'The Resurrection, Ascension, Descent of the Holy Spirit, Assumption, and Coronation',
    mysteries: [
      {
        name: 'The Resurrection',
        bibleReference: 'Matthew 28:1-10',
        meditation: 'On the third day, Jesus rises from the dead, conquering sin and death. Angels announce to the women at the tomb, "He is not here; He has been raised!" Jesus appears to Mary Magdalene and the disciples. Consider how Christ\'s resurrection is the foundation of our faith and our hope for eternal life.'
      },
      {
        name: 'The Ascension',
        bibleReference: 'Acts 1:6-11',
        meditation: 'Forty days after His resurrection, Jesus leads His disciples to the Mount of Olives. He promises to send the Holy Spirit and commissions them to preach the Gospel to all nations. Then He ascends into heaven and is seated at the right hand of the Father. Consider how Jesus has gone to prepare a place for us in His Father\'s house.'
      },
      {
        name: 'The Descent of the Holy Spirit',
        bibleReference: 'Acts 2:1-13',
        meditation: 'On Pentecost, the disciples are gathered in prayer with Mary when suddenly a mighty wind fills the house. Tongues of fire rest upon each of them, and they are filled with the Holy Spirit. They begin to speak in different languages and boldly proclaim the Gospel. Consider how the Holy Spirit empowers us for mission and sanctifies us with divine gifts.'
      },
      {
        name: 'The Assumption',
        bibleReference: 'Revelation 12:1',
        meditation: 'At the end of her earthly life, Mary is assumed body and soul into heaven. Having been preserved from sin, she does not experience the corruption of the grave. The Church recognizes this as a foretaste of the resurrection that awaits all the faithful. Consider how Mary is our hope and model, showing us the glory that God has prepared for those who love Him.'
      },
      {
        name: 'The Coronation of Mary',
        bibleReference: 'Revelation 12:1',
        meditation: 'Mary is crowned as Queen of Heaven and Earth, sharing in the glory of her Son\'s kingdom. She is the Mother of the Church, the refuge of sinners, and the advocate for all who seek her intercession. Consider how Mary reigns as our spiritual mother, always ready to bring our prayers to her Son and to lead us closer to God.'
      }
    ]
  },
  {
    name: 'Luminous Mysteries',
    day: 'Thursday',
    icon: 'flash-outline',
    description: 'The Baptism, Wedding at Cana, Proclamation of the Kingdom, Transfiguration, and Institution of the Eucharist',
    mysteries: [
      {
        name: 'The Baptism of Jesus',
        bibleReference: 'Matthew 3:13-17',
        meditation: 'Jesus comes to John the Baptist at the Jordan River to be baptized. Though sinless, He humbly submits to baptism to fulfill all righteousness. When He emerges from the water, the heavens open, the Holy Spirit descends like a dove, and the Father\'s voice proclaims, "This is my beloved Son, with whom I am well pleased." Consider how our own baptism makes us children of God.'
      },
      {
        name: 'The Wedding at Cana',
        bibleReference: 'John 2:1-11',
        meditation: 'At a wedding feast in Cana, Mary notices that the wine has run out. She tells Jesus, and then instructs the servants, "Do whatever he tells you." Jesus transforms water into wine, performing His first miracle. Consider how Mary\'s intercession moves Jesus to act, and how she continues to bring our needs to her Son.'
      },
      {
        name: 'The Proclamation of the Kingdom',
        bibleReference: 'Mark 1:14-15',
        meditation: 'Jesus begins His public ministry, proclaiming, "The kingdom of God is at hand. Repent, and believe in the gospel." He teaches with authority, heals the sick, casts out demons, and calls sinners to conversion. Consider how we are called to repent, believe, and share the Good News with others.'
      },
      {
        name: 'The Transfiguration',
        bibleReference: 'Matthew 17:1-8',
        meditation: 'Jesus takes Peter, James, and John up a high mountain, where He is transfigured before them. His face shines like the sun and His clothes become white as light. Moses and Elijah appear with Him, and the Father\'s voice says, "This is my beloved Son. Listen to him." Consider how this glimpse of divine glory strengthened the disciples for the trials ahead.'
      },
      {
        name: 'The Institution of the Eucharist',
        bibleReference: 'Matthew 26:26-28',
        meditation: 'At the Last Supper, Jesus takes bread and wine and transforms them into His Body and Blood. He gives them to His disciples, saying, "Take and eat... Take and drink... Do this in memory of me." He institutes the priesthood and the sacrifice of the Mass. Consider the infinite love that led Jesus to give us Himself in this most holy sacrament.'
      }
    ]
  }
];

export const PRAYER_TEXTS = {
  signOfCross: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
  apostlesCreed: 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
  ourFather: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  hailMary: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  gloryBe: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',
  fatimaPrayer: 'O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to heaven, especially those in most need of thy mercy. Amen.',
  dominicanOpening1: 'V. Hail Mary, full of grace, the Lord is with thee.\n\nR. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.',
  dominicanOpening2: 'V. O Lord, open my lips.\n\nR. And my mouth will proclaim your praise.',
  dominicanOpening3: 'V. O God, come to my assistance.\n\nR. O Lord, make haste to help me.',
  hailMaryFaith: 'Hail Mary (for the virtue of Faith)',
  hailMaryHope: 'Hail Mary (for the virtue of Hope)',
  hailMaryCharity: 'Hail Mary (for the virtue of Charity)',
  finalPrayer: 'Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\n\nV. Pray for us, O Holy Mother of God.\n\nR. That we may be made worthy of the promises of Christ.\n\nO God, whose only-begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ Our Lord. Amen.'
};

export function getTodaysMystery(): MysterySet {
  const today = new Date().getDay();
  switch (today) {
    case 0: // Sunday
    case 3: // Wednesday
      return 'Glorious Mysteries';
    case 1: // Monday
    case 6: // Saturday
      return 'Joyful Mysteries';
    case 2: // Tuesday
    case 5: // Friday
      return 'Sorrowful Mysteries';
    case 4: // Thursday
      return 'Luminous Mysteries';
    default:
      return 'Joyful Mysteries';
  }
}

export function getDayOfWeekName(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}


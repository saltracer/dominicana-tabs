import { LiturgicalColor } from "@/types/liturgical-types"
import { 
  calculateEaster, 
  calculateFirstAdventSunday,
  getAshWednesday,
  getHolyWeekDates,
  getEasterOctaveDates,
  getPentecostSunday,
  getMaryMotherChurchMonday,
  getLaetareSunday,
  getHolyThursday,
  getGoodFriday,
  getHolySaturday,
  getPalmSunday,
  getDivineMercySunday,
  getAscensionThursday,
  getTrinitySunday,
  getCorpusChristiThursday,
  getSacredHeartFriday,
  getChristTheKingSunday,
  getEpiphanySunday,
  getBaptismOfLordSunday
} from "@/assets/data/calendar/liturgical-seasons"
import { FixedCelebration, CelebrationRank } from "@/types/celebrations-types"

// Define the moveable feasts and solemnities (those that depend on the date of Easter)
export function moveableGeneralCelebrations(year: number): FixedCelebration[] {
  const easterDate = calculateEaster(year)
  const easterMonth = easterDate.getMonth() + 1 // JavaScript months are 0-indexed
  const easterDay = easterDate.getDate()

  // Format Easter date as "MM-DD"
  const easterDateString = `${easterMonth.toString().padStart(2, "0")}-${easterDay.toString().padStart(2, "0")}`

  // Get Epiphany (Sunday closest to January 6)
  const epiphanyDate = getEpiphanySunday(year)
  const epiphanyMonth = epiphanyDate.getMonth() + 1
  const epiphanyDay = epiphanyDate.getDate()
  const epiphanyString = `${epiphanyMonth.toString().padStart(2, "0")}-${epiphanyDay.toString().padStart(2, "0")}`

  // Get Baptism of the Lord (Sunday after Epiphany, or Monday if Epiphany is Jan 7 or 8)
  const baptismOfLordDate = getBaptismOfLordSunday(year)
  const baptismOfLordMonth = baptismOfLordDate.getMonth() + 1
  const baptismOfLordDay = baptismOfLordDate.getDate()
  const baptismOfLordString = `${baptismOfLordMonth.toString().padStart(2, "0")}-${baptismOfLordDay.toString().padStart(2, "0")}`

  // Get Ash Wednesday
  const ashWednesdayDate = getAshWednesday(year)
  const ashWednesdayMonth = ashWednesdayDate.getMonth() + 1
  const ashWednesdayDay = ashWednesdayDate.getDate()
  const ashWednesdayString = `${ashWednesdayMonth.toString().padStart(2, "0")}-${ashWednesdayDay.toString().padStart(2, "0")}`

  // Get Holy Week dates
  const {
    palmSunday: palmSundayDate,
    holyMonday: holyMondayDate,
    holyTuesday: holyTuesdayDate,
    holyWednesday: holyWednesdayDate,
    holyThursday: holyThursdayDate,
    goodFriday: goodFridayDate,
    holySaturday: holySaturdayDate
  } = getHolyWeekDates(easterDate)

  const palmSundayMonth = palmSundayDate.getMonth() + 1
  const palmSundayDay = palmSundayDate.getDate()
  const palmSundayString = `${palmSundayMonth.toString().padStart(2, "0")}-${palmSundayDay.toString().padStart(2, "0")}`

  const holyMondayMonth = holyMondayDate.getMonth() + 1
  const holyMondayDay = holyMondayDate.getDate()
  const holyMondayString = `${holyMondayMonth.toString().padStart(2, "0")}-${holyMondayDay.toString().padStart(2, "0")}`

  const holyTuesdayMonth = holyTuesdayDate.getMonth() + 1
  const holyTuesdayDay = holyTuesdayDate.getDate()
  const holyTuesdayString = `${holyTuesdayMonth.toString().padStart(2, "0")}-${holyTuesdayDay.toString().padStart(2, "0")}`

  const holyWednesdayMonth = holyWednesdayDate.getMonth() + 1
  const holyWednesdayDay = holyWednesdayDate.getDate()
  const holyWednesdayString = `${holyWednesdayMonth.toString().padStart(2, "0")}-${holyWednesdayDay.toString().padStart(2, "0")}`

  // Get Laetare Sunday (4th Sunday of Lent)
  const laetareSundayDate = getLaetareSunday(year)
  const laetareSundayMonth = laetareSundayDate.getMonth() + 1
  const laetareSundayDay = laetareSundayDate.getDate()
  const laetareSundayString = `${laetareSundayMonth.toString().padStart(2, "0")}-${laetareSundayDay.toString().padStart(2, "0")}`

  const holyThursdayMonth = holyThursdayDate.getMonth() + 1
  const holyThursdayDay = holyThursdayDate.getDate()
  const holyThursdayString = `${holyThursdayMonth.toString().padStart(2, "0")}-${holyThursdayDay.toString().padStart(2, "0")}`

  const goodFridayMonth = goodFridayDate.getMonth() + 1
  const goodFridayDay = goodFridayDate.getDate()
  const goodFridayString = `${goodFridayMonth.toString().padStart(2, "0")}-${goodFridayDay.toString().padStart(2, "0")}`

  const holySaturdayMonth = holySaturdayDate.getMonth() + 1
  const holySaturdayDay = holySaturdayDate.getDate()
  const holySaturdayString = `${holySaturdayMonth.toString().padStart(2, "0")}-${holySaturdayDay.toString().padStart(2, "0")}`

  // Get Easter Octave dates
  const {
    easterMonday: easterMondayDate,
    easterTuesday: easterTuesdayDate,
    easterWednesday: easterWednesdayDate,
    easterThursday: easterThursdayDate,
    easterFriday: easterFridayDate,
    easterSaturday: easterSaturdayDate
  } = getEasterOctaveDates(easterDate)

  const easterMondayMonth = easterMondayDate.getMonth() + 1
  const easterMondayDay = easterMondayDate.getDate()
  const easterMondayString = `${easterMondayMonth.toString().padStart(2, "0")}-${easterMondayDay.toString().padStart(2, "0")}`

  const easterTuesdayMonth = easterTuesdayDate.getMonth() + 1
  const easterTuesdayDay = easterTuesdayDate.getDate()
  const easterTuesdayString = `${easterTuesdayMonth.toString().padStart(2, "0")}-${easterTuesdayDay.toString().padStart(2, "0")}`

  const easterWednesdayMonth = easterWednesdayDate.getMonth() + 1
  const easterWednesdayDay = easterWednesdayDate.getDate()
  const easterWednesdayString = `${easterWednesdayMonth.toString().padStart(2, "0")}-${easterWednesdayDay.toString().padStart(2, "0")}`

  const easterThursdayMonth = easterThursdayDate.getMonth() + 1
  const easterThursdayDay = easterThursdayDate.getDate()
  const easterThursdayString = `${easterThursdayMonth.toString().padStart(2, "0")}-${easterThursdayDay.toString().padStart(2, "0")}`

  const easterFridayMonth = easterFridayDate.getMonth() + 1
  const easterFridayDay = easterFridayDate.getDate()
  const easterFridayString = `${easterFridayMonth.toString().padStart(2, "0")}-${easterFridayDay.toString().padStart(2, "0")}`

  const easterSaturdayMonth = easterSaturdayDate.getMonth() + 1
  const easterSaturdayDay = easterSaturdayDate.getDate()
  const easterSaturdayString = `${easterSaturdayMonth.toString().padStart(2, "0")}-${easterSaturdayDay.toString().padStart(2, "0")}`

  // Get Divine Mercy Sunday (1 week after Easter)
  const divineMercyDate = getDivineMercySunday(year)
  const divineMercyMonth = divineMercyDate.getMonth() + 1
  const divineMercyDay = divineMercyDate.getDate()
  const divineMercyString = `${divineMercyMonth.toString().padStart(2, "0")}-${divineMercyDay.toString().padStart(2, "0")}`

  // Get Ascension Thursday (39 days after Easter)
  const ascensionDate = getAscensionThursday(year)
  const ascensionMonth = ascensionDate.getMonth() + 1
  const ascensionDay = ascensionDate.getDate()
  const ascensionString = `${ascensionMonth.toString().padStart(2, "0")}-${ascensionDay.toString().padStart(2, "0")}`

  // Get Pentecost (49 days after Easter)
  const pentecostDate = getPentecostSunday(year)
  const pentecostMonth = pentecostDate.getMonth() + 1
  const pentecostDay = pentecostDate.getDate()
  const pentecostString = `${pentecostMonth.toString().padStart(2, "0")}-${pentecostDay.toString().padStart(2, "0")}`

  // Get Mary Mother of the Church (The day after pentcost)
  const maryMotherChurchDate = getMaryMotherChurchMonday(year)
  const maryMotherChurchMonth = maryMotherChurchDate.getMonth() + 1
  const maryMotherChurchDay = maryMotherChurchDate.getDate()
  const maryMotherChurchString = `${maryMotherChurchMonth.toString().padStart(2, "0")}-${maryMotherChurchDay.toString().padStart(2, "0")}`

  // Get Trinity Sunday (1 week after Pentecost)
  const trinitySundayDate = getTrinitySunday(year)
  const trinitySundayMonth = trinitySundayDate.getMonth() + 1
  const trinitySundayDay = trinitySundayDate.getDate()
  const trinitySundayString = `${trinitySundayMonth.toString().padStart(2, "0")}-${trinitySundayDay.toString().padStart(2, "0")}`

  // Get Corpus Christi (Thursday after Trinity Sunday)
  const corpusChristiDate = getCorpusChristiThursday(year)
  const corpusChristiMonth = corpusChristiDate.getMonth() + 1
  const corpusChristiDay = corpusChristiDate.getDate()
  const corpusChristiString = `${corpusChristiMonth.toString().padStart(2, "0")}-${corpusChristiDay.toString().padStart(2, "0")}`

  // Get Sacred Heart of Jesus (Friday after Trinity Sunday)
  const sacredHeartDate = getSacredHeartFriday(year)
  const sacredHeartMonth = sacredHeartDate.getMonth() + 1
  const sacredHeartDay = sacredHeartDate.getDate()
  const sacredHeartString = `${sacredHeartMonth.toString().padStart(2, "0")}-${sacredHeartDay.toString().padStart(2, "0")}`

  // Calculate Gaudete Sunday (3rd Sunday of Advent - approximately 2 weeks before Christmas)
  const christmasDate = new Date(year, 11, 25) // December 25
  const gaudeteDate = new Date(christmasDate)
  // Find the Sunday before Christmas
  const daysToLastSunday = christmasDate.getDay() === 0 ? 7 : christmasDate.getDay()
  // Go back to 4th Sunday of Advent, then back one more week to 3rd Sunday (Gaudete)
  gaudeteDate.setDate(christmasDate.getDate() - daysToLastSunday - 7)
  const gaudeteMonth = gaudeteDate.getMonth() + 1
  const gaudeteDay = gaudeteDate.getDate()
  const gaudeteString = `${gaudeteMonth.toString().padStart(2, "0")}-${gaudeteDay.toString().padStart(2, "0")}`

  // Calculate Holy Family (Sunday within the Octave of Christmas, or December 30 if no Sunday falls within the Octave)
  const holyFamilyDate = christmasDate // Start with Christmas
  // Find the next Sunday after Christmas, or December 30 if there is no Sunday within the Octave
  const christmasDay = holyFamilyDate.getDay() // Day of the week for Christmas (0 = Sunday, 1 = Monday, etc.)
  if (christmasDay === 0) {
    // If Christmas is on Sunday, Holy Family is on December 30
    holyFamilyDate.setDate(30)
  } else {
    // Otherwise, find the next Sunday after Christmas
    const daysUntilSunday = 7 - christmasDay
    holyFamilyDate.setDate(25 + daysUntilSunday)
    // If this Sunday is after January 1, set to December 30
    if (holyFamilyDate.getDate() > 31 || holyFamilyDate.getMonth() > 11) {
      holyFamilyDate.setMonth(11) // December
      holyFamilyDate.setDate(30)
    }
  }
  const holyFamilyMonth = holyFamilyDate.getMonth() + 1
  const holyFamilyDay = holyFamilyDate.getDate()
  const holyFamilyString = `${holyFamilyMonth.toString().padStart(2, "0")}-${holyFamilyDay.toString().padStart(2, "0")}`

  // Use the consolidated Christ the King calculation
  const christTheKingDate = getChristTheKingSunday(year)
  const christTheKingMonth = christTheKingDate.getMonth() + 1
  const christTheKingDay = christTheKingDate.getDate()
  const christTheKingString = `${christTheKingMonth.toString().padStart(2, "0")}-${christTheKingDay.toString().padStart(2, "0")}`

  return [
    {
      id: "epiphany",
      name: "The Epiphany of the Lord",
      date: epiphanyString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Solemnities",
      type: "universal",
      short_desc: "Commemorates the manifestation of Christ to the Gentiles, represented by the Magi.",
      description: [
        "The Epiphany celebrates the revelation of Christ to the world, particularly to the Gentiles as represented by the Magi who followed the star to Bethlehem. This event, described in Matthew's Gospel, signifies that Jesus came not only for the Jewish people but for all nations.",
        "The word 'epiphany' means 'manifestation' or 'revelation.' It captures the moment when the divine nature of the Christ Child was revealed to these wise men from the East, who responded with gifts of gold, frankincense, and myrrh.",
        "This feast also traditionally commemorates the baptism of Jesus in the Jordan River and the wedding feast at Cana, where Christ performed his first miracle. These three events are seen as key 'manifestations' of Christ's divinity and mission.",
        "The Magi's gifts have been interpreted symbolically: gold representing Christ's kingship, frankincense His divinity, and myrrh His humanity and future suffering. Their journey from distant lands prefigures the universal call of the Gospel.",
        "In many cultures, Epiphany (also called 'Three Kings Day') is celebrated with special foods, blessings of homes, and the exchange of gifts, recalling the gifts of the Magi. Some traditions include marking doorways with blessed chalk inscribed with the year and the letters C+M+B, standing for the traditional names of the Magi (Caspar, Melchior, and Balthasar) or for 'Christus Mansionem Benedicat' (May Christ bless this house).",
        "The timing of Epiphany near the winter solstice (when light begins to increase) connects symbolically with Christ as the Light of the World coming to dispel darkness. The star that guided the Magi represents divine guidance leading humanity to Christ.",
        "Liturgically, the Epiphany is one of the oldest Christian feasts, dating back to the 3rd century, even before Christmas was widely celebrated. In the Eastern Churches, it remains one of the most important feasts, often focusing on Christ's baptism rather than the visit of the Magi.",
      ],
    },
    {
      id: "baptism-of-lord",
      name: "The Baptism of the Lord",
      date: baptismOfLordString,
      rank: CelebrationRank.FEAST,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Commemorates the baptism of Jesus in the Jordan River by John the Baptist.",
      description: [
        "The Feast of the Baptism of the Lord commemorates the baptism of Jesus in the Jordan River by John the Baptist, as recounted in the Gospels of Matthew, Mark, and Luke.",
        "This event marks the beginning of Jesus' public ministry and reveals the Trinity: the Father's voice from heaven declaring Jesus as his beloved Son, the Holy Spirit descending like a dove, and Jesus himself in the water.",
        "The baptism of Jesus, though he was sinless, demonstrates his solidarity with humanity and his willingness to take upon himself the burden of our sins. It also serves as the model for Christian baptism, through which we are incorporated into Christ's death and resurrection.",
        "This feast concludes the Christmas season and transitions into Ordinary Time, symbolizing the end of Christ's hidden life and the beginning of his public mission of salvation.",
        "The baptism of Jesus also reveals his identity as the Messiah and the Son of God, as the voice from heaven confirms: 'This is my beloved Son, with whom I am well pleased.'",
        "In the Eastern Churches, this feast is often called 'Theophany' (manifestation of God) and is celebrated with great solemnity, including the blessing of water in commemoration of Christ's baptism.",
      ],
    },
    {
      id: "ash-wednesday",
      name: "Ash Wednesday",
      date: ashWednesdayString,
      rank: CelebrationRank.MEMORIAL, // Not technically a solemnity, but has precedence
      color: LiturgicalColor.VIOLET,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Marks the beginning of Lent with the imposition of ashes as a sign of repentance.",
      description: [
        "Ash Wednesday marks the beginning of the 40-day season of Lent, a time of prayer, fasting, and almsgiving in preparation for Easter.",
        "During the liturgy, ashes made from blessed palms from the previous year's Palm Sunday are placed on the foreheads of the faithful with the words, 'Remember that you are dust, and to dust you shall return' or 'Repent and believe in the Gospel.'",
        "The ashes symbolize mortality and the need for repentance and conversion.",
      ],
    },
    {
      id: "laetare-sunday",
      name: "Laetare Sunday",
      date: laetareSundayString,
      rank: CelebrationRank.FEAST,
      color: LiturgicalColor.ROSE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "A day of joy and hope in the middle of Lent, marked by rose vestments.",
      description: [
        "Laetare Sunday, the Fourth Sunday of Lent, is a day of joy and hope in the midst of the penitential season.",
        "The name comes from the first word of the entrance antiphon, 'Laetare' (Rejoice).",
        "On this day, rose vestments may be worn instead of violet, flowers may adorn the altar, and the organ may be played more fully, all signs of the approaching joy of Easter.",
        "It serves as a kind of 'intermission' in the austerity of Lent, encouraging the faithful to persevere in their Lenten observances.",
      ],
    },
    {
      id: "palm-sunday",
      name: "Palm Sunday of the Passion of the Lord",
      date: palmSundayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.RED,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Commemorates Jesus' triumphal entry into Jerusalem and begins Holy Week.",
      description: [
        "Palm Sunday commemorates Jesus' triumphal entry into Jerusalem, when the crowds laid palm branches on the road before him and acclaimed him as the Messiah.",
        "The liturgy begins with the blessing of palms and a procession, symbolizing our willingness to follow Christ.",
        "The joyful tone quickly shifts as the Passion narrative is read, foreshadowing the suffering and death that await Jesus.",
        "Palm Sunday marks the beginning of Holy Week, the most solemn week of the liturgical year, which culminates in the Easter Triduum.",
      ],
    },
    {
      id: "holy-monday",
      name: "Monday of Holy Week",
      date: holyMondayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.VIOLET,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The first day of Holy Week, focusing on Christ's final days before his Passion.",
      description: [
        "Monday of Holy Week continues the solemn preparation for the Easter Triduum.",
        "The Gospel reading often focuses on Mary of Bethany anointing Jesus' feet with costly perfume, foreshadowing his burial.",
        "This day invites us to reflect on our own devotion to Christ and our willingness to offer him our very best, even at great cost.",
        "The liturgy of Holy Monday helps us enter more deeply into the mystery of Christ's suffering and death, which he freely embraced out of love for humanity.",
      ],
    },
    {
      id: "holy-tuesday",
      name: "Tuesday of Holy Week",
      date: holyTuesdayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.VIOLET,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The second day of Holy Week, reflecting on Christ's impending betrayal and passion.",
      description: [
        "Tuesday of Holy Week continues our journey toward the Easter Triduum.",
        "The Gospel reading often includes Jesus' prediction of his betrayal by Judas and Peter's denial.",
        "This day invites us to examine our own fidelity to Christ and to acknowledge the times we have betrayed him through our sins and failures.",
        "The liturgy of Holy Tuesday reminds us of Christ's foreknowledge of his Passion and his willing acceptance of it for our salvation, even knowing that his closest friends would abandon him.",
      ],
    },
    {
      id: "holy-wednesday",
      name: "Wednesday of Holy Week",
      date: holyWednesdayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.VIOLET,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The third day of Holy Week, traditionally known as 'Spy Wednesday' for Judas's betrayal.",
      description: [
        "Wednesday of Holy Week, sometimes called 'Spy Wednesday,' focuses on Judas's agreement to betray Jesus for thirty pieces of silver.",
        "The Gospel reading highlights the contrast between Judas's betrayal and the faithful love of others, particularly Mary of Bethany.",
        "This day invites us to reflect on the ways we might betray Christ through our choices and actions, and to seek reconciliation.",
        "The liturgy of Holy Wednesday marks the final day of preparation before the Easter Triduum begins with the Mass of the Lord's Supper on Holy Thursday evening.",
      ],
    },
    {
      id: "holy-thursday",
      name: "Holy Thursday (Mass of the Lord's Supper)",
      date: holyThursdayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Commemorates the institution of the Eucharist and the priesthood at the Last Supper.",
      description: [
        "Holy Thursday, also known as Maundy Thursday, commemorates the institution of the Eucharist and the priesthood at the Last Supper.",
        "The evening Mass of the Lord's Supper includes the washing of feet, recalling Jesus' example of humble service.",
        "After Mass, the Blessed Sacrament is transferred to an altar of repose, and the main altar is stripped bare.",
        "The faithful are encouraged to spend time in adoration, recalling Jesus' agony in the Garden of Gethsemane and his request to his disciples: 'Could you not watch with me one hour?'",
      ],
    },
    {
      id: "good-friday",
      name: "Good Friday of the Passion of the Lord",
      date: goodFridayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.RED,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Commemorates the crucifixion and death of Jesus Christ on the cross.",
      description: [
        "Good Friday commemorates the crucifixion and death of Jesus Christ on the cross for the salvation of the world.",
        "It is a day of fasting and abstinence.",
        "The liturgy includes the reading of the Passion according to John, the Solemn Intercessions for the needs of the Church and the world, the Veneration of the Cross, and Holy Communion from hosts consecrated on Holy Thursday.",
        "The starkness of the liturgy, with its bare altar and absence of music, reflects the solemnity of Christ's sacrifice and the Church's mourning.",
      ],
    },
    {
      id: "holy-saturday",
      name: "Holy Saturday (Easter Vigil)",
      date: holySaturdayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "A day of waiting that culminates in the Easter Vigil, the 'mother of all vigils.'",
      description: [
        "Holy Saturday is a day of waiting and preparation that culminates in the Easter Vigil, which St. Augustine called 'the mother of all vigils.'",
        "During the day, the Church waits at the Lord's tomb, meditating on his suffering and death.",
        "The Easter Vigil begins after nightfall with the Service of Light, including the blessing of the new fire and the Paschal candle.",
        "The Liturgy of the Word traces salvation history through multiple readings, and the Liturgy of Baptism welcomes new members into the Church.",
        "The celebration reaches its climax with the Liturgy of the Eucharist, as the Church rejoices in Christ's resurrection.",
      ],
    },
    {
      id: "easter",
      name: "Easter Sunday of the Resurrection of the Lord",
      date: easterDateString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Celebrates Christ's resurrection from the dead, the central feast of the Christian year.",
      description: [
        "Easter Sunday celebrates the resurrection of Jesus Christ from the dead, the central mystery of the Christian faith and the foundation of our hope.",
        "As St. Paul wrote, 'If Christ has not been raised, then our preaching is in vain and your faith is in vain' (1 Cor 15:14).",
        "The Easter season extends for 50 days, culminating in Pentecost.",
        "During this time, the Church rejoices in Christ's victory over sin and death, and in the new life offered to all who believe.",
        "The Paschal candle, symbol of the risen Christ, remains lit during all liturgical celebrations throughout the Easter season.",
      ],
    },
    {
      id: "easter-monday",
      name: "Easter Monday",
      date: easterMondayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The second day of the Easter Octave, continuing the celebration of Christ's resurrection.",
      description: [
        "Easter Monday is the second day of the Easter Octave, an eight-day celebration of Christ's resurrection that is considered one continuous day of rejoicing.",
        "The Gospel reading often focuses on the women's encounter with the risen Christ at the tomb and their mission to announce the resurrection to the disciples.",
        "Easter Monday continues the Church's joyful celebration of Christ's victory over death and sin.",
        "In many countries, Easter Monday is a public holiday, allowing the faithful to extend their Easter celebrations with family gatherings and traditional customs.",
      ],
    },
    {
      id: "easter-tuesday",
      name: "Easter Tuesday",
      date: easterTuesdayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The third day of the Easter Octave, celebrating Christ's resurrection and appearances.",
      description: [
        "Easter Tuesday is the third day of the Easter Octave, continuing the Church's celebration of Christ's resurrection.",
        "The Gospel reading often recounts one of Christ's appearances to his disciples after his resurrection, emphasizing the reality of his bodily resurrection and the transformation of the disciples' fear into joy.",
        "Easter Tuesday invites us to reflect on our own encounters with the risen Christ in prayer, the sacraments, and our daily lives.",
        "The liturgy continues to be marked by the joyful 'Alleluia' and the Gloria, which were absent during Lent.",
      ],
    },
    {
      id: "easter-wednesday",
      name: "Easter Wednesday",
      date: easterWednesdayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The fourth day of the Easter Octave, reflecting on Christ's presence among his disciples.",
      description: [
        "Easter Wednesday is the fourth day of the Easter Octave, continuing the Church's celebration of Christ's resurrection.",
        "The Gospel reading often focuses on the disciples' encounter with the risen Christ on the road to Emmaus, where they recognized him in the breaking of the bread.",
        "This narrative reminds us of Christ's presence in the Eucharist and in the community of believers.",
        "Easter Wednesday invites us to open our eyes to recognize Christ's presence in our lives and to share the good news of his resurrection with others, just as the disciples returned to Jerusalem to tell of their encounter.",
      ],
    },
    {
      id: "easter-thursday",
      name: "Easter Thursday",
      date: easterThursdayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The fifth day of the Easter Octave, celebrating Christ's appearances to his disciples.",
      description: [
        "Easter Thursday is the fifth day of the Easter Octave, continuing the Church's celebration of Christ's resurrection.",
        "The Gospel reading often recounts Christ's appearance to his disciples, his showing of his wounds, and his sharing of a meal with them, emphasizing the reality of his bodily resurrection.",
        "Easter Thursday invites us to reflect on the transformative power of Christ's resurrection in our lives and in the world.",
        "The liturgy continues to be marked by the joyful 'Alleluia' and the Gloria, as the Church celebrates Christ's victory over death.",
      ],
    },
    {
      id: "easter-friday",
      name: "Easter Friday",
      date: easterFridayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The sixth day of the Easter Octave, reflecting on the new life brought by Christ's resurrection.",
      description: [
        "Easter Friday is the sixth day of the Easter Octave, continuing the Church's celebration of Christ's resurrection.",
        "The Gospel reading often focuses on Christ's appearance to his disciples by the Sea of Tiberias and the miraculous catch of fish, symbolizing the Church's mission to be 'fishers of men.'",
        "Easter Friday invites us to reflect on our own call to participate in the Church's mission of evangelization, bringing the good news of Christ's resurrection to all people.",
        "The liturgy continues to be marked by the joyful 'Alleluia' and the Gloria, as the Church celebrates the new life brought by Christ's resurrection.",
      ],
    },
    {
      id: "easter-saturday",
      name: "Easter Saturday",
      date: easterSaturdayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "The seventh day of the Easter Octave, preparing for Divine Mercy Sunday.",
      description: [
        "Easter Saturday is the seventh day of the Easter Octave, continuing the Church's celebration of Christ's resurrection.",
        "The Gospel reading often focuses on Christ's commission to his disciples to go forth and proclaim the Gospel to all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Spirit.",
        "Easter Saturday invites us to reflect on our own baptismal call to be witnesses to Christ's resurrection in the world.",
        "As the Easter Octave draws to a close, the Church prepares to celebrate Divine Mercy Sunday, which emphasizes God's merciful love, particularly as revealed to St. Faustina Kowalska.",
      ],
    },
    {
      id: "divine-mercy",
      name: "Divine Mercy Sunday",
      date: divineMercyString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Celebrates God's merciful love, particularly as revealed to St. Faustina Kowalska.",
      description: [
        "Divine Mercy Sunday, the Second Sunday of Easter, celebrates God's merciful love as revealed to St. Faustina Kowalska in the 1930s.",
        "Jesus told St. Faustina that on this day, 'the very depths of My tender mercy are open,' and promised special graces to those who receive the Sacraments and venerate his Divine Mercy.",
        "Pope John Paul II, who canonized St. Faustina in 2000, established this feast for the universal Church.",
        "The day emphasizes trust in God's mercy, the need for conversion, and the call to practice mercy toward others through deed, word, and prayer.",
      ],
    },
    {
      id: "holy-family",
      name: "The Holy Family of Jesus, Mary, and Joseph",
      date: holyFamilyString,
      rank: CelebrationRank.FEAST,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Celebrates the model of family life provided by Jesus, Mary, and Joseph.",
      description: [
        "The Feast of the Holy Family celebrates the family unit of Jesus, Mary, and Joseph as a model for Christian families. This feast, celebrated on the Sunday within the Octave of Christmas (or on December 30 when no Sunday falls within the Octave), reminds us of the importance of family life and the virtues practiced by the Holy Family: love, obedience, faithfulness, and trust in God.",
        "The Holy Family faced many challenges, from the birth in a stable to the flight into Egypt to escape Herod's persecution, yet they remained united in their faith and love. This feast invites us to reflect on our own family relationships and to strengthen the bonds of love that unite us, following the example of Jesus, Mary, and Joseph.",
      ],
    },
    {
      id: "ascension",
      name: "The Ascension of the Lord",
      date: ascensionString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Commemorates Christ's ascension into heaven 40 days after his resurrection.",
      description: [
        "The Solemnity of the Ascension commemorates Christ's bodily ascension into heaven 40 days after his resurrection, as recounted in the Acts of the Apostles.",
        "This feast celebrates Christ's exaltation and his taking his place at the right hand of the Father.",
        "The Ascension marks the end of Jesus' earthly ministry and the beginning of the Church's mission.",
        "Before ascending, Jesus commissioned his disciples to 'go and make disciples of all nations,' promising to be with them always through the Holy Spirit, whom he would send at Pentecost.",
        "The Ascension gives us hope that where Christ has gone, we too may follow.",
      ],
    },
    {
      id: "pentecost",
      name: "Pentecost Sunday",
      date: pentecostString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.RED,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Celebrates the descent of the Holy Spirit upon the apostles and the birth of the Church.",
      description: [
        "Pentecost Sunday, celebrated 50 days after Easter, commemorates the descent of the Holy Spirit upon the apostles and the Blessed Virgin Mary in the form of tongues of fire, as described in the Acts of the Apostles.",
        "This event, which fulfilled Christ's promise to send the Advocate, marks the birth of the Church and the beginning of its mission to the world.",
        "The apostles, filled with the Holy Spirit, began to speak in different languages, symbolizing the universal nature of the Church.",
        "Pentecost concludes the Easter season and celebrates the ongoing presence and work of the Holy Spirit in the Church and in the lives of believers.",
      ],
    },
    {
      id: "mary-mother-church",
      name: "Mary, Mother of the Church",
      date: maryMotherChurchString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Celebrates Mary as the Mother of the Church.",
      description: [
        "Mary, Mother of the Church, celebrated on the Monday after Pentecost, commemorates Mary as the Mother of the Church.",
        "This feast celebrates Mary's role as the Mother of the Church and her role in the salvation of humanity.",
        "Mary's role as the Mother of the Church is a reflection of her role as the Mother of Christ and the Mother of the faithful.",
        "This feast, established in 2018 by Pope Francis, invites us to reflect on Mary's role as the Mother of the Church and to pray for her intercession.",
      ],
    },
    {
      id: "trinity",
      name: "The Most Holy Trinity",
      date: trinitySundayString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Celebrates the central mystery of Christian faith and life: one God in three Persons.",
      description: [
        "The Solemnity of the Most Holy Trinity celebrates the central mystery of Christian faith and life: one God in three Persons—Father, Son, and Holy Spirit.",
        "This feast, observed on the Sunday after Pentecost, invites us to contemplate the inner life of God—a communion of persons in a relationship of love.",
        "The doctrine of the Trinity, while beyond full human comprehension, reveals that God is not solitary but a community of love, into which we are invited through baptism.",
        "The Trinity is the model for all human relationships and communities, called to reflect the divine unity in diversity.",
      ],
    },
    {
      id: "corpus-christi",
      name: "The Most Holy Body and Blood of Christ (Corpus Christi)",
      date: corpusChristiString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Honors the Real Presence of Christ in the Eucharist.",
      description: [
        "The Solemnity of the Most Holy Body and Blood of Christ, commonly known as Corpus Christi, honors the Real Presence of Christ in the Eucharist—body, blood, soul, and divinity.",
        "This feast, established in the 13th century through the visions of St. Juliana of Liège, provides an opportunity for public witness to the Church's faith in the Eucharist, often through processions with the Blessed Sacrament.",
        "Corpus Christi reminds us that the Eucharist is the 'source and summit of the Christian life,' nourishing us spiritually and uniting us more deeply with Christ and with one another as members of his Body.",
      ],
    },
    {
      id: "sacred-heart",
      name: "The Most Sacred Heart of Jesus",
      date: sacredHeartString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Honors the heart of Jesus as the symbol of his redemptive love for humanity.",
      description: [
        "The Solemnity of the Most Sacred Heart of Jesus, celebrated on the Friday after the Solemnity of Corpus Christi, honors the heart of Jesus as the symbol of his redemptive love for humanity.",
        "This devotion, which grew out of medieval mysticism and was promoted through the visions of St. Margaret Mary Alacoque in the 17th century, emphasizes God's compassionate love and mercy.",
        "The Sacred Heart, pierced on the cross and burning with love, invites us to return love for love and to make reparation for sin.",
        "This feast reminds us that the entire Christian life is a response to God's love, revealed most fully in the person of Jesus Christ.",
      ],
    },
    {
      id: "christ-the-king",
      name: "Our Lord Jesus Christ, King of the Universe",
      date: christTheKingString,
      rank: CelebrationRank.SOLEMNITY,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "Celebrates Christ's sovereignty over all creation and marks the end of the liturgical year.",
      description: [
        "The Solemnity of Our Lord Jesus Christ, King of the Universe, celebrates Christ's sovereignty over all creation and marks the end of the liturgical year.",
        "Established by Pope Pius XI in 1925 in response to growing secularism and nationalism, this feast reminds us that while governments and ideologies come and go, Christ's reign is eternal.",
        "His kingdom, though not of this world, is present in the Church and will reach its fullness at the end of time.",
        "This feast challenges us to recognize Christ's kingship in our lives, to submit to his gentle rule of love and service, and to work for the coming of God's kingdom by promoting justice, peace, and respect for the dignity of all people.",
      ],
    },
    {
      id: "gaudete-sunday",
      name: "Gaudete Sunday",
      date: gaudeteString,
      rank: CelebrationRank.FEAST,
      color: LiturgicalColor.ROSE,
      proper: "Proper of Time",
      type: "universal",
      short_desc: "A day of rejoicing in the middle of Advent, marked by rose vestments.",
      description: [
        "Gaudete Sunday, the Third Sunday of Advent, is a day of rejoicing in the midst of the penitential season.",
        "The name comes from the first word of the entrance antiphon, 'Gaudete' (Rejoice).",
        "On this day, rose vestments may be worn instead of violet, flowers may adorn the altar, and the organ may be played more fully, all signs of the approaching joy of Christmas.",
        "Gaudete Sunday reminds us that even as we prepare with penance and reflection, we do so with the joyful anticipation of the Lord's coming.",
        "It marks a shift in Advent from a focus on the Second Coming of Christ to a focus on celebrating his First Coming at Christmas.",
      ],
    },
  ]
}

// Make sure to export the function explicitly

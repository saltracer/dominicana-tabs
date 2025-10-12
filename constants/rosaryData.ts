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
        meditation: 'Mary\'s "yes" to God changed the world. The angel Gabriel announces to Mary that she will conceive and bear the Son of God. With perfect faith and humility, Mary accepts God\'s will, saying "Behold, I am the handmaid of the Lord. Let it be done to me according to your word." Consider how Mary\'s trust in God\'s plan brought salvation to the world.',
        audio_text: 'The First Joyful Mystery: -- The Annunciation. -- We meditate on how the angel Gabriel was sent by God to announce to Mary that she would conceive and bear the Son of God. With perfect faith and humility, Mary accepts God\'s will, saying, "Behold, I am the handmaid of the Lord. Let it be done to me according to your word." Mary\'s yes to God changed the world and brought salvation to humanity. As we pray this decade, let us consider how Mary\'s trust in God\'s plan can inspire our own surrender to His will.',
        shortMeditation: 'The angel Gabriel announces to Mary that she will conceive and bear the Son of God.',
        shortAudio_text: 'The First Joyful Mystery: -- The Annunciation. -- The angel Gabriel announces to Mary that she will conceive and bear the Son of God.'
      },
      {
        name: 'The Visitation',
        bibleReference: 'Luke 1:39-56',
        meditation: 'Mary visits her cousin Elizabeth, who is also with child. When Mary greets her, the infant John the Baptist leaps for joy in Elizabeth\'s womb, recognizing the presence of the Lord. Elizabeth proclaims Mary "blessed among women," and Mary responds with the Magnificat, praising God for His mercy. Consider how we too can bring Christ to others through our words and actions.',
        audio_text: 'The Second Joyful Mystery: -- The Visitation. -- We meditate on Mary\'s journey to visit her cousin Elizabeth, who is also with child. When Mary greets Elizabeth, the infant John the Baptist leaps for joy in his mother\'s womb, recognizing the presence of the Lord. Elizabeth exclaims, "Blessed are you among women, and blessed is the fruit of your womb!" Mary responds with the Magnificat, praising God for His mercy and faithfulness. As we pray this decade, let us consider how we too can bring Christ to others through our words, our actions, and our presence.',
        shortMeditation: 'Mary visits her cousin Elizabeth, and John the Baptist leaps for joy in the womb.',
        shortAudio_text: 'The Second Joyful Mystery: -- The Visitation. -- Mary visits her cousin Elizabeth, and John the Baptist leaps for joy in the womb.'
      },
      {
        name: 'The Nativity',
        bibleReference: 'Luke 2:1-20',
        meditation: 'In a humble stable in Bethlehem, the Son of God is born into the world. Angels announce the good news to shepherds, who come to adore the newborn King. The Word becomes flesh and dwells among us. Consider the humility of God, who chose to be born in poverty to show us that true wealth is found in love and service.',
        audio_text: 'The Third Joyful Mystery: -- The Nativity of Our Lord. -- We meditate on the birth of Jesus in a humble stable in Bethlehem. The Son of God enters the world in poverty and simplicity. Angels announce the good news to shepherds in the fields, singing "Glory to God in the highest!" The shepherds come to adore the newborn King. The Word becomes flesh and dwells among us. As we pray this decade, let us consider the profound humility of God, who chose to be born in poverty to show us that true wealth is found in love and service.',
        shortMeditation: 'Jesus is born in a humble stable in Bethlehem.',
        shortAudio_text: 'The Third Joyful Mystery: -- The Nativity. -- Jesus is born in a humble stable in Bethlehem.'
      },
      {
        name: 'The Presentation',
        bibleReference: 'Luke 2:22-38',
        meditation: 'Mary and Joseph present Jesus in the Temple according to the Law of Moses. The holy man Simeon recognizes Jesus as the Messiah and prophesies that Mary\'s heart will be pierced. The prophetess Anna also gives thanks for the child. Consider how we too are called to present ourselves to God in service and dedication.',
        audio_text: 'The Fourth Joyful Mystery: -- The Presentation of Jesus in the Temple. -- We meditate on how Mary and Joseph bring the infant Jesus to the Temple in Jerusalem to present Him to the Lord, according to the Law of Moses. The holy man Simeon takes the child in his arms and recognizes Him as the promised Messiah, saying, "Now, Lord, you may let your servant go in peace, for my eyes have seen your salvation." Simeon also prophesies to Mary that a sword will pierce her own heart. The prophetess Anna gives thanks to God for the child. As we pray this decade, let us consider how we too are called to present ourselves to God in service and dedication.',
        shortMeditation: 'Mary and Joseph present Jesus in the Temple, where Simeon recognizes Him as the Messiah.',
        shortAudio_text: 'The Fourth Joyful Mystery: -- The Presentation. -- Mary and Joseph present Jesus in the Temple, where Simeon recognizes Him as the Messiah.'
      },
      {
        name: 'The Finding in the Temple',
        bibleReference: 'Luke 2:41-52',
        meditation: 'After three days of anxious searching, Mary and Joseph find the twelve-year-old Jesus in the Temple, discussing the Law with the teachers. Jesus says, "Did you not know I must be in my Father\'s house?" Consider how Jesus shows us that seeking God must be our first priority, even as we fulfill our earthly duties.',
        audio_text: 'The Fifth Joyful Mystery: -- The Finding of Jesus in the Temple. -- We meditate on the Holy Family\'s pilgrimage to Jerusalem for the feast of Passover. When they begin the journey home, Mary and Joseph realize that the twelve-year-old Jesus is not with them. After three days of anxious searching, they find Him in the Temple, sitting among the teachers, listening to them and asking them questions. All who heard Him were amazed at His understanding. When Mary asks why He has done this, Jesus replies, "Did you not know I must be in my Father\'s house?" As we pray this decade, let us consider how Jesus shows us that seeking God must be our first priority, even as we fulfill our earthly duties.',
        shortMeditation: 'Mary and Joseph find the twelve-year-old Jesus teaching in the Temple.',
        shortAudio_text: 'The Fifth Joyful Mystery: -- The Finding in the Temple. -- Mary and Joseph find the twelve-year-old Jesus teaching in the Temple.'
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
        meditation: 'In the Garden of Gethsemane, Jesus prays in anguish, knowing the suffering that awaits Him. He asks the Father, "If you are willing, take this cup away from me; still, not my will but yours be done." His sweat becomes like drops of blood. Consider how Jesus teaches us to accept God\'s will, even in our darkest moments of fear and suffering.',
        audio_text: 'The First Sorrowful Mystery: -- The Agony in the Garden. -- We meditate on Jesus in the Garden of Gethsemane, praying in anguish as He contemplates the suffering that awaits Him. He takes Peter, James, and John with Him, and says to them, "My soul is sorrowful even to death." He prays to the Father, "If you are willing, take this cup away from me; still, not my will but yours be done." His agony is so great that His sweat becomes like drops of blood falling to the ground. An angel appears to strengthen Him. As we pray this decade, let us consider how Jesus teaches us to accept God\'s will, even in our darkest moments of fear and suffering.',
        shortMeditation: 'Jesus prays in agony in the Garden of Gethsemane.',
        shortAudio_text: 'The First Sorrowful Mystery: -- The Agony in the Garden. -- Jesus prays in agony in the Garden of Gethsemane.'
      },
      {
        name: 'The Scourging at the Pillar',
        bibleReference: 'John 19:1',
        meditation: 'Pilate orders Jesus to be scourged, a brutal punishment that tears the flesh from His body. Jesus endures this agony in silence, bearing the punishment for our sins. Consider how Jesus suffers for us, taking upon Himself the consequences of all human sin. His wounds heal our spiritual wounds.',
        audio_text: 'The Second Sorrowful Mystery: -- The Scourging at the Pillar. -- We meditate on how Pilate, seeking to appease the crowd, orders Jesus to be scourged. This brutal Roman punishment tears the flesh from His body with whips of leather embedded with bone and metal. Jesus, the innocent Lamb of God, endures this agony in silence, bearing the punishment that we deserve for our sins. The prophet Isaiah foretold, "By His wounds we are healed." As we pray this decade, let us consider how Jesus suffers for us, taking upon Himself the consequences of all human sin, so that His wounds might heal our spiritual wounds.',
        shortMeditation: 'Jesus is scourged at the pillar.',
        shortAudio_text: 'The Second Sorrowful Mystery: -- The Scourging at the Pillar. -- Jesus is scourged at the pillar.'
      },
      {
        name: 'The Crowning with Thorns',
        bibleReference: 'Matthew 27:27-31',
        meditation: 'Roman soldiers mock Jesus, placing a crown of thorns on His head and a reed in His hand, kneeling before Him in false homage. They spit on Him and strike Him. The King of Kings is ridiculed and humiliated. Consider how Jesus endures mockery and contempt for our sake, teaching us humility and patience in suffering.',
        audio_text: 'The Third Sorrowful Mystery: -- The Crowning with Thorns. -- We meditate on how the Roman soldiers gather around Jesus to mock Him. They strip Him and place a scarlet robe on Him. They weave a crown of thorns and press it onto His head, causing the sharp thorns to pierce His sacred brow. They place a reed in His right hand as a mock scepter, and kneel before Him in false homage, saying, "Hail, King of the Jews!" They spit on Him and strike Him repeatedly. The King of Kings is ridiculed and humiliated. As we pray this decade, let us consider how Jesus endures mockery and contempt for our sake, teaching us humility and patience in suffering.',
        shortMeditation: 'Jesus is crowned with thorns and mocked by soldiers.',
        shortAudio_text: 'The Third Sorrowful Mystery: -- The Crowning with Thorns. -- Jesus is crowned with thorns and mocked by soldiers.'
      },
      {
        name: 'The Carrying of the Cross',
        bibleReference: 'Luke 23:26-32',
        meditation: 'Jesus carries His cross through the streets of Jerusalem to Calvary. Weakened by torture and loss of blood, He falls repeatedly under its weight. Simon of Cyrene is compelled to help Him. Women weep for Him along the way. Consider how we too must carry our daily crosses, following in the footsteps of Christ.',
        audio_text: 'The Fourth Sorrowful Mystery: -- The Carrying of the Cross. -- We meditate on Jesus carrying His cross through the streets of Jerusalem to Calvary, the place of execution. Already weakened by torture and loss of blood, He struggles under the weight of the heavy wooden beam. He falls repeatedly, but each time, He rises and continues. The soldiers compel Simon of Cyrene to help Him carry the cross. Along the way, a group of women weep for Him, and Jesus turns to them with compassion. As we pray this decade, let us consider how we too must carry our daily crosses, following in the footsteps of Christ, and how His strength sustains us in our own sufferings.',
        shortMeditation: 'Jesus carries His cross to Calvary.',
        shortAudio_text: 'The Fourth Sorrowful Mystery: -- The Carrying of the Cross. -- Jesus carries His cross to Calvary.'
      },
      {
        name: 'The Crucifixion',
        bibleReference: 'Luke 23:33-46',
        meditation: 'Jesus is nailed to the cross between two criminals. He forgives those who crucified Him, promising paradise to the repentant thief, and entrusts His mother to John\'s care. After three hours of agony, Jesus cries out, "Father, into your hands I commend my spirit," and dies. Consider the infinite love that led Jesus to give His life for our salvation.',
        audio_text: 'The Fifth Sorrowful Mystery: -- The Crucifixion and Death of Our Lord. -- We meditate on Jesus being nailed to the cross at Calvary, between two criminals. Even in His agony, Jesus speaks words of forgiveness: "Father, forgive them, for they know not what they do." He promises paradise to the repentant thief who asks to be remembered in His kingdom. He entrusts His mother Mary to the care of John the beloved disciple. After three hours of terrible suffering, darkness covers the land. Jesus cries out with a loud voice, "Father, into your hands I commend my spirit," and breathes His last. As we pray this decade, let us consider the infinite love that led Jesus to give His life for our salvation.',
        shortMeditation: 'Jesus is crucified and dies on the cross.',
        shortAudio_text: 'The Fifth Sorrowful Mystery: -- The Crucifixion. -- Jesus is crucified and dies on the cross.'
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
        meditation: 'On the third day, Jesus rises from the dead, conquering sin and death. Angels announce to the women at the tomb, "He is not here; He has been raised!" Jesus appears to Mary Magdalene and the disciples. Consider how Christ\'s resurrection is the foundation of our faith and our hope for eternal life.',
        audio_text: 'The First Glorious Mystery: -- The Resurrection of Our Lord. -- We meditate on the triumph of Jesus over death. On the third day after His crucifixion, Jesus rises from the dead, conquering sin and death forever. Early in the morning, holy women come to the tomb and find the stone rolled away. Angels appear to them, announcing, "He is not here; He has been raised, just as He said!" Jesus first appears to Mary Magdalene, then to the other disciples. His resurrection is the source of our joy and the foundation of our Christian faith. As we pray this decade, let us consider how Christ\'s resurrection is the foundation of our faith and our hope for eternal life.',
        shortMeditation: 'Jesus rises from the dead on the third day.',
        shortAudio_text: 'The First Glorious Mystery: -- The Resurrection. -- Jesus rises from the dead on the third day.'
      },
      {
        name: 'The Ascension',
        bibleReference: 'Acts 1:6-11',
        meditation: 'Forty days after His resurrection, Jesus leads His disciples to the Mount of Olives. He promises to send the Holy Spirit and commissions them to preach the Gospel to all nations. Then He ascends into heaven and is seated at the right hand of the Father. Consider how Jesus has gone to prepare a place for us in His Father\'s house.',
        audio_text: 'The Second Glorious Mystery: -- The Ascension of Our Lord into Heaven. -- We meditate on how, forty days after His resurrection, Jesus leads His disciples to the Mount of Olives near Bethany. He promises to send them the Holy Spirit, saying, "You will receive power when the Holy Spirit comes upon you, and you will be my witnesses to the ends of the earth." He commissions them to preach the Gospel to all nations, baptizing in the name of the Father, and of the Son, and of the Holy Spirit. Then, as they watch, Jesus is lifted up, and a cloud takes Him from their sight. He ascends into heaven and is seated in glory at the right hand of the Father. As we pray this decade, let us consider how Jesus has gone to prepare a place for us in His Father\'s house.',
        shortMeditation: 'Jesus ascends into heaven.',
        shortAudio_text: 'The Second Glorious Mystery: -- The Ascension. -- Jesus ascends into heaven.'
      },
      {
        name: 'The Descent of the Holy Spirit',
        bibleReference: 'Acts 2:1-13',
        meditation: 'On Pentecost, the disciples are gathered in prayer with Mary when suddenly a mighty wind fills the house. Tongues of fire rest upon each of them, and they are filled with the Holy Spirit. They begin to speak in different languages and boldly proclaim the Gospel. Consider how the Holy Spirit empowers us for mission and sanctifies us with divine gifts.',
        audio_text: 'The Third Glorious Mystery: -- The Descent of the Holy Spirit upon the Apostles. -- We meditate on the feast of Pentecost, when the disciples are gathered together in prayer with Mary, the Mother of Jesus. Suddenly, there comes from heaven a sound like a mighty rushing wind, and it fills the entire house where they are sitting. Tongues of fire appear and rest upon each of them. They are all filled with the Holy Spirit and begin to speak in different languages, proclaiming the mighty works of God. Peter boldly preaches to the crowds, and about three thousand people are baptized that day. The Church is born. As we pray this decade, let us consider how the Holy Spirit continues to empower us for mission and sanctify us with divine gifts.',
        shortMeditation: 'The Holy Spirit descends upon the Apostles at Pentecost.',
        shortAudio_text: 'The Third Glorious Mystery: -- The Descent of the Holy Spirit. -- The Holy Spirit descends upon the Apostles at Pentecost.'
      },
      {
        name: 'The Assumption',
        bibleReference: 'Revelation 12:1',
        meditation: 'At the end of her earthly life, Mary is assumed body and soul into heaven. Having been preserved from sin, she does not experience the corruption of the grave. The Church recognizes this as a foretaste of the resurrection that awaits all the faithful. Consider how Mary is our hope and model, showing us the glory that God has prepared for those who love Him.',
        audio_text: 'The Fourth Glorious Mystery: -- The Assumption of Mary into Heaven. -- We meditate on the end of Mary\'s earthly life. Having been preserved from all sin by a singular grace of God, the Blessed Virgin Mary is assumed body and soul into heaven. She does not experience the corruption of the grave, but is taken up to share in her Son\'s glory. The early Church recognized and celebrated this great mystery, seeing in Mary\'s assumption a foretaste of the resurrection that awaits all the faithful. She who carried the Author of Life in her womb now enters fully into eternal life. As we pray this decade, let us consider how Mary is our hope and model, showing us the glory that God has prepared for those who love Him.',
        shortMeditation: 'Mary is assumed body and soul into heaven.',
        shortAudio_text: 'The Fourth Glorious Mystery: -- The Assumption. -- Mary is assumed body and soul into heaven.'
      },
      {
        name: 'The Coronation of Mary',
        bibleReference: 'Revelation 12:1',
        meditation: 'Mary is crowned as Queen of Heaven and Earth, sharing in the glory of her Son\'s kingdom. She is the Mother of the Church, the refuge of sinners, and the advocate for all who seek her intercession. Consider how Mary reigns as our spiritual mother, always ready to bring our prayers to her Son and to lead us closer to God.',
        audio_text: 'The Fifth Glorious Mystery: --The Coronation of Mary as Queen of Heaven and Earth. -- We meditate on the final glory of the Blessed Virgin Mary. Having been assumed into heaven, Mary is crowned by her divine Son as Queen of Heaven and Earth. She shares in the glory of Christ\'s kingdom, reigning with Him in majesty. She is the Mother of the Church, the refuge of sinners, and the advocate for all who seek her intercession. The Book of Revelation describes this vision: "A great sign appeared in heaven: a woman clothed with the sun, with the moon under her feet, and on her head a crown of twelve stars." As we pray this decade, let us consider how Mary reigns as our spiritual mother, always ready to bring our prayers to her Son and to lead us closer to God.',
        shortMeditation: 'Mary is crowned as Queen of Heaven and Earth.',
        shortAudio_text: 'The Fifth Glorious Mystery: -- The Coronation. -- Mary is crowned as Queen of Heaven and Earth.'
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
        meditation: 'Jesus comes to John the Baptist at the Jordan River to be baptized. Though sinless, He humbly submits to baptism to fulfill all righteousness. When He emerges from the water, the heavens open, the Holy Spirit descends like a dove, and the Father\'s voice proclaims, "This is my beloved Son, with whom I am well pleased." Consider how our own baptism makes us children of God.',
        audio_text: 'The First Luminous Mystery: -- The Baptism of Jesus in the Jordan River. -- We meditate on Jesus coming to John the Baptist at the Jordan River to be baptized. Though He is without sin, Jesus humbly submits to baptism to fulfill all righteousness and to sanctify the waters for our own baptism. When He emerges from the water, the heavens are opened, and the Holy Spirit descends upon Him like a dove. The voice of the Father is heard, proclaiming, "This is my beloved Son, with whom I am well pleased." In this moment, the Holy Trinity is revealed. As we pray this decade, let us consider how our own baptism makes us children of God and members of His holy Church.',
        shortMeditation: 'Jesus is baptized in the Jordan River.',
        shortAudio_text: 'The First Luminous Mystery: -- The Baptism of Jesus. -- Jesus is baptized in the Jordan River.'
      },
      {
        name: 'The Wedding at Cana',
        bibleReference: 'John 2:1-11',
        meditation: 'At a wedding feast in Cana, Mary notices that the wine has run out. She tells Jesus, and then instructs the servants, "Do whatever he tells you." Jesus transforms water into wine, performing His first miracle. Consider how Mary\'s intercession moves Jesus to act, and how she continues to bring our needs to her Son.',
        audio_text: 'The Second Luminous Mystery: -- The Wedding Feast at Cana. -- We meditate on Jesus attending a wedding celebration in Cana of Galilee with His mother Mary and His disciples. During the feast, the wine runs out, and Mary notices this need. She approaches Jesus and simply says, "They have no wine." Then she instructs the servants, "Do whatever he tells you." Jesus orders the servants to fill six stone jars with water, then draw some out and take it to the chief steward. The water has been transformed into the finest wine. This is the first of Jesus\' signs, and it reveals His glory. As we pray this decade, let us consider how Mary\'s intercession moves Jesus to act, and how she continues to bring our needs to her Son.',
        shortMeditation: 'Jesus performs His first miracle at the wedding feast of Cana.',
        shortAudio_text: 'The Second Luminous Mystery: -- The Wedding at Cana. -- Jesus performs His first miracle at the wedding feast of Cana.'
      },
      {
        name: 'The Proclamation of the Kingdom',
        bibleReference: 'Mark 1:14-15',
        meditation: 'Jesus begins His public ministry, proclaiming, "The kingdom of God is at hand. Repent, and believe in the gospel." He teaches with authority, heals the sick, casts out demons, and calls sinners to conversion. Consider how we are called to repent, believe, and share the Good News with others.',
        audio_text: 'The Third Luminous Mystery: -- The Proclamation of the Kingdom of God. -- We meditate on Jesus beginning His public ministry in Galilee. He proclaims the Good News, saying, "The kingdom of God is at hand. Repent, and believe in the gospel!" Jesus teaches with divine authority, speaking in parables and revealing the mysteries of God\'s kingdom. He heals the sick, gives sight to the blind, makes the lame walk, and casts out demons. He calls sinners to conversion and offers forgiveness to all who turn to Him with repentant hearts. He gathers disciples and sends them out to continue His mission. As we pray this decade, let us consider how we too are called to repent, believe, and share the Good News of salvation with others.',
        shortMeditation: 'Jesus proclaims the Kingdom of God and calls sinners to repentance.',
        shortAudio_text: 'The Third Luminous Mystery: -- The Proclamation of the Kingdom. -- Jesus proclaims the Kingdom of God and calls sinners to repentance.'
      },
      {
        name: 'The Transfiguration',
        bibleReference: 'Matthew 17:1-8',
        meditation: 'Jesus takes Peter, James, and John up a high mountain, where He is transfigured before them. His face shines like the sun and His clothes become white as light. Moses and Elijah appear with Him, and the Father\'s voice says, "This is my beloved Son. Listen to him." Consider how this glimpse of divine glory strengthened the disciples for the trials ahead.',
        audio_text: 'The Fourth Luminous Mystery: -- The Transfiguration of Our Lord. -- We meditate on Jesus taking Peter, James, and John up a high mountain to pray. As Jesus prays, He is transfigured before them. His face shines like the sun, and His clothes become dazzling white, whiter than any earthly bleach could make them. Moses and Elijah appear, speaking with Jesus about His coming passion and death in Jerusalem. Peter exclaims, "Lord, it is good for us to be here!" Then a bright cloud overshadows them, and the voice of the Father says, "This is my beloved Son, with whom I am well pleased. Listen to him." As we pray this decade, let us consider how this glimpse of divine glory strengthened the disciples for the trials ahead, and how it strengthens our own faith.',
        shortMeditation: 'Jesus is transfigured before Peter, James, and John.',
        shortAudio_text: 'The Fourth Luminous Mystery: -- The Transfiguration. -- Jesus is transfigured before Peter, James, and John.'
      },
      {
        name: 'The Institution of the Eucharist',
        bibleReference: 'Matthew 26:26-28',
        meditation: 'At the Last Supper, Jesus takes bread and wine and transforms them into His Body and Blood. He gives them to His disciples, saying, "Take and eat... Take and drink... Do this in memory of me." He institutes the priesthood and the sacrifice of the Mass. Consider the infinite love that led Jesus to give us Himself in this most holy sacrament.',
        audio_text: 'The Fifth Luminous Mystery: -- The Institution of the Holy Eucharist. -- We meditate on the Last Supper, when Jesus gathers with His apostles in the upper room on the night before He dies. During the Passover meal, Jesus takes bread, blesses it, breaks it, and gives it to His disciples, saying, "Take and eat; this is my body." Then He takes the cup of wine, gives thanks, and offers it to them, saying, "Drink from it, all of you, for this is my blood of the covenant, which will be shed for many for the forgiveness of sins." He commands them, "Do this in memory of me," thus instituting both the priesthood and the sacrifice of the Mass. As we pray this decade, let us consider the infinite love that led Jesus to give us Himself in this most holy sacrament, which continues to nourish us on our journey to eternal life.',
        shortMeditation: 'Jesus institutes the Holy Eucharist at the Last Supper.',
        shortAudio_text: 'The Fifth Luminous Mystery: -- The Institution of the Eucharist. -- Jesus institutes the Holy Eucharist at the Last Supper.'
      }
    ]
  }
];

/**
 * Prayer texts for display and audio generation
 * 
 * Each prayer has two versions:
 * - Standard version: For display in the app, may include formatting like "V." and "R." and newlines
 * - _audio_text version: For audio generation, with:
 *   - No abbreviations (V. and R. removed)
 *   - Newlines (\n) replaced with ellipses (...)
 *   - Optimized for natural speech synthesis
 */
export const PRAYER_TEXTS = {
  signOfCross: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
  signOfCross_audio_text: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
  
  apostlesCreed: 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
  apostlesCreed_audio_text: 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
  
  ourFather: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  ourFather_audio_text: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  
  hailMary: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  hailMary_audio_text: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  
  gloryBe: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',
  gloryBe_audio_text: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',
  
  fatimaPrayer: 'O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to heaven, especially those in most need of thy mercy. Amen.',
  fatimaPrayer_audio_text: 'O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to heaven, especially those in most need of thy mercy. Amen.',
  
  dominicanOpening1: 'V. Hail Mary, full of grace, the Lord is with thee.\n\nR. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.',
  dominicanOpening1_audio_text: 'Hail Mary, full of grace, the Lord is with thee. -- -- -- -- Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.',
  
  dominicanOpening2: 'V. O Lord, open my lips.\n\nR. And my mouth will proclaim your praise.',
  dominicanOpening2_audio_text: 'O Lord, open my lips. -- -- -- -- And my mouth will proclaim your praise.',
  
  dominicanOpening3: 'V. O God, come to my assistance.\n\nR. O Lord, make haste to help me.',
  dominicanOpening3_audio_text: 'O God, come to my assistance. -- --- -- O Lord, make haste to help me.',

  dominicanOpeningGloryBe: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.',
  dominicanOpeningGloryBe_audio_text: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.',

  dominicanGloryBe: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.',
  dominicanGloryBe_audio_text: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.',
  
  alleluia: 'Alleluia',
  alleluia_audio_text: 'Alleluia.',
  
  hailMaryFaith: 'Hail Mary (for the virtue of Faith)',
  hailMaryHope: 'Hail Mary (for the virtue of Hope)',
  hailMaryCharity: 'Hail Mary (for the virtue of Charity)',
  
  finalPrayer: 'Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\n\nV. Pray for us, O Holy Mother of God.\n\nR. That we may be made worthy of the promises of Christ.\n\nO God, whose only-begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ Our Lord. Amen.',
  finalPrayer_audio_text: 'Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary... Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ... O God, whose only-begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ Our Lord. Amen.'
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


// Currículo do teste de nivelamento.
// Cada nível tem tópicos em ordem de aprendizado. Cada tópico tem 3 questões.
// Convenção: a opção correta é SEMPRE a primeira do array (índice 0).
// As opções são embaralhadas na hora de mostrar, então a aluna não vê esse padrão.

const defaultInstruction = 'Escolha a opção que completa a frase.'
const vocabInstruction = 'Escolha a palavra ou expressão certa.'
const readingInstruction = 'Leia o texto e responda.'

export const levels = [
  {
    id: 'A1',
    name: 'A1 — Iniciante',
    topics: [
      {
        id: 'a1-be',
        name: 'Verb to be (am / is / are)',
        questions: [
          { id: 'a1-be-1', prompt: 'She ___ a teacher.', options: ['is', 'are', 'am', 'be'] },
          { id: 'a1-be-2', prompt: '___ you from Brazil?', options: ['Are', 'Is', 'Do', 'Am'] },
          { id: 'a1-be-3', prompt: "My parents ___ at home right now. They're at work.", options: ["aren't", "isn't", "don't", 'not'] },
        ],
      },
      {
        id: 'a1-pronouns',
        name: 'Pronomes e possessivos (I, my, his, our…)',
        questions: [
          { id: 'a1-pronouns-1', prompt: 'This is my brother. ___ name is Pedro.', options: ['His', 'He', 'Her', 'Him'] },
          { id: 'a1-pronouns-2', prompt: 'We love ___ new apartment.', options: ['our', 'us', 'we', 'ours'] },
          { id: 'a1-pronouns-3', prompt: 'Maria and I are friends. ___ work together.', options: ['We', 'Us', 'They', 'Our'] },
        ],
      },
      {
        id: 'a1-present-simple',
        name: 'Present simple (do / does)',
        questions: [
          { id: 'a1-present-simple-1', prompt: 'He ___ coffee every morning.', options: ['drinks', 'drink', 'drinking', 'is drink'] },
          { id: 'a1-present-simple-2', prompt: '___ she work on Saturdays?', options: ['Does', 'Do', 'Is', 'Are'] },
          { id: 'a1-present-simple-3', prompt: 'I ___ like horror movies.', options: ["don't", "doesn't", 'not', 'am not'] },
        ],
      },
      {
        id: 'a1-there-is',
        name: 'There is / there are + a, an, some, any',
        questions: [
          { id: 'a1-there-is-1', prompt: 'There ___ two banks on my street.', options: ['are', 'is', 'have', 'be'] },
          { id: 'a1-there-is-2', prompt: 'Is there ___ milk in the fridge?', options: ['any', 'a', 'an', 'many'] },
          { id: 'a1-there-is-3', prompt: "There's ___ apple on the table.", options: ['an', 'a', 'some', 'any'] },
        ],
      },
      {
        id: 'a1-can',
        name: "Can / can't (habilidade)",
        questions: [
          { id: 'a1-can-1', prompt: "I ___ swim, but I can't dance.", options: ['can', 'cans', 'can to', 'am can'] },
          { id: 'a1-can-2', prompt: '___ you speak Spanish?', options: ['Can', 'Do can', 'Are', 'Does'] },
          { id: 'a1-can-3', prompt: 'She can ___ the guitar very well.', options: ['play', 'plays', 'playing', 'to play'] },
        ],
      },
      {
        id: 'a1-prepositions',
        name: 'Preposições de tempo (in / on / at)',
        questions: [
          { id: 'a1-prepositions-1', prompt: 'My birthday is ___ May.', options: ['in', 'on', 'at', 'to'] },
          { id: 'a1-prepositions-2', prompt: 'The meeting is ___ Monday.', options: ['on', 'in', 'at', 'to'] },
          { id: 'a1-prepositions-3', prompt: "See you ___ 7 o'clock.", options: ['at', 'in', 'on', 'to'] },
        ],
      },
      {
        id: 'a1-vocab',
        name: 'Vocabulário do dia a dia (família, dias, ações)',
        instruction: vocabInstruction,
        questions: [
          { id: 'a1-vocab-1', prompt: "My mother's sister is my ___.", options: ['aunt', 'uncle', 'cousin', 'niece'] },
          { id: 'a1-vocab-2', prompt: 'The day after Monday is ___.', options: ['Tuesday', 'Thursday', 'Sunday', 'Wednesday'] },
          { id: 'a1-vocab-3', prompt: "I'm hungry. Let's ___ something.", options: ['eat', 'drink', 'sleep', 'wear'] },
        ],
      },
      {
        id: 'a1-reading',
        name: 'Leitura A1 (texto curto sobre rotina)',
        kind: 'reading',
        instruction: readingInstruction,
        passage:
          "Hi! My name is Lucas. I am 28 years old and I live in Curitiba with my wife, Ana, and our dog, Bolt. I work in a bank from Monday to Friday. On weekends, I like to cook and watch movies. Ana is a nurse. She works at night, so we have breakfast together every morning when she gets home.",
        questions: [
          { id: 'a1-reading-1', prompt: 'Where does Lucas work?', options: ['In a bank', 'In a hospital', 'At home', 'In a restaurant'] },
          { id: 'a1-reading-2', prompt: 'What does Lucas like to do on weekends?', options: ['Cook and watch movies', 'Work at the bank', 'Walk the dog at night', 'Sleep all day'] },
          { id: 'a1-reading-3', prompt: 'When do Lucas and Ana eat together?', options: ['In the morning', 'At lunchtime', 'At night', 'Only on weekends'] },
        ],
      },
    ],
  },
  {
    id: 'A2',
    name: 'A2 — Básico',
    topics: [
      {
        id: 'a2-present-continuous',
        name: 'Present continuous (e contraste com present simple)',
        questions: [
          { id: 'a2-present-continuous-1', prompt: 'Look! It ___ outside.', options: ['is raining', 'rains', 'raining', 'rain'] },
          { id: 'a2-present-continuous-2', prompt: 'I usually walk to work, but today I ___ the bus.', options: ['am taking', 'take', 'takes', 'taking'] },
          { id: 'a2-present-continuous-3', prompt: 'What ___ you doing right now?', options: ['are', 'do', 'is', 'does'] },
        ],
      },
      {
        id: 'a2-past-be',
        name: 'Past of to be (was / were)',
        questions: [
          { id: 'a2-past-be-1', prompt: 'I ___ tired yesterday.', options: ['was', 'were', 'am', 'did'] },
          { id: 'a2-past-be-2', prompt: 'Where ___ you last night?', options: ['were', 'was', 'did', 'are'] },
          { id: 'a2-past-be-3', prompt: 'The party ___ very good, so I left early.', options: ["wasn't", "weren't", "didn't", "isn't"] },
        ],
      },
      {
        id: 'a2-past-simple',
        name: 'Past simple (regulares, irregulares, did)',
        questions: [
          { id: 'a2-past-simple-1', prompt: 'We ___ to the beach last weekend.', options: ['went', 'go', 'goed', 'gone'] },
          { id: 'a2-past-simple-2', prompt: '___ you watch the game yesterday?', options: ['Did', 'Do', 'Were', 'Was'] },
          { id: 'a2-past-simple-3', prompt: "She didn't ___ my message.", options: ['answer', 'answered', 'answers', 'answering'] },
        ],
      },
      {
        id: 'a2-quantifiers',
        name: 'Contáveis e incontáveis (much / many / some)',
        questions: [
          { id: 'a2-quantifiers-1', prompt: 'How ___ money do you have?', options: ['much', 'many', 'a lot', 'few'] },
          { id: 'a2-quantifiers-2', prompt: "There aren't ___ people here today.", options: ['many', 'much', 'a little', 'a'] },
          { id: 'a2-quantifiers-3', prompt: 'Can I have ___ water, please?', options: ['some', 'a', 'many', 'an'] },
        ],
      },
      {
        id: 'a2-comparatives',
        name: 'Comparativos e superlativos',
        questions: [
          { id: 'a2-comparatives-1', prompt: 'My car is ___ than yours.', options: ['older', 'more old', 'oldest', 'the older'] },
          { id: 'a2-comparatives-2', prompt: 'This is the ___ restaurant in the city.', options: ['best', 'better', 'goodest', 'most good'] },
          { id: 'a2-comparatives-3', prompt: 'For me, English is ___ than Chinese.', options: ['easier', 'more easy', 'easyer', 'easiest'] },
        ],
      },
      {
        id: 'a2-future',
        name: 'Futuro (going to / will)',
        questions: [
          { id: 'a2-future-1', prompt: 'Look at those black clouds! It ___ rain.', options: ['is going to', 'will to', 'goes to', 'going'] },
          { id: 'a2-future-2', prompt: "\"I'm so tired.\" — \"Sit down, I ___ make you a coffee.\"", options: ["'ll", "'m", "'s going", "'d to"] },
          { id: 'a2-future-3', prompt: 'We ___ visit my parents next weekend. We bought the tickets yesterday.', options: ['are going to', 'will to', 'go to', 'going'] },
        ],
      },
      {
        id: 'a2-obligation',
        name: 'Obrigação e conselho (have to / must / should)',
        questions: [
          { id: 'a2-obligation-1', prompt: 'You look sick. You ___ see a doctor.', options: ['should', "shouldn't", 'have', 'must to'] },
          { id: 'a2-obligation-2', prompt: 'I ___ wake up early tomorrow because I have a flight.', options: ['have to', 'has to', 'must to', 'should to'] },
          { id: 'a2-obligation-3', prompt: "You ___ smoke here. It's not allowed.", options: ["mustn't", "don't have to", 'should', 'have to'] },
        ],
      },
      {
        id: 'a2-vocab',
        name: 'Vocabulário: viagem, rotina e clima',
        instruction: vocabInstruction,
        questions: [
          { id: 'a2-vocab-1', prompt: 'I need to ___ a hotel room for our trip.', options: ['book', 'make', 'do', 'take'] },
          { id: 'a2-vocab-2', prompt: 'Before leaving the hotel, you need to check ___.', options: ['out', 'in', 'up', 'off'] },
          { id: 'a2-vocab-3', prompt: "It's very ___ today. Take a jacket.", options: ['cold', 'hot', 'sunny', 'warm'] },
        ],
      },
      {
        id: 'a2-reading',
        name: 'Leitura A2 (relato de viagem no passado)',
        kind: 'reading',
        instruction: readingInstruction,
        passage:
          'Last summer, Julia travelled to Portugal for the first time. She stayed in Lisbon for a week, in a small hotel near the river. On the first day, she got lost because her phone battery died, but a friendly old man helped her find the hotel. During the week, she visited museums, tried lots of local food and took a train to Sintra. She says the trip was expensive, but she wants to go back next year with her sister.',
        questions: [
          { id: 'a2-reading-1', prompt: 'Why did Julia get lost on the first day?', options: ['Her phone stopped working', 'The hotel was far from the river', "She didn't speak Portuguese", 'She missed the train'] },
          { id: 'a2-reading-2', prompt: 'Where did she go by train?', options: ['To Sintra', 'To Lisbon', 'To the river', 'To a museum'] },
          { id: 'a2-reading-3', prompt: 'What does Julia think about the trip?', options: ['It was expensive, but she wants to return', 'It was cheap and boring', "She doesn't want to go back", 'Her sister didn\'t like it'] },
        ],
      },
    ],
  },
  {
    id: 'B1',
    name: 'B1 — Intermediário',
    topics: [
      {
        id: 'b1-present-perfect',
        name: 'Present perfect (ever / never / yet / since)',
        questions: [
          { id: 'b1-present-perfect-1', prompt: "I've ___ been to Japan. I'd love to go one day.", options: ['never', 'ever', 'already', 'yet'] },
          { id: 'b1-present-perfect-2', prompt: 'Have you finished your homework ___?', options: ['yet', 'already', 'ever', 'still'] },
          { id: 'b1-present-perfect-3', prompt: 'She ___ here since 2020.', options: ['has lived', 'lives', 'lived', 'is living'] },
        ],
      },
      {
        id: 'b1-perfect-vs-past',
        name: 'Present perfect × past simple',
        questions: [
          { id: 'b1-perfect-vs-past-1', prompt: "I ___ my keys! I can't open the door.", options: ['have lost', 'lose', 'am losing', 'was losing'] },
          { id: 'b1-perfect-vs-past-2', prompt: 'We ___ to Paris in 2019.', options: ['went', 'have gone', 'have been going', 'go'] },
          { id: 'b1-perfect-vs-past-3', prompt: 'How long ___ you known your best friend?', options: ['have', 'did', 'do', 'are'] },
        ],
      },
      {
        id: 'b1-past-continuous',
        name: 'Past continuous (was / were + -ing)',
        questions: [
          { id: 'b1-past-continuous-1', prompt: 'I ___ TV when the phone rang.', options: ['was watching', 'watch', 'am watching', 'have watched'] },
          { id: 'b1-past-continuous-2', prompt: '"What were you doing at 9 p.m. yesterday?" — "I ___ dinner."', options: ['was having', 'have had', 'have', 'am having'] },
          { id: 'b1-past-continuous-3', prompt: 'She cut her finger while she ___ dinner.', options: ['was cooking', 'cooks', 'is cooking', 'has cooked'] },
        ],
      },
      {
        id: 'b1-first-conditional',
        name: 'First conditional (if + present, will)',
        questions: [
          { id: 'b1-first-conditional-1', prompt: "If it ___ tomorrow, we'll stay at home.", options: ['rains', 'will rain', 'rained', 'would rain'] },
          { id: 'b1-first-conditional-2', prompt: 'If you study, you ___ the test.', options: ['will pass', 'would passed', 'passed', 'passing'] },
          { id: 'b1-first-conditional-3', prompt: 'If she ___ the bus, she will be late.', options: ['misses', 'will miss', 'missed', 'would miss'] },
        ],
      },
      {
        id: 'b1-second-conditional',
        name: 'Second conditional (if + past, would)',
        questions: [
          { id: 'b1-second-conditional-1', prompt: 'If I ___ rich, I would travel the world.', options: ['were', 'am', 'will be', 'would be'] },
          { id: 'b1-second-conditional-2', prompt: 'What would you do if you ___ the lottery?', options: ['won', 'win', 'will win', 'would win'] },
          { id: 'b1-second-conditional-3', prompt: 'If I had more time, I ___ learn to play the piano.', options: ['would', 'will', 'did', 'am'] },
        ],
      },
      {
        id: 'b1-relative',
        name: 'Relative clauses (who / which / where / whose)',
        questions: [
          { id: 'b1-relative-1', prompt: "That's the woman ___ helped me yesterday.", options: ['who', 'which', 'where', 'whose'] },
          { id: 'b1-relative-2', prompt: 'This is the restaurant ___ we had our first date.', options: ['where', 'which', 'who', 'what'] },
          { id: 'b1-relative-3', prompt: 'I have a friend ___ father is a pilot.', options: ['whose', 'who', 'which', "who's"] },
        ],
      },
      {
        id: 'b1-gerund-infinitive',
        name: 'Gerúndio × infinitivo (enjoy doing / decide to do)',
        questions: [
          { id: 'b1-gerund-infinitive-1', prompt: 'I enjoy ___ in the morning.', options: ['running', 'to run', 'run', 'ran'] },
          { id: 'b1-gerund-infinitive-2', prompt: 'She decided ___ a new job.', options: ['to look for', 'looking for', 'look for', 'looked for'] },
          { id: 'b1-gerund-infinitive-3', prompt: "He's good at ___ people laugh.", options: ['making', 'make', 'to make', 'made'] },
        ],
      },
      {
        id: 'b1-vocab',
        name: 'Vocabulário: collocations (make / do) e adjetivos -ed/-ing',
        instruction: vocabInstruction,
        questions: [
          { id: 'b1-vocab-1', prompt: 'I need to ___ a decision about the job offer.', options: ['make', 'do', 'get', 'put'] },
          { id: 'b1-vocab-2', prompt: 'Can you ___ me a favor?', options: ['do', 'make', 'give', 'take'] },
          { id: 'b1-vocab-3', prompt: 'She was ___ because she worked 12 hours today.', options: ['exhausted', 'exhausting', 'excited', 'boring'] },
        ],
      },
      {
        id: 'b1-reading',
        name: 'Leitura B1 (texto de opinião sobre trabalho remoto)',
        kind: 'reading',
        instruction: readingInstruction,
        passage:
          'Remote work became common for many companies after 2020. Supporters say it saves time and money, since employees don\'t need to commute, and it allows people to live in cheaper cities. However, some managers worry that teams lose creativity when they never meet in person. A recent survey found that most workers prefer a hybrid model: two or three days at home and the rest at the office. Interestingly, younger employees were more likely to say they missed the office, mainly because they wanted to learn from more experienced colleagues.',
        questions: [
          { id: 'b1-reading-1', prompt: 'According to the text, what is one advantage of remote work?', options: ["People don't waste time travelling to work", 'Teams become more creative', 'Managers can control employees better', 'Salaries are higher'] },
          { id: 'b1-reading-2', prompt: 'What do most workers prefer?', options: ['A mix of home and office', 'Working only from home', 'Working only at the office', 'Changing jobs every year'] },
          { id: 'b1-reading-3', prompt: 'Why did younger employees miss the office?', options: ['They wanted to learn from experienced colleagues', 'Their homes were too small', "They didn't like their managers", 'They lived in expensive cities'] },
        ],
      },
    ],
  },
  {
    id: 'B2',
    name: 'B2 — Intermediário avançado',
    topics: [
      {
        id: 'b2-passive',
        name: 'Voz passiva',
        questions: [
          { id: 'b2-passive-1', prompt: 'This bridge ___ in 1950.', options: ['was built', 'built', 'has built', 'was build'] },
          { id: 'b2-passive-2', prompt: 'The results ___ next week.', options: ['will be announced', 'will announce', 'are announcing', 'announced'] },
          { id: 'b2-passive-3', prompt: 'My phone ___ while I was on the bus.', options: ['was stolen', 'stole', 'was stealing', 'has stolen'] },
        ],
      },
      {
        id: 'b2-reported',
        name: 'Reported speech (discurso indireto)',
        questions: [
          { id: 'b2-reported-1', prompt: 'She said that she ___ tired.', options: ['was', 'be', 'been', 'being'] },
          { id: 'b2-reported-2', prompt: 'He asked me where I ___.', options: ['lived', 'did live', 'do I live', 'did I live'] },
          { id: 'b2-reported-3', prompt: 'They told us ___ late.', options: ['not to be', "don't be", 'not be', 'to not being'] },
        ],
      },
      {
        id: 'b2-third-conditional',
        name: 'Third conditional (if + had done, would have)',
        questions: [
          { id: 'b2-third-conditional-1', prompt: 'If I had known, I ___ you.', options: ['would have told', 'would tell', 'will tell', 'had told'] },
          { id: 'b2-third-conditional-2', prompt: 'If she ___ harder, she would have passed.', options: ['had studied', 'studied', 'would study', 'has studied'] },
          { id: 'b2-third-conditional-3', prompt: "We wouldn't have missed the flight if we ___ earlier.", options: ['had left', 'left', 'would leave', 'have left'] },
        ],
      },
      {
        id: 'b2-deduction',
        name: 'Modais de dedução (must / can\'t + have done)',
        questions: [
          { id: 'b2-deduction-1', prompt: "He isn't answering. He ___ be asleep.", options: ['must', 'can', 'should to', 'has'] },
          { id: 'b2-deduction-2', prompt: 'She ___ the email, or she would have replied by now.', options: ["can't have seen", "mustn't have seen", "can't see", "didn't must see"] },
          { id: 'b2-deduction-3', prompt: 'The ground is wet. It ___ rained last night.', options: ['must have', "can't have", 'should', 'must'] },
        ],
      },
      {
        id: 'b2-vocab',
        name: 'Phrasal verbs comuns',
        instruction: vocabInstruction,
        questions: [
          { id: 'b2-vocab-1', prompt: "I need to ___ smoking. It's bad for my health.", options: ['give up', 'give in', 'take up', 'put off'] },
          { id: 'b2-vocab-2', prompt: "Can you ___ the kids while I'm at the store?", options: ['look after', 'look for', 'look up', 'look into'] },
          { id: 'b2-vocab-3', prompt: 'The meeting was ___ until next Friday.', options: ['put off', 'put on', 'put up', 'put out'] },
        ],
      },
      {
        id: 'b2-reading',
        name: 'Leitura B2 (texto argumentativo)',
        kind: 'reading',
        instruction: readingInstruction,
        passage:
          'For decades, people believed that multitasking was a valuable skill. Recent research, however, suggests that the brain does not really perform two demanding tasks at the same time; instead, it switches rapidly between them, and each switch has a cost. Studies show that heavy multitaskers often perform worse on memory tests than people who focus on one task at a time. Researchers do not claim that multitasking is always harmful — listening to music while running, for instance, is rarely a problem — but they warn that combining tasks that require attention, such as texting and driving, can have serious consequences.',
        questions: [
          { id: 'b2-reading-1', prompt: 'What does the research suggest about multitasking?', options: ['The brain switches between tasks instead of doing them at the same time', 'The brain can easily do two hard tasks at once', 'Multitasking improves memory', 'Only young people can multitask'] },
          { id: 'b2-reading-2', prompt: 'Why does the text mention listening to music while running?', options: ['As an example of harmless multitasking', 'As an example of a dangerous combination', 'To show that music improves memory', 'To criticise the researchers'] },
          { id: 'b2-reading-3', prompt: "Which word best describes the researchers' position?", options: ['Balanced', 'Enthusiastic', 'Indifferent', 'Completely negative'] },
        ],
      },
    ],
  },
]

export const instructions = { defaultInstruction, vocabInstruction, readingInstruction }

// Lista "achatada" de tópicos, na ordem da trilha, com o nível de cada um.
export const allTopics = levels.flatMap((level) =>
  level.topics.map((topic) => ({ ...topic, levelId: level.id }))
)

export const topicById = Object.fromEntries(allTopics.map((topic) => [topic.id, topic]))

export function getInstruction(topic) {
  return topic.instruction ?? defaultInstruction
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toeflJuniorWords = [
    {
        text: 'essential',
        meanings: JSON.stringify(['极其重要的', '本质的']),
        examples: JSON.stringify(['Water is essential for life.', 'It is essential to arrive on time.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'observation',
        meanings: JSON.stringify(['观察', '言论']),
        examples: JSON.stringify(['She has great powers of observation.', 'An interesting observation about the weather.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'significant',
        meanings: JSON.stringify(['显著的', '重要的']),
        examples: JSON.stringify(['A significant increase in sales.', 'He made a significant contribution.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'adventure',
        meanings: JSON.stringify(['冒险', '奇遇']),
        examples: JSON.stringify(['They went on an adventure in the forest.', 'Life is a great adventure.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'communicate',
        meanings: JSON.stringify(['沟通', '传达']),
        examples: JSON.stringify(['We communicate by email.', 'He found it difficult to communicate his feelings.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'environment',
        meanings: JSON.stringify(['环境']),
        examples: JSON.stringify(['We must protect the environment.', 'The office is a pleasant environment to work in.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'history',
        meanings: JSON.stringify(['历史', '往事']),
        examples: JSON.stringify(['I enjoy learning about history.', 'This building has a long history.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'improve',
        meanings: JSON.stringify(['改善', '提高']),
        examples: JSON.stringify(['I want to improve my English.', 'The weather is expected to improve tomorrow.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'language',
        meanings: JSON.stringify(['语言']),
        examples: JSON.stringify(['Spanish is a beautiful language.', 'People use language to share ideas.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'native',
        meanings: JSON.stringify(['本土的', '天生的']),
        examples: JSON.stringify(['Panda is native to China.', 'Her native language is French.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'prevent',
        meanings: JSON.stringify(['预防', '阻止']),
        examples: JSON.stringify(['Vaccines prevent diseases.', 'Nothing can prevent us from succeeding.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'regular',
        meanings: JSON.stringify(['规律的', '定期的']),
        examples: JSON.stringify(['He exercises on a regular basis.', 'A regular hexagon has six equal sides.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'surface',
        meanings: JSON.stringify(['表面']),
        examples: JSON.stringify(['The surface of the lake was calm.', 'We need to clean the surface of the table.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'voyage',
        meanings: JSON.stringify(['航海', '旅程']),
        examples: JSON.stringify(['The Titanic sank on its maiden voyage.', 'Space voyage.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'wildlife',
        meanings: JSON.stringify(['野生动植物']),
        examples: JSON.stringify(['The park is home to a lot of wildlife.', 'Wildlife conservation.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'balance',
        meanings: JSON.stringify(['平衡', '余额']),
        examples: JSON.stringify(['She lost her balance and fell.', 'I checked my bank balance.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'conclude',
        meanings: JSON.stringify(['得出结论', '结束']),
        examples: JSON.stringify(['The investigation concluded that it was an accident.', 'He concluded his speech with a song.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'decade',
        meanings: JSON.stringify(['十年']),
        examples: JSON.stringify(['They have lived here for a decade.', 'The 1980s was a decade of change.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'explore',
        meanings: JSON.stringify(['探索', '探测']),
        examples: JSON.stringify(['We should explore the new city.', 'Explorers are exploring the ocean floor.']),
        category: 'TOEFL_JUNIOR'
    },
    {
        text: 'feature',
        meanings: JSON.stringify(['特征', '特色']),
        examples: JSON.stringify(['One feature of the car is its speed.', 'The landscape has many unique features.']),
        category: 'TOEFL_JUNIOR'
    }
];

async function main() {
    console.log('Seeding TOEFL Junior vocabulary...');
    for (const w of toeflJuniorWords) {
        await prisma.word.upsert({
            where: { text: w.text },
            update: w,
            create: w
        });
    }
    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

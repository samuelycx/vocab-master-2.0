import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; // Adjust path if needed
import { PrismaService } from '../src/prisma/prisma.service';
import { AdminController } from '../src/admin/admin.controller';

async function verify() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);
    const adminController = app.get(AdminController);

    console.log('--- ADMIN VERIFICATION ---');

    // 1. Create a dummy user
    const user = await prisma.user.upsert({
        where: { username: 'test_admin_subject' },
        update: {},
        create: { username: 'test_admin_subject' }
    });
    console.log(`User created/found: ${user.id}`);

    // 2. Set Category via Admin
    console.log('Testing setCategory...');
    await adminController.setUserCategory({ userId: user.id, category: 'TOEFL' });

    // Verify
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (updatedUser && updatedUser.targetCategory === 'TOEFL') {
        console.log('✅ setCategory success: TOEFL');
    } else {
        console.error(`❌ setCategory failed: ${updatedUser?.targetCategory}`);
    }

    // 3. Add Word
    console.log('Testing createWord...');
    const newWord = await adminController.createWord({
        text: 'verification_word_' + Date.now(),
        meanings: JSON.stringify(['test meaning']),
        examples: JSON.stringify(['test example']),
        category: 'TEST_CAT'
    });
    console.log(`Word created: ${newWord.id} - ${newWord.text}`);

    // 4. Delete Word
    console.log('Testing deleteWord...');
    await adminController.deleteWord(newWord.id);

    // Verify deletion
    const deletedWord = await prisma.word.findUnique({ where: { id: newWord.id } });
    if (!deletedWord) {
        console.log('✅ deleteWord success');
    } else {
        console.error('❌ deleteWord failed');
    }

    await app.close();
}

verify();

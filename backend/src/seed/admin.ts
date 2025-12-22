import crypto from 'crypto';
import { Profile } from '../models/Profile';

export const seedAdmin = async () => {
    try {
        const email = 'admin@skyjourney.com';
        const exists = await Profile.findOne({ email });

        if (!exists) {
            console.log('👑 Creating Admin User...');
            const password = 'admin123';
            const hashedSHA256 = crypto.createHash('sha256').update(password).digest('hex');

            await Profile.create({
                email,
                password: hashedSHA256,
                nome: 'Admin',
                cognome: 'System',
                sesso: 0,
                data_nascita: new Date('1970-01-01'),
                citta_nascita: 'System',
                role: 'admin'
            });
            console.log('✅ Admin user created: admin@skyjourney.com / admin123');
        } else {
            // Ensure role is admin if it exists (in case it was created before schema update)
            if (exists.role !== 'admin') {
                exists.role = 'admin';
                await exists.save();
                console.log('✅ Admin role updated for existing user');
            } else {
                console.log('ℹ️  Admin user already exists.');
            }
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};

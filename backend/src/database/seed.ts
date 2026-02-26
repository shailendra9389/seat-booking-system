import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.model';
import { Seat } from '../modules/seat/seat.model';
import { Holiday } from '../modules/holiday/holiday.model';
import { Booking } from '../modules/booking/booking.model';
import { config } from '../config';

dotenv.config();

const SQUADS_PER_BATCH_1 = [1, 2, 3, 4, 5];
const SQUADS_PER_BATCH_2 = [6, 7, 8, 9, 10];
const MEMBERS_PER_SQUAD = 8;
const BUFFER_SEATS = 10;

const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun',
    'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya',
    'Priya', 'Kavya', 'Riya', 'Neha', 'Simran',
    'Rohan', 'Karan', 'Rahul', 'Amit', 'Vikas',
    'Pooja', 'Sneha', 'Meera', 'Tanvi', 'Aishwarya',
    'Rajesh', 'Sunil', 'Deepak', 'Rakesh', 'Nitin',
    'Swati', 'Pallavi', 'Nandini', 'Shruti', 'Divya',
    'Vikram', 'Gaurav', 'Harsh', 'Yash', 'Dev',
    'Anjali', 'Komal', 'Sapna', 'Mansi', 'Jyoti',
    'Mohit', 'Sahil', 'Tushar', 'Akash', 'Pranav',
    'Ritika', 'Bhavna', 'Shweta', 'Aparna', 'Sonal',
    'Ashish', 'Manoj', 'Sanjay', 'Naveen', 'Tarun',
    'Megha', 'Nikita', 'Payal', 'Madhuri', 'Kriti',
    'Arun', 'Abhishek', 'Pankaj', 'Rishabh', 'Kunal',
    'Isha', 'Gauri', 'Tanya', 'Nisha', 'Preeti',
];

const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar',
    'Patel', 'Reddy', 'Joshi', 'Iyer', 'Nair',
    'Chopra', 'Malhotra', 'Mehta', 'Shah', 'Desai',
    'Rao', 'Das', 'Bose', 'Sen', 'Ghosh',
];

async function seed() {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Seat.deleteMany({}),
            Holiday.deleteMany({}),
            Booking.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 12);
        await User.create({
            name: 'Admin User',
            email: 'admin@seatbooking.com',
            password: adminPassword,
            squadId: 1,
            batchId: 1,
            role: 'admin',
        });
        console.log('👑 Admin user created: admin@seatbooking.com / admin123');

        // Create squad members
        const hashedPassword = await bcrypt.hash('password123', 12);
        let nameIndex = 0;

        for (let squadId = 1; squadId <= 10; squadId++) {
            const batchId = SQUADS_PER_BATCH_1.includes(squadId) ? 1 : 2;

            for (let member = 1; member <= MEMBERS_PER_SQUAD; member++) {
                const firstName = firstNames[nameIndex % firstNames.length];
                const lastName = lastNames[nameIndex % lastNames.length];
                nameIndex++;

                await User.create({
                    name: `${firstName} ${lastName}`,
                    email: `user.s${squadId}m${member}@seatbooking.com`,
                    password: hashedPassword,
                    squadId,
                    batchId,
                    role: 'user',
                });
            }
        }
        console.log(`👥 Created ${10 * MEMBERS_PER_SQUAD} squad members`);

        // Create designated seats (8 per squad, 10 squads = 80 seats)
        const seats: any[] = [];
        let seatCounter = 1;

        for (let squadId = 1; squadId <= 10; squadId++) {
            const baseRow = Math.ceil(squadId / 2);
            const colOffset = squadId % 2 === 1 ? 0 : 5;

            for (let member = 0; member < MEMBERS_PER_SQUAD; member++) {
                const row = baseRow;
                const col = colOffset + member + 1;

                seats.push({
                    seatNumber: `D-${String(seatCounter).padStart(3, '0')}`,
                    type: 'designated',
                    squadId,
                    floor: 1,
                    row,
                    column: col,
                    isActive: true,
                });
                seatCounter++;
            }
        }

        // Create buffer seats
        for (let i = 0; i < BUFFER_SEATS; i++) {
            seats.push({
                seatNumber: `B-${String(i + 1).padStart(3, '0')}`,
                type: 'buffer',
                squadId: null,
                floor: 1,
                row: 6,
                column: i + 1,
                isActive: true,
            });
        }

        await Seat.insertMany(seats);
        console.log(`💺 Created ${seats.length} seats (${seats.length - BUFFER_SEATS} designated + ${BUFFER_SEATS} buffer)`);

        // Create holidays for 2026
        const holidays = [
            { date: '2026-01-26', reason: 'Republic Day' },
            { date: '2026-03-10', reason: 'Maha Shivaratri' },
            { date: '2026-03-17', reason: 'Holi' },
            { date: '2026-03-31', reason: 'Id-ul-Fitr' },
            { date: '2026-04-02', reason: 'Good Friday' },
            { date: '2026-04-14', reason: 'Dr. Ambedkar Jayanti' },
            { date: '2026-05-01', reason: 'May Day' },
            { date: '2026-06-07', reason: 'Id-ul-Zuha' },
            { date: '2026-07-07', reason: 'Muharram' },
            { date: '2026-08-15', reason: 'Independence Day' },
            { date: '2026-08-21', reason: 'Janmashtami' },
            { date: '2026-09-05', reason: 'Milad un-Nabi' },
            { date: '2026-10-02', reason: 'Gandhi Jayanti' },
            { date: '2026-10-20', reason: 'Dussehra' },
            { date: '2026-11-09', reason: 'Diwali' },
            { date: '2026-11-10', reason: 'Diwali Holiday' },
            { date: '2026-11-30', reason: 'Guru Nanak Jayanti' },
            { date: '2026-12-25', reason: 'Christmas' },
        ];

        await Holiday.insertMany(
            holidays.map((h) => ({
                date: new Date(h.date),
                reason: h.reason,
            }))
        );
        console.log(`📅 Created ${holidays.length} holidays for 2026`);

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('  Admin: admin@seatbooking.com / admin123');
        console.log('  User:  user.s1m1@seatbooking.com / password123');
        console.log('  (Format: user.s{squadId}m{member}@seatbooking.com)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();

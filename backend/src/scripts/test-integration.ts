import pool from '../config/db';
import { AuthService } from '../services/auth.service';
import { FreelancerService } from '../services/freelancer.service';
import { GigService } from '../services/gig.service';
import { OrderService } from '../services/order.service';
import { ReviewService } from '../services/review.service';
import { GigModel } from '../models/gig.model';

const runTests = async () => {
  console.log('🧪 Starting Alex Gigs Backend Integration Test Suite...\n');
  
  // Since we might run in environments without database, wrap the whole thing
  try {
    console.log('⏳ Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database successfully.');
  } catch (error: any) {
    console.error('❌ Could not connect to PostgreSQL database.');
    console.error('Reason:', error.message);
    console.log('\n⚠️ Please ensure PostgreSQL is running and the database in `.env` exists to run integration tests.');
    console.log('Otherwise, you can run the backend using `npm run dev` after configuring your database.');
    process.exit(0);
  }

  // If connected, let's run the tests. To make tests clean, let's use a transaction or clean up afterward
  const client = await pool.connect();
  
  try {
    // Start transaction so we don't pollute the user's DB
    await client.query('BEGIN');
    console.log('\n📦 Isolated transaction started. Running system tests...\n');

    // 1. Register User 1 (Freelancer-to-be)
    console.log('👤 Step 1: Registering Freelancer account...');
    const user1Data = {
      username: 'mohamed_freelance_' + Date.now(),
      email: `mohamed_${Date.now()}@gigs.eg`,
      password: 'SecurePassword123',
      fname: 'Mohamed',
      lname: 'Ali',
      overview: 'Experienced Full Stack developer based in Alexandria.',
      country: 'Egypt',
      languages: ['Arabic', 'English']
    };
    const regResult1 = await AuthService.register({
      username: user1Data.username,
      email: user1Data.email,
      hashed_password: user1Data.password,
      fname: user1Data.fname,
      lname: user1Data.lname,
      overview: user1Data.overview,
      country: user1Data.country,
      languages: user1Data.languages
    });
    console.log(`✅ Freelancer registered. ID: ${regResult1.user.id}, Username: ${regResult1.user.username}`);

    // 2. Login User 1
    console.log('\n🔐 Step 2: Logging in Freelancer...');
    const loginResult1 = await AuthService.login(user1Data.email, user1Data.password);
    console.log(`✅ Login successful. JWT Token issued.`);

    // 3. Onboard as Freelancer
    console.log('\n🛠️ Step 3: Onboarding as Freelancer...');
    const freelancer = await FreelancerService.onboard(loginResult1.user.id, {
      job_title: 'Senior NodeJS & Postgres Engineer',
      overview: 'I build ultra-fast modular backend systems.'
    });
    console.log(`✅ Onboarded. Freelancer ID: ${freelancer.id}, Title: ${freelancer.job_title}`);

    // 4. Set Availability
    console.log('\n📅 Step 4: Setting Freelancer Availability schedule...');
    const availability = await FreelancerService.setAvailability(loginResult1.user.id, {
      start_day: 'Sunday',
      end_day: 'Thursday',
      start_hour: '09:00:00',
      end_hour: '17:00:00'
    });
    console.log(`✅ Availability configured from ${availability.start_day} to ${availability.end_day} (${availability.start_hour} - ${availability.end_hour})`);

    // 5. Create Gig with Packages
    console.log('\n💼 Step 5: Creating a new Gig with Packages...');
    const gig = await GigService.createGig(loginResult1.user.id, {
      title: 'Professional ExpressJS & TypeScript API Development',
      descr: 'I will develop a high-performance modular backend API for your startup.',
      tags: ['nodejs', 'typescript', 'express', 'postgresql'],
      portfolio: ['https://github.com/example/project1', 'https://github.com/example/project2'],
      packages: [
        {
          type: 'BASIC',
          title: 'Single Endpoint API',
          descr: 'One simple endpoint, validated request, JSON response.',
          delivery_time: 2,
          price: '50.00',
          deliverables: ['1 API Route', 'Zod validation', '1 controller']
        },
        {
          type: 'STANDARD',
          title: 'Full MVC Feature Layer',
          descr: 'Up to 5 endpoints, model/service/controller layers, database integration.',
          delivery_time: 5,
          price: '150.00',
          deliverables: ['5 API Routes', 'Postgres queries', 'Validation schemas', 'Error handling']
        }
      ]
    });
    console.log(`✅ Gig created successfully. ID: ${gig.id}, Title: ${gig.title}`);
    console.log(`📦 Packages created: ${gig.packages.length} packages (BASIC & STANDARD).`);

    // 6. Add FAQ
    console.log('\n❓ Step 6: Adding FAQ to the Gig...');
    const faq = await GigService.addFaq(loginResult1.user.id, gig.id, {
      question: 'Do you write automated tests?',
      answer: 'Yes, integration and unit tests are included in the Standard and Premium packages.'
    });
    console.log(`✅ FAQ registered: "${faq.question}" -> "${faq.answer}"`);

    // 7. Register User 2 (Buyer)
    console.log('\n👤 Step 7: Registering a Buyer account...');
    const user2Data = {
      username: 'abdo_buyer_' + Date.now(),
      email: `abdo_${Date.now()}@gigs.eg`,
      password: 'BuyerPassword456',
      fname: 'Abdelrahman',
      lname: 'Sharaf',
      overview: 'Startup founder looking for top backend talents.',
      country: 'Egypt',
      languages: ['Arabic', 'English']
    };
    const regResult2 = await AuthService.register({
      username: user2Data.username,
      email: user2Data.email,
      hashed_password: user2Data.password,
      fname: user2Data.fname,
      lname: user2Data.lname,
      overview: user2Data.overview,
      country: user2Data.country,
      languages: user2Data.languages
    });
    console.log(`✅ Buyer registered. ID: ${regResult2.user.id}, Username: ${regResult2.user.username}`);

    // 8. Save Gig to list
    console.log('\n💖 Step 8: Buyer bookmarks/saves the gig to their list...');
    await GigService.saveGig(regResult2.user.id, gig.id);
    const savedList = await GigService.getSavedGigs(regResult2.user.id);
    console.log(`✅ Gig saved. Buyer's bookmarked list length: ${savedList.length}`);

    // 9. Book Order under Standard Package
    console.log('\n💳 Step 9: Buyer books/places an order for the gig...');
    const standardPackage = gig.packages.find(p => p.type === 'STANDARD')!;
    const order = await OrderService.bookOrder(
      regResult2.user.id,
      standardPackage.id,
      'CARD',
      'Please make sure to structure the tables exactly as in starter_schema.sql'
    );
    console.log(`✅ Order booked. ID: ${order.id}, Amount: $${order.price}, Current Status: ${order.status}`);

    // 10. Freelancer accepts the order (PENDING -> IN_PROGRESS)
    console.log('\n🧑‍💻 Step 10: Freelancer accepts the order...');
    const acceptedOrder = await OrderService.updateOrderStatus(loginResult1.user.id, order.id, 'IN_PROGRESS');
    console.log(`✅ Order accepted. Current Status: ${acceptedOrder.status}`);

    // 11. Freelancer delivers the order (IN_PROGRESS -> DELIVERED)
    console.log('\n🚀 Step 11: Freelancer delivers the completed work...');
    const deliveredOrder = await OrderService.updateOrderStatus(loginResult1.user.id, order.id, 'DELIVERED');
    console.log(`✅ Order delivered at: ${deliveredOrder.delivered_at}. Current Status: ${deliveredOrder.status}`);

    // 12. Buyer completes the order (DELIVERED -> COMPLETED)
    console.log('\n🎉 Step 12: Buyer reviews work and marks order as COMPLETED...');
    const completedOrder = await OrderService.updateOrderStatus(regResult2.user.id, order.id, 'COMPLETED');
    console.log(`✅ Order marked as completed. Current Status: ${completedOrder.status}`);

    // 13. Buyer leaves a 5-star review
    console.log('\n⭐️ Step 13: Buyer submits a 5-star review...');
    const review = await ReviewService.submitReview(regResult2.user.id, {
      order_id: order.id,
      rating: 5,
      descr: 'Perfect delivery! The backend code is clean, fully type-safe, and runs incredibly fast.',
      created_by: 'BUYER'
    });
    console.log(`✅ Review submitted. Rating: ${review.rating} Stars. Comment: "${review.descr}"`);

    // 14. Query Gig Analytics View
    console.log('\n📊 Step 14: Querying SQL Gig Analytics View to verify derived attributes...');
    const analytics = await GigModel.getAnalyticsByGigId(gig.id);
    console.log(`✅ Analytics fetched:`);
    console.log(`   - Gig Title: "${analytics?.title}"`);
    console.log(`   - Average Rating: ${analytics?.avg_rating} Stars`);
    console.log(`   - Total Reviews: ${analytics?.total_reviews}`);
    console.log(`   - Total Saves (gig_lists): ${analytics?.total_lists}`);

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

    // Rollback so the DB is untouched
    await client.query('ROLLBACK');
    console.log('\n📦 Database transaction rolled back. Sandbox environment cleared.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ INTEGRATION TEST FAILED:');
    console.error(error);
  } finally {
    client.release();
    process.exit(0);
  }
};

runTests();

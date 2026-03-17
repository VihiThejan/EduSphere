import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { UserModel } from '../modules/users/user.model';
import { MarketplaceItem } from '../modules/marketplace/marketplace.model';
import { USER_ROLES } from '@edusphere/shared';
import { logger } from '../shared/utils/logger';

interface SellerUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

async function ensureMarketplaceSellers(): Promise<SellerUser[]> {
  const existing = await UserModel.find({
    roles: { $in: [USER_ROLES.TUTOR, USER_ROLES.ADMIN] },
  })
    .select('_id email profile')
    .lean();

  if (existing.length >= 3) {
    return existing as unknown as SellerUser[];
  }

  const passwordHash = await bcrypt.hash('Test1234', 10);

  const fallbackUsers = await UserModel.create([
    {
      email: 'market.seller1@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.TUTOR],
      isMarketplaceSeller: true,
      profile: {
        firstName: 'Market',
        lastName: 'SellerOne',
        bio: 'Marketplace sample seller profile 1',
        avatar: 'https://i.pravatar.cc/150?u=market-seller-1',
      },
    },
    {
      email: 'market.seller2@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.TUTOR],
      isMarketplaceSeller: true,
      profile: {
        firstName: 'Market',
        lastName: 'SellerTwo',
        bio: 'Marketplace sample seller profile 2',
        avatar: 'https://i.pravatar.cc/150?u=market-seller-2',
      },
    },
    {
      email: 'market.seller3@edusphere.com',
      passwordHash,
      roles: [USER_ROLES.ADMIN],
      isMarketplaceSeller: true,
      profile: {
        firstName: 'Market',
        lastName: 'AdminSeller',
        bio: 'Marketplace sample seller profile 3',
        avatar: 'https://i.pravatar.cc/150?u=market-seller-3',
      },
    },
  ]);

  return fallbackUsers as unknown as SellerUser[];
}

async function seedMarketplaceOnly() {
  logger.info('🔌 Connecting to database...');
  await mongoose.connect(config.database.uri);
  logger.info('✅ Connected to database');

  logger.info('👤 Ensuring seller users exist...');
  const sellers = await ensureMarketplaceSellers();
  const [sellerA, sellerB, sellerC] = sellers;
  logger.info(`✅ Ready sellers: ${sellers.length}`);

  logger.info('🧹 Clearing existing marketplace listings...');
  await MarketplaceItem.deleteMany({});

  logger.info('🛍️ Seeding marketplace listings...');

  const sellerInfo = (user: SellerUser, rating: number, reviewCount: number) => ({
    id: user._id,
    name: `${user.profile.firstName} ${user.profile.lastName}`,
    avatar: user.profile.avatar,
    rating,
    reviewCount,
  });

  const listings = await MarketplaceItem.create([
    {
      title: 'Engineering Mathematics Textbook (2nd Edition)',
      description: 'Clean copy with minimal highlights. Great for first-year engineering students.',
      sellerId: sellerA._id,
      category: 'textbooks',
      price: 3500,
      originalPrice: 5200,
      quantity: 3,
      condition: 'used-like-new',
      campus: 'moratuwa',
      images: [{ url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80', order: 0 }],
      tags: ['engineering', 'math', 'semester-1'],
      status: 'active',
      isNegotiable: true,
      seller: sellerInfo(sellerA, 4.8, 34),
      stats: { views: 120, favorites: 22, inquiries: 10 },
    },
    {
      title: 'Casio Scientific Calculator FX-991ES Plus',
      description: 'Fully functional calculator, ideal for exams and daily coursework.',
      sellerId: sellerA._id,
      category: 'calculators',
      price: 5500,
      originalPrice: 7900,
      quantity: 2,
      condition: 'used-good',
      campus: 'colombo',
      images: [{ url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=900&q=80', order: 0 }],
      tags: ['calculator', 'exam', 'science'],
      status: 'active',
      isNegotiable: false,
      seller: sellerInfo(sellerA, 4.8, 34),
      stats: { views: 96, favorites: 17, inquiries: 7 },
    },
    {
      title: 'Dell Latitude i5 Laptop (8GB RAM, SSD)',
      description: 'Well-maintained laptop suitable for coding, assignments, and online classes.',
      sellerId: sellerB._id,
      category: 'laptops-tech',
      price: 95000,
      originalPrice: 125000,
      quantity: 1,
      condition: 'used-good',
      campus: 'peradeniya',
      images: [{ url: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80', order: 0 }],
      tags: ['laptop', 'coding', 'student'],
      status: 'active',
      isNegotiable: true,
      seller: sellerInfo(sellerB, 4.9, 51),
      stats: { views: 180, favorites: 41, inquiries: 18 },
    },
    {
      title: 'Machine Learning Lecture Notes Bundle',
      description: 'Printed and digital notes covering supervised and unsupervised learning basics.',
      sellerId: sellerB._id,
      category: 'notes',
      price: 1800,
      quantity: 10,
      condition: 'new',
      campus: 'colombo',
      images: [{ url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80', order: 0 }],
      tags: ['ml', 'notes', 'data-science'],
      status: 'active',
      isNegotiable: false,
      seller: sellerInfo(sellerB, 4.9, 51),
      stats: { views: 88, favorites: 23, inquiries: 9 },
    },
    {
      title: 'Physics Lab Equipment Starter Kit',
      description: 'Basic lab equipment set useful for first-year practical sessions.',
      sellerId: sellerC._id,
      category: 'lab-equipment',
      price: 7600,
      originalPrice: 9800,
      quantity: 4,
      condition: 'used-like-new',
      campus: 'kelaniya',
      images: [{ url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=80', order: 0 }],
      tags: ['physics', 'lab', 'equipment'],
      status: 'active',
      isNegotiable: true,
      seller: sellerInfo(sellerC, 4.7, 29),
      stats: { views: 102, favorites: 19, inquiries: 8 },
    },
    {
      title: 'Calculus Past Papers (2019-2024)',
      description: 'Organized set of past papers with model answers and marking schemes.',
      sellerId: sellerC._id,
      category: 'course-materials',
      price: 1200,
      quantity: 15,
      condition: 'new',
      campus: 'moratuwa',
      images: [{ url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80', order: 0 }],
      tags: ['calculus', 'past-papers', 'exam-prep'],
      status: 'active',
      isNegotiable: false,
      seller: sellerInfo(sellerC, 4.7, 29),
      stats: { views: 140, favorites: 35, inquiries: 12 },
    },
    {
      title: 'Premium Notebook Pack (A4, 5 books)',
      description: 'High-quality ruled notebooks, unopened pack.',
      sellerId: sellerA._id,
      category: 'other',
      price: 1500,
      quantity: 20,
      condition: 'new',
      campus: 'colombo',
      images: [{ url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80', order: 0 }],
      tags: ['stationery', 'notebook', 'study'],
      status: 'active',
      isNegotiable: false,
      seller: sellerInfo(sellerA, 4.8, 34),
      stats: { views: 76, favorites: 11, inquiries: 4 },
    },
    {
      title: 'USB-C Hub for Laptops (6-in-1)',
      description: 'Supports HDMI, USB 3.0, SD card reader. Great for modern laptops.',
      sellerId: sellerB._id,
      category: 'laptops-tech',
      price: 4200,
      originalPrice: 6200,
      quantity: 5,
      condition: 'new',
      campus: 'peradeniya',
      images: [{ url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80', order: 0 }],
      tags: ['usb-c', 'accessories', 'tech'],
      status: 'active',
      isNegotiable: true,
      seller: sellerInfo(sellerB, 4.9, 51),
      stats: { views: 91, favorites: 20, inquiries: 9 },
    },
  ]);

  logger.info(`✅ Created ${listings.length} marketplace listings`);
  logger.info('🎉 Marketplace sample data seeding complete');

  process.exit(0);
}

seedMarketplaceOnly().catch((error) => {
  logger.error('❌ Error seeding marketplace sample data:', error);
  process.exit(1);
});

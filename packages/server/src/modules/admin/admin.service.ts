import { UserModel } from '../users/user.model.js';
import { SellerProfile as SellerProfileModel } from '../seller-profile/seller-profile.model.js';
import { MarketplaceItem as MarketplaceItemModel } from '../marketplace/marketplace.model.js';
import { CourseModel } from '../courses/course.model.js';
import { Order as OrderModel } from '../orders/order.model.js';
import { EnrollmentModel } from '../enrollments/enrollment.model.js';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.js';
import { USER_ROLES, UserRole } from '@edusphere/shared';

export class AdminService {
  async getPlatformStats() {
    const [
      totalUsers,
      totalSellers,
      totalCourses,
      totalListings,
      totalOrders,
      totalEnrollments,
      revenueResult,
      recentUsers,
    ] = await Promise.all([
      UserModel.countDocuments(),
      SellerProfileModel.countDocuments(),
      CourseModel.countDocuments({ status: 'published' }),
      MarketplaceItemModel.countDocuments({ publishStatus: 'published' }),
      OrderModel.countDocuments({ paymentStatus: 'COMPLETED' }),
      EnrollmentModel.countDocuments({ status: 'ACTIVE' }),
      OrderModel.aggregate([
        { $match: { paymentStatus: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      UserModel.find().sort({ createdAt: -1 }).limit(5).select('email profile roles createdAt'),
    ]);

    return {
      totalUsers,
      totalSellers,
      totalCourses,
      totalListings,
      totalOrders,
      totalEnrollments,
      totalRevenue: revenueResult[0]?.total ?? 0,
      recentUsers,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string, role?: string) {
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      filter.roles = role;
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select('email profile roles isEmailVerified isMarketplaceSeller marketplaceStatus tutorRequestStatus createdAt loginAttempts lockUntil')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUserRoles(adminId: string, userId: string, roles: UserRole[]) {
    if (userId === adminId) {
      throw new ValidationError('Cannot modify your own roles');
    }
    const validRoles = Object.values(USER_ROLES) as UserRole[];
    const invalid = roles.filter((r) => !validRoles.includes(r));
    if (invalid.length) {
      throw new ValidationError(`Invalid roles: ${invalid.join(', ')}`);
    }
    // Prevent removing the last admin from the platform
    if (!roles.includes(USER_ROLES.ADMIN)) {
      const targetUser = await UserModel.findById(userId).select('roles');
      if (targetUser?.roles.includes(USER_ROLES.ADMIN)) {
        const adminCount = await UserModel.countDocuments({ roles: USER_ROLES.ADMIN });
        if (adminCount <= 1) {
          throw new ValidationError('Cannot remove the last admin from the platform');
        }
      }
    }
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { roles },
      { new: true, select: 'email profile roles' }
    );
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async toggleUserSuspension(adminId: string, userId: string) {
    if (userId === adminId) {
      throw new ValidationError('Cannot suspend your own account');
    }
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User');

    // Use lockUntil as a suspension flag: far-future date = suspended
    const isSuspended = user.lockUntil && user.lockUntil > new Date();
    if (isSuspended) {
      user.lockUntil = undefined;
      user.loginAttempts = 0;
    } else {
      user.lockUntil = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
      user.loginAttempts = 5;
    }
    await user.save();
    return { suspended: !isSuspended, userId };
  }

  async getSellers(page = 1, limit = 20, search?: string, status?: string) {
    const profileFilter: Record<string, unknown> = {};
    if (status) profileFilter.verificationStatus = status;

    const skip = (page - 1) * limit;
    let query = SellerProfileModel.find(profileFilter)
      .populate('userId', 'email profile roles isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [sellers, total] = await Promise.all([
      query,
      SellerProfileModel.countDocuments(profileFilter),
    ]);

    const filtered = search
      ? sellers.filter((s) => {
          const u = s.userId as { email?: string } | null;
          return (
            s.shopName.toLowerCase().includes(search.toLowerCase()) ||
            (u?.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
          );
        })
      : sellers;

    return {
      sellers: filtered,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateSellerVerification(sellerId: string, status: 'unverified' | 'verified' | 'suspended') {
    const profile = await SellerProfileModel.findByIdAndUpdate(
      sellerId,
      { verificationStatus: status },
      { new: true }
    ).populate('userId', 'email profile');
    if (!profile) throw new NotFoundError('Seller profile');
    return profile;
  }

  async getListings(page = 1, limit = 20, search?: string, publishStatus?: string) {
    const filter: Record<string, unknown> = {};
    if (publishStatus) filter.publishStatus = publishStatus;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];

    const skip = (page - 1) * limit;
    const [listings, total] = await Promise.all([
      MarketplaceItemModel.find(filter)
        .populate('sellerId', 'email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MarketplaceItemModel.countDocuments(filter),
    ]);

    return {
      listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async removeListing(listingId: string) {
    const listing = await MarketplaceItemModel.findByIdAndUpdate(
      listingId,
      { publishStatus: 'archived' },
      { new: true }
    );
    if (!listing) throw new NotFoundError('Listing');
    return listing;
  }

  async getOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      OrderModel.find()
        .populate('buyerId', 'email profile')
        .populate('sellerId', 'email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments(),
    ]);
    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const adminService = new AdminService();

import mongoose from 'mongoose';
import {
  MARKETPLACE_STATUS,
  SELLER_VERIFICATION_STATUS,
  USER_ROLES,
  SellerOnboardingInput,
  SellerProfileUpdateInput,
} from '@edusphere/shared';
import { NotFoundError } from '../../shared/utils/errors.js';
import { UserModel } from '../users/user.model.js';
import { ISellerProfileDocument, SellerProfile } from './seller-profile.model.js';

export class SellerProfileService {
  async onboardSeller(userId: string, input: SellerOnboardingInput): Promise<ISellerProfileDocument> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.roles.includes(USER_ROLES.SELLER)) {
      user.roles = [...user.roles, USER_ROLES.SELLER];
    }

    user.isMarketplaceSeller = true;
    user.marketplaceStatus = MARKETPLACE_STATUS.ACTIVE;
    await user.save();

    const profile = await SellerProfile.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        userId: new mongoose.Types.ObjectId(userId),
        shopName: input.shopName,
        shopDescription: input.shopDescription,
        verificationStatus: SELLER_VERIFICATION_STATUS.UNVERIFIED,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return profile;
  }

  async getMyProfile(userId: string): Promise<ISellerProfileDocument | null> {
    return SellerProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  }

  async updateMyProfile(
    userId: string,
    input: SellerProfileUpdateInput
  ): Promise<ISellerProfileDocument> {
    const profile = await SellerProfile.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        ...input,
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      throw new NotFoundError('Seller profile');
    }

    return profile;
  }
}

export const sellerProfileService = new SellerProfileService();

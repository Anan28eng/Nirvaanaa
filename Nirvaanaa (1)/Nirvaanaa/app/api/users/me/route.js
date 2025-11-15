import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const { name, email, phone, profileImage, shippingAddress } = body;

    // Check if email is being changed and if it's already taken
    if (email && email !== session.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select('-password');

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await dbConnect();

    const body = await request.json();
    if (body.action === 'deleteProfileImage') {
      const updated = await User.findByIdAndUpdate(session.user.id, { $unset: { profileImage: '' } }, { new: true }).select('-password');
      return NextResponse.json({ message: 'Profile photo removed', user: updated });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/users/me:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await dbConnect();

    // Soft-delete user and scrub PII
    const scrub = {
      name: 'Deleted User',
      email: `deleted_${session.user.id}@example.com`,
      phone: undefined,
      profileImage: undefined,
      shippingAddress: undefined,
      isActive: false,
    };
    await User.findByIdAndUpdate(session.user.id, { $set: scrub }, { new: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";

export async function POST(req: NextRequest) {
  try {
    const { email, clearLargeAvatar } = await req.json();
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "user not found" },
        { status: 404 }
      );
    }

    let updated = false;
    if (
      clearLargeAvatar &&
      user.image &&
      typeof user.image === "string" &&
      user.image.length > 2048
    ) {
      await User.updateOne({ _id: user._id }, { $unset: { image: "" } });
      updated = true;
    }

    return NextResponse.json({
      ok: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        hasImage: !!user.image,
        imageLength: user.image?.length || 0,
      },
      updated,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}

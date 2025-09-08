import { NextResponse } from "next/server";
import { db } from "../../../configs/db";
import { HistoryTable } from "../../../configs/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
export async function POST(req: any) {
  const { content, recordId, aiAgentType } = await req.json();
  const user = await currentUser();
  try {
    // Insert record
    const result = await db.insert(HistoryTable).values({
      recordId: recordId,
      content: content,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdAt: (new Date()).toString(),
      aiAgentType: aiAgentType
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(e);
  }
}

export async function PUT(req: any) {
  const { content, recordId } = await req.json();
  try {
    // Insert record
    const result = await db
      .update(HistoryTable)
      .set({
        content: content,
      })
      .where(eq(HistoryTable.recordId, recordId));

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(e);
  }
}

export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const recordId = searchParams.get("recordId");
  const user = await currentUser();

  try {
    if (recordId) {
      const result = await db
        .select()
        .from(HistoryTable)
        .where(eq(HistoryTable.recordId, recordId));
      return NextResponse.json(result[0]);
    }
    else {
      const result = await db
        .select()
        .from(HistoryTable)
        .where(eq(HistoryTable.userEmail, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(HistoryTable.id))
        ;
      return NextResponse.json(result);
    }
    return NextResponse.json({});
  } catch (e) {
    return NextResponse.json(e);
  }
}

// 👇 NEW FUNCTION FOR DELETION
export async function DELETE(req: any) {
  const { searchParams } = new URL(req.url);
  const recordId = searchParams.get("recordId");
  const user = await currentUser();

  if (!recordId || !user) {
    return NextResponse.json({ error: "Missing required parameters or user not authenticated" }, { status: 400 });
  }

  try {
    const userEmail = user.primaryEmailAddress?.emailAddress;

    // Delete the record only if the recordId matches AND the userEmail matches
    const result = await db
      .delete(HistoryTable)
      .where(
        and(
          eq(HistoryTable.recordId, recordId),
          eq(HistoryTable.userEmail, userEmail)
        )
      );

    if (result.rowCount === 0) {
        return NextResponse.json({ error: "Record not found or user does not have permission" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Failed to delete history:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
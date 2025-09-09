// /app/api/history/route.tsx

import { NextResponse } from "next/server";
import { db } from "../../../configs/db";
import { HistoryTable } from "../../../configs/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

export async function POST(req: Request) { // Use Request type
  const { content, recordId, aiAgentType } = await req.json();
  const user = await currentUser();

  // Validation: Ensure user is authenticated
  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const result = await db.insert(HistoryTable).values({
      recordId: recordId,
      content: content,
      userEmail: user.primaryEmailAddress.emailAddress, // Now safe to use
      createdAt: new Date().toISOString(), // Use ISO string for consistency
      aiAgentType: aiAgentType,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) { // Use Request type
  const { content, recordId } = await req.json();

  if (!recordId) {
     return NextResponse.json({ error: "Missing recordId" }, { status: 400 });
  }

  try {
    const result = await db
      .update(HistoryTable)
      .set({ content: content })
      .where(eq(HistoryTable.recordId, recordId));

    return NextResponse.json(result);
  } catch (e) {
    console.error("PUT Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) { // Use Request type
  const { searchParams } = new URL(req.url);
  const recordId = searchParams.get("recordId");
  const user = await currentUser();

  // Validation: User must be logged in for any history access
  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  const userEmail = user.primaryEmailAddress.emailAddress; // Now a defined string

  try {
    if (recordId) {
      // Fetch a single record, ensuring it belongs to the authenticated user
      const result = await db
        .select()
        .from(HistoryTable)
        .where(
          and(
            eq(HistoryTable.recordId, recordId),
            eq(HistoryTable.userEmail, userEmail) // Security check
          )
        );
      return NextResponse.json(result[0] || null); // Return the item or null if not found
    } else {
      // Fetch all history for the authenticated user
      const result = await db
        .select()
        .from(HistoryTable)
        .where(eq(HistoryTable.userEmail, userEmail)) // This is now type-safe
        .orderBy(desc(HistoryTable.id));
      return NextResponse.json(result);
    }
  } catch (e) {
    console.error("GET Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) { // Use Request type
  const { searchParams } = new URL(req.url);
  const recordId = searchParams.get("recordId");
  const user = await currentUser();

  // Validation: Check for user and recordId first
  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  if (!recordId) {
    return NextResponse.json({ error: "Missing required parameter: recordId" }, { status: 400 });
  }
  
  const userEmail = user.primaryEmailAddress.emailAddress; // Now a defined string

  try {
    const result = await db
      .delete(HistoryTable)
      .where(
        and(
          eq(HistoryTable.recordId, recordId),
          eq(HistoryTable.userEmail, userEmail) // This is now type-safe
        )
      );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Record not found or user does not have permission" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
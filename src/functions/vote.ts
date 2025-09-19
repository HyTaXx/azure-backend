import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { votes } from "../cosmo";
import { v4 as uuid } from "uuid";

export async function voteHandler(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await req.json() as { userId?: string; choice?: string };
    const userId = body.userId?.trim();
    const choice = (body.choice || "").toLowerCase();


    if (!userId || !["oui", "non"].includes(choice)) {
      return { status: 400, jsonBody: { error: "userId and choice ('Oui' or 'Non') are required" } };
    }

    // delete any previous vote for this user
    const existing = await votes.items
      .query({ query: "SELECT c.id FROM c WHERE c.userId = @u", parameters: [{ name: "@u", value: userId }] })
      .fetchAll();

    for (const v of existing.resources) {
      await votes.item(v.id, userId).delete();
    }

    const doc = {
      id: uuid(),
      userId,
      choice: choice === "oui" ? "Oui" : "Non",
      createdAt: new Date().toISOString()
    };

    await votes.items.create({ ...doc, partitionKey: userId });

    return { status: 201, jsonBody: doc };
  } catch (err) {
    ctx.error(err);
    return { status: 500, jsonBody: { error: "internal server error" } };
  }
}

app.http("vote", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: voteHandler
});

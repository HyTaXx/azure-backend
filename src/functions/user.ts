import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { users } from "../cosmo";
import { v4 as uuid } from "uuid";

export async function userHandler(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await req.json() as { pseudo?: string; email?: string };
    const pseudo = body.pseudo?.trim();
    const email  = body.email?.trim();


    if (!pseudo || !email) {
      return { status: 400, jsonBody: { error: "pseudo and email are required" } };
    }

    const user = { id: uuid(), pseudo, email, createdAt: new Date().toISOString() };
    await users.items.create(user);

    return { status: 201, jsonBody: user };
  } catch (err) {
    ctx.error(err);
    return { status: 500, jsonBody: { error: "internal server error" } };
  }
}

app.http("user", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: userHandler
});

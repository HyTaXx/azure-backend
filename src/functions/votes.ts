import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { votes } from "../cosmo";

export async function votesHandler(_req: HttpRequest): Promise<HttpResponseInit> {
  const { resources } = await votes.items.query("SELECT * FROM c").fetchAll();
  const total = resources.length;
  const yes = resources.filter(v => v.choice === "Oui").length;
  const no = total - yes;
  const pctYes = total ? Math.round((yes / total) * 100) : 0;

  return { status: 200, jsonBody: { total, yes, no, pctYes, items: resources } };
}

app.http("votes", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: votesHandler
});

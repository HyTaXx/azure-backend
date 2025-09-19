import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const dbName = process.env.COSMOS_DB!;
const usersContainer = process.env.USERS_CONTAINER || "users";
const votesContainer = process.env.VOTES_CONTAINER || "votes";

export const client = new CosmosClient({ endpoint, key });
export const db = client.database(dbName);
export const users = db.container(usersContainer);
export const votes = db.container(votesContainer);

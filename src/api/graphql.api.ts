import { print } from "graphql";

export const fetchGraphQL = async ({ query, variables, accessToken }: any) => {
   const queryString = typeof query === "string" ? query : print(query);
const URL = import.meta.env.VITE_API_URL



  const response = await fetch(`${URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({query: queryString, variables }),
  });

  // console.log("STATUS:", response.status);

  // Check raw response
  const rawText = await response.text();
  // console.log("RAW RESPONSE:", rawText);

  // Try to parse JSON (only if possible)
  try {
    const json = JSON.parse(rawText);

    if (json.errors) {
      throw new Error(json.errors.map((e: any) => e.message).join(", "));
    }

    return json.data;
  } catch (e) {
    throw new Error("Server returned invalid JSON: " + rawText);
  }
};

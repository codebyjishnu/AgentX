import { privateClient } from "../utils/privateClient";



export async function createNewProject(): Promise<unknown> {
  try {
    const response = await privateClient.get("/project/new");
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return error;
  }
}
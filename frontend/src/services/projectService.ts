/* eslint-disable @typescript-eslint/no-explicit-any */
import { privateClient } from "../utils/privateClient";



export async function createNewProject(): Promise<any> {
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

export async function getProjectDetails(projectId:string){
  try {
    const response = await privateClient.get(`/project/${projectId}/details`)
    const {data,status}=response;
    if (status) {
      return data;
    }else{
      return [];
    }
  } catch (error) {
    return error; 
  }
}

export async function sendMessage(projectId:string,message:string){
  try {
    const response = await privateClient.post(`project/${projectId}/chat`,{message})
       const {data,status}=response;
    if (status) {
      return data;
    }else{
      return [];
    }
  } catch (error) {
    return error
  }
}
import apiClient from "./api";
import type { DiscussionGroup, Message, PaginatedResponse } from "./types";

export async function getGroups(classroomUnitId: string): Promise<DiscussionGroup[]> {
  const { data } = await apiClient.get(`/api/discussions/unit/${classroomUnitId}`);
  return data.data as DiscussionGroup[];
}

export async function createGroup(payload: {
  name: string;
  classroomUnitId: string;
  courseId?: string;
}): Promise<DiscussionGroup> {
  const { data } = await apiClient.post("/api/discussions/groups", payload);
  return data.data as DiscussionGroup;
}

export async function addGroupMember(groupId: string, userId: string): Promise<void> {
  await apiClient.post(`/api/discussions/groups/${groupId}/members`, { userId });
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  await apiClient.delete(`/api/discussions/groups/${groupId}/members/${userId}`);
}

export async function getMessages(
  groupId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<Message>> {
  const { data } = await apiClient.get(`/api/discussions/groups/${groupId}/messages`, {
    params: { page, limit },
  });
  return data.data as PaginatedResponse<Message>;
}

export async function sendMessage(groupId: string, content: string): Promise<Message> {
  const { data } = await apiClient.post(`/api/discussions/groups/${groupId}/messages`, {
    content,
  });
  return data.data as Message;
}

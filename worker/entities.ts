import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, Property } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS, MOCK_PROPERTIES } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = MOCK_CHATS.map(c => ({
    ...c,
    messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
  }));
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
export class PropertyEntity extends IndexedEntity<Property> {
  static readonly entityName = "property";
  static readonly indexName = "properties";
  static readonly initialState: Property = {
    id: "",
    ref: "",
    title: "",
    price: 0,
    beds: 0,
    baths: 0,
    images: [],
    location: "",
    created: 0,
    lastEdited: 0
  };
  static seedData = MOCK_PROPERTIES;
  static override keyOf(state: Property): string {
    return state.ref; // Use reference as the primary lookup ID
  }
  async updateImages(images: string[]): Promise<void> {
    await this.patch({ images, lastEdited: Date.now() });
  }
}
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
    kref: "",
    title: "",
    ptype: "Villa",
    province: "",
    town: "",
    location: "",
    area: "",
    price: 0,
    originalprice: 0,
    frequency: "Sale",
    beds: 0,
    baths: 0,
    living: 0,
    plot: 0,
    images: [],
    description: "",
    moredetails: "",
    display: true,
    salestage: 0,
    rental: false,
    finca: false,
    penthouse: false,
    luxury: false,
    offplan: false,
    leasehold: false,
    golf: false,
    beach: false,
    aircon: false,
    pool: false,
    fireplace: false,
    heating: false,
    solarium: false,
    balconies: false,
    furnished: false,
    kitchen: false,
    utility: false,
    notrain: false,
    topsix: false,
    kyeroPrime: false,
    DE: "",
    FR: "",
    NL: "",
    created: "",
    kdate: "",
    lastEdited: ""
  };
  static seedData = MOCK_PROPERTIES;
  static override keyOf<U extends { id: string }>(state: U): string {
    const s = state as unknown as Property;
    return s.ref || s.id;
  }
  async updateImages(images: string[]): Promise<void> {
    await this.patch({ images, lastEdited: new Date().toISOString() });
  }
}
import { IndexedEntity } from "./core-utils";
import type { User, Property } from "@shared/types";
import { MOCK_USERS, MOCK_PROPERTIES } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
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
  /**
   * Transactional update for images to ensure consistency.
   * Simulates a database commit for the 'images' column.
   */
  async updateGallery(images: string[]): Promise<Property> {
    return this.mutate(current => ({
      ...current,
      images,
      lastEdited: new Date().toISOString()
    }));
  }
  /**
   * Migration helper to ensure old records match new MGHPROPS schema requirements.
   */
  async ensureSchemaConsistency(): Promise<void> {
    const state = await this.getState();
    const needsPatch = Object.keys(PropertyEntity.initialState).some(
      key => state[key as keyof Property] === undefined
    );
    if (needsPatch) {
      await this.patch({
        ...PropertyEntity.initialState,
        ...state,
        lastEdited: new Date().toISOString()
      });
    }
  }
}
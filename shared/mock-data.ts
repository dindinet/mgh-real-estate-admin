import type { User, Chat, ChatMessage, Property } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User' },
];
export const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'Support' },
];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [];
export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    ref: 'LUM-001',
    title: 'Modern Glass Villa',
    price: 2450000,
    beds: 5,
    baths: 4,
    location: 'Beverly Hills, CA',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    created: Date.now() - 1000000,
    lastEdited: Date.now()
  },
  {
    id: 'p2',
    ref: 'LUM-002',
    title: 'Scandinavian Minimalist',
    price: 1850000,
    beds: 3,
    baths: 2,
    location: 'Aspen, CO',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    created: Date.now() - 2000000,
    lastEdited: Date.now()
  },
  {
    id: 'p3',
    ref: 'LUM-003',
    title: 'Coastal Penthouse',
    price: 3200000,
    beds: 4,
    baths: 4.5,
    location: 'Miami, FL',
    images: [
      'https://images.unsplash.com/photo-1600607687940-4e524cb35a3a?auto=format&fit=crop&w=800&q=80'
    ],
    created: Date.now() - 3000000,
    lastEdited: Date.now()
  },
  {
    id: 'p4',
    ref: 'LUM-004',
    title: 'Urban Industrial Loft',
    price: 950000,
    beds: 2,
    baths: 2,
    location: 'Brooklyn, NY',
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=800&q=80'
    ],
    created: Date.now() - 4000000,
    lastEdited: Date.now()
  },
  {
    id: 'p5',
    ref: 'LUM-005',
    title: 'Desert Oasis Mansion',
    price: 5400000,
    beds: 6,
    baths: 7,
    location: 'Scottsdale, AZ',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
    ],
    created: Date.now() - 5000000,
    lastEdited: Date.now()
  },
  {
    id: 'p6',
    ref: 'LUM-006',
    title: 'Lakefront Heritage Home',
    price: 1200000,
    beds: 4,
    baths: 3,
    location: 'Lake Tahoe, NV',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80'
    ],
    created: Date.now() - 6000000,
    lastEdited: Date.now()
  }
];
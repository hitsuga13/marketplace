// src/data/products.js

export const allProducts = [
  // FOOD & BEVERAGES
  {
    id: 1,
    category: 'FnB',
    vendor: 'Dapur Ummi',
    name: 'Nasi Goreng Ayam Kunyit',
    image: '/icons/f&b_1.jpg',
    price: 7, // Default price
    desc1: 'Hanya RM7.00 dan boleh dihantar dari bilik ke bilik.',
  },

  {
    id: 2,
    category: 'FnB',
    vendor: 'Takoyaki King',
    name: 'Takoyaki',
    image: '/icons/f&b_2.jpg',
    price: 10,
    desc1: '6pcs-RM5 13pcs-RM10 \n Promosi: Beli 13pcs, dapat 2pcs percuma',
    addons: [
      { label: 'Extra Spicy', price: 1.5 },
      { label: 'Extra Cheese', price: 2 },
    ],
  },
  {
    id: 3,
    category: 'FnB',
    vendor: 'RamenRa',
    name: 'Ramen Korea',
    image: '/icons/f&b_7.jpg',
    desc1: '🍜 Rabokki (Tteokbokki Flavour) 💰 RM4 \n🌶️ Buldak Original (Spicy Ramen) 💰 RM6',
    variations: [
      { label: '🍜 Rabokki (Tteokbokki Flavour)', price: 4 },
      { label: '🌶️ Buldak Original (Spicy Ramen)', price: 6 },
    ],
    addons: [{ label: 'COD', price: 0.5 }],
  },
  {
    id: 4,
    category: 'FnB',
    name: 'WOW Spagheti',
    image: '/icons/f&b_8.jpg',
    desc1: 'Harga: RM3, RM5(2)',
    desc2: 'Buy 2, get 1 free WOW Carbonara',
  },

  // SERVICES
  {
    id: 5,
    category: 'Services',
    name: 'Printing & Laminate',
    image: '/icons/services_2.jpg',
    desc1: '*rujuk gambar untuk harga*',
    desc2: '',
  },
  {
    id: 6,
    category: 'Services',
    name: 'Personal Runner',
    image: '/icons/services_3.jpg',
    desc1: 'Small items (less than 1kg) - RM3 (per item)',
    desc2: '',
  },

  // THRIFT
  {
    id: 7,
    category: 'Thrift',
    name: 'Rebelutions Tour shirt',
    image: '/icons/item_1.jpg',
    desc1: 'Description of thrift item',
    desc2: '',
  },
  {
    id: 8,
    category: 'Thrift',
    name: 'Hoodie',
    image: '/icons/thrift_5.jpg',
    desc1: 'Description of thrift item',
    desc2: '',
  },
  {
    id: 9,
    category: 'Thrift',
    name: 'Brazil National Team Jersey',
    image: '/icons/item_2.jpg',
    desc1: 'Description of thrift item',
    desc2: '',
  },
  {
    id: 10,
    category: 'Thrift',
    name: 'Nike SB Dunk',
    image: '/icons/item_3.jpg',
    desc1: 'Description of thrift item',
    desc2: '',
  },
  {
    id: 11,
    category: 'Thrift',
    name: 'Snapback New Era',
    image: '/icons/thrift_6.jpg',
    desc1: 'Description of thrift item',
    desc2: '',
  },

  // --- NEW VENDOR: WorldStarCafe ---
  {
    id: 12,
    category: 'FnB',
    vendor: 'WorldStarCafe',
    name: 'Butter Rice Series',
    image: '/icons/worldstar_butterrice.jpg', // Use your uploaded image name
    price: 10,
    desc1: 'Hanya RM8. Pilihan: Ayam Grill, Maduthai, atau Buttermilk.',
  },
  {
    id: 13,
    category: 'FnB',
    vendor: 'WorldStarCafe',
    name: 'Specialty Frappes',
    image: '/icons/worldstar_frappe.jpg',
    desc1: 'Freshly blended creamy frappes with whipped cream.',
    variations: [
      { label: 'Vanilla Frappe', price: 10 }, // <--- Real numbers
      { label: 'Strawberry Vanilla', price: 11 },
      { label: 'Miliktea Chocolate', price: 11 },
      { label: 'Matcha Oreo', price: 12 },
    ],
  },

  {
    id: 14,
    category: 'FnB',
    vendor: 'WorldStarCafe',
    name: 'Spaghetti House',
    image: '/icons/worldstar_spag.jpg',
    desc1: 'Home-style Italian pasta',
    variations: [
      { label: 'Bolognese', price: 10 },
      { label: 'Carbonara', price: 10 },
    ],
  },
]

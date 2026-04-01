import type { ShopItem } from "@/types"

export const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  {
    id: "item-convenience",
    name: "편의점 쿠폰",
    description: "편의점 간식 1회",
    price: 500,
    isCustom: false,
  },
  {
    id: "item-cafe",
    name: "카페 쿠폰",
    description: "카페 음료 1잔",
    price: 800,
    isCustom: false,
  },
  {
    id: "item-dessert",
    name: "디저트 쿠폰",
    description: "디저트/베이커리 1회",
    price: 1000,
    isCustom: false,
  },
  {
    id: "item-chicken",
    name: "치킨 쿠폰",
    description: "치킨 1회 주문",
    price: 1500,
    isCustom: false,
  },
  {
    id: "item-dining",
    name: "외식 쿠폰",
    description: "외식 1회",
    price: 2000,
    isCustom: false,
  },
]

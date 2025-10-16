export interface ProductItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand_id: number;
  category_name: string;
  brand_name: string;
  altreInfo?: string;
}
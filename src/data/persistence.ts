import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProductDetailData } from '../types/product';

const STORAGE_KEY = 'kaudoki:tracked-products:v1';

export async function loadStoredProducts(): Promise<ProductDetailData[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProductDetailData[]) : null;
  } catch {
    return null;
  }
}

export async function saveStoredProducts(products: ProductDetailData[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Best-effort persistence; a save failure shouldn't crash the app.
  }
}

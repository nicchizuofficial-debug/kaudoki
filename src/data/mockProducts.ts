import { buildProduct } from './productFactory';
import { CATALOG, DEFAULT_TRACKED_IDS } from './catalog';

export const initialProducts = CATALOG.filter((entry) => DEFAULT_TRACKED_IDS.includes(entry.id)).map(buildProduct);

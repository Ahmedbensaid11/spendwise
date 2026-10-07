export type Category = { id: number; name: string; color: string; defaultCategory: boolean }
export type CategoryInput = Pick<Category, 'name' | 'color'>

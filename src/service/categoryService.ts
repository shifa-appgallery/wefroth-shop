import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";

const categoryRepository = AppDataSource.getRepository(Category);

export const createCategory = async (body: any, userId:number) => {
  const category = categoryRepository.create({
    categoryName: body.categoryName,
    slug: body.slug,
    level: body.parent ? 2 : 1,
    parent: body.parent ? { categoryId: body.parent } : null,
    sort_order: body.sort_order || 0,
    created_by: userId,
  });

  return await categoryRepository.save(category);
};

export const getCategories = async () => {
  return await categoryRepository.find({
    relations: ["parent", "children"],
    where: {
      is_active: true,
    },
    order: {
      sort_order: "ASC",
    },
  });
};

export const updateCategory = async (
  categoryId: number,
  body: any,
  userId:number
) => {
  await categoryRepository.update(categoryId, {
    categoryName: body.categoryName,
    slug: body.slug,
    sort_order: body.sort_order,
    updated_by: userId,
  });

  return await categoryRepository.findOne({
    where: { categoryId },
  });
};

export const deleteCategory = async (categoryId: number) => {
  await categoryRepository.update(categoryId, {
    is_active: false,
  });

  return true;
};
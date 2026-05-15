import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";

const categoryRepository = AppDataSource.getRepository(Category);

export const createCategory = async (body: any, userId: number) => {
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
  userId: number
) => {

  const existingCategory = await categoryRepository.findOne({
    where: { categoryId }
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const oldSortOrder = existingCategory.sort_order;
  const newSortOrder = body.sort_order;

  if (oldSortOrder !== newSortOrder) {

    if (newSortOrder < oldSortOrder) {

      await categoryRepository
        .createQueryBuilder()
        .update()
        .set({
          sort_order: () => "sort_order + 1"
        })
        .where(
          "sort_order >= :newSortOrder AND sort_order < :oldSortOrder",
          {
            newSortOrder,
            oldSortOrder
          }
        )
        .andWhere("categoryId != :categoryId", { categoryId })
        .andWhere("is_active = :isActive", { isActive: true })
        .execute();

    }

    else {

      await categoryRepository
        .createQueryBuilder()
        .update()
        .set({
          sort_order: () => "sort_order - 1"
        })
        .where(
          "sort_order <= :newSortOrder AND sort_order > :oldSortOrder",
          {
            newSortOrder,
            oldSortOrder
          }
        )
        .andWhere("categoryId != :categoryId", { categoryId })
        .execute();
    }
  }

  await categoryRepository.update(categoryId, {
    categoryName: body.categoryName,
    slug: body.slug,
    sort_order: newSortOrder,
    updated_by: userId,
  });

  return await categoryRepository.findOne({
    where: { categoryId },
  });
};
export const deleteCategory = async (categoryId: number) => {

  const category = await categoryRepository.findOne({
    where: {
      categoryId,
      is_active: true
    }
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const deletedSortOrder = category.sort_order;

  await categoryRepository.update(categoryId, {
    is_active: false,
  });

  await categoryRepository
    .createQueryBuilder()
    .update()
    .set({
      sort_order: () => "sort_order - 1"
    })
    .where("sort_order > :deletedSortOrder", {
      deletedSortOrder
    })
    .andWhere("is_active = :isActive", {
      isActive: true
    })
    .execute();

  return true;
};
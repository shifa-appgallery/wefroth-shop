import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";

const categoryRepository = AppDataSource.getRepository(Category);

export const createCategory = async (
  body: any,
  userId: number
) => {

  const existingCategory = await categoryRepository.findOne({
    where: {
      categoryName: body.categoryName,
      slug: body.slug,
    },
  });

  if (existingCategory && !existingCategory.is_active) {

    existingCategory.categoryName = body.categoryName ?? existingCategory.categoryName;
    existingCategory.slug = body.slug ?? existingCategory.slug;
    existingCategory.level = body.parent ? 2 : 1;
    existingCategory.parent = body.parent
      ? ({ categoryId: body.parent } as any)
      : null;

    existingCategory.sort_order = body.sort_order || 0;

    existingCategory.is_active = true;

    existingCategory.updated_by = userId;

    existingCategory.categoryIcon = body.categoryIcon ?? existingCategory.categoryIcon

    return await categoryRepository.save(existingCategory);
  }

  if (existingCategory && existingCategory.is_active) {
    throw new Error("Category already exists");
  }

  // Create new category
  const category = categoryRepository.create({
    categoryName: body.categoryName,
    slug: body.slug,
    level: body.parent ? 2 : 1,
    parent: body.parent
      ? { categoryId: body.parent }
      : null,
    sort_order: body.sort_order || 0,
    is_active: true,
    created_by: userId,
    categoryIcon: body.categoryIcon
  });

  return await categoryRepository.save(category);
};
export const getCategories = async (
  isActive?: boolean
) => {

  const query = categoryRepository
    .createQueryBuilder("category")
    .leftJoinAndSelect(
      "category.parent",
      "parent"
    )
    .leftJoinAndSelect(
      "category.children",
      "children",
      isActive !== undefined
        ? "children.is_active = :isActive"
        : "",
      { isActive }
    );

  if (isActive !== undefined) {
    query.where(
      "category.is_active = :isActive",
      { isActive }
    );
  }

  query.orderBy(
    "category.sort_order",
    "ASC"
  );

  return await query.getMany();
};

export const updateCategory = async (
  categoryId: number,
  body: any,
  userId: number
) => {

  const existingCategory = await categoryRepository.findOne({
    where: { categoryId },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const oldSortOrder = existingCategory.sort_order;

  const newSortOrder =
    body.sort_order ?? oldSortOrder;

  // Handle sort order update
  if (oldSortOrder !== newSortOrder) {

    // Moving up
    if (newSortOrder < oldSortOrder) {

      await categoryRepository
        .createQueryBuilder()
        .update()
        .set({
          sort_order: () => `"sort_order" + 1`,
        })
        .where(
          `"sort_order" >= :newSortOrder 
           AND "sort_order" < :oldSortOrder`,
          {
            newSortOrder,
            oldSortOrder,
          }
        )
        .andWhere(
          `"categoryId" != :categoryId`,
          { categoryId }
        )
        .andWhere(`is_active = true`)
        .execute();

    }

    // Moving down
    else {

      await categoryRepository
        .createQueryBuilder()
        .update()
        .set({
          sort_order: () => `"sort_order" - 1`,
        })
        .where(
          `"sort_order" <= :newSortOrder 
           AND "sort_order" > :oldSortOrder`,
          {
            newSortOrder,
            oldSortOrder,
          }
        )
        .andWhere(
          `"categoryId" != :categoryId`,
          { categoryId }
        )
        .andWhere(`is_active = true`)
        .execute();
    }
  }

  // Update category
  await categoryRepository.update(categoryId, {

    categoryName:
      body.categoryName ??
      existingCategory.categoryName,

    slug:
      body.slug ??
      existingCategory.slug,

    categoryIcon:
      body.categoryIcon ??
      existingCategory.categoryIcon,

    sort_order: newSortOrder,

    updated_by: userId,
  });

  return await categoryRepository.findOne({
    where: { categoryId },
    relations: ["parent", "children"],
  });
};


export const updateCategoryStatus = async (
  categoryId: number,
  isActive: boolean,
  userId: number
) => {

  const category = await categoryRepository.findOne({
    where: {
      categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category.is_active === isActive) {
    throw new Error(
      `Category is already ${isActive ? "active" : "inactive"
      }`
    );
  }

  if (!isActive) {

    const deletedSortOrder = category.sort_order;

    await categoryRepository
      .createQueryBuilder()
      .update()
      .set({
        sort_order: () => `"sort_order" - 1`,
      })
      .where(`"sort_order" > :deletedSortOrder`, {
        deletedSortOrder,
      })
      .andWhere(`is_active = true`)
      .execute();
  }

  if (isActive) {

    const maxSortOrder = await categoryRepository
      .createQueryBuilder("category")
      .select("MAX(category.sort_order)", "max")
      .where("category.is_active = true")
      .getRawOne();

    category.sort_order =
      (maxSortOrder?.max || 0) + 1;
  }

  category.is_active = isActive;

  category.updated_by = userId;

  await categoryRepository.save(category);

  return category;
};
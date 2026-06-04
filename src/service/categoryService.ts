import { AppDataSource } from "../config/data-source";
import { CategoryType } from "../constants/enums";
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
    existingCategory.type = body.type ?? existingCategory.type

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
    categoryIcon: body.categoryIcon,
    type: body.type ?? CategoryType.ALL
  });

  return await categoryRepository.save(category);
};

export const getCategories = async (
  isActive?: boolean,
  type?: string,
  isAdmin: boolean = false
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
    )

    // CATEGORY PRODUCTS
    .leftJoin(
      "category.products",
      "product"
    )

    // CHILD CATEGORY PRODUCTS
    .leftJoin(
      "children.products",
      "childProduct"
    )

    // PRODUCT GENDER
    .leftJoin(
      "product.gender",
      "gender"
    )

    // CHILD PRODUCT GENDER
    .leftJoin(
      "childProduct.gender",
      "childGender"
    );

  if (isActive !== undefined) {

    query.where(
      "category.is_active = :isActive",
      { isActive }
    );
  }

  // GENDER FILTER
  if (
    type &&
    type !== "ALL"
  ) {

    query.andWhere(`
      (
        LOWER(gender.name) = LOWER(:type)
        OR
        LOWER(childGender.name) = LOWER(:type)
      )
    `, { type });
  }

  // FOR USER: ONLY CATEGORIES HAVING PRODUCTS
  if (!isAdmin) {
    query.andWhere(`
    (
      product.productId IS NOT NULL
      OR
      childProduct.productId IS NOT NULL
    )
  `);
  }

  query
    .orderBy(
      "category.sort_order",
      "ASC"
    )
    .distinct(true);

  const categories =
    await query.getMany();

  // REMOVE EMPTY CHILDREN
  const filteredCategories = categories.map((category: any) => {

    if (!isAdmin) {
      category.children = category.children.filter(
        (child: any) =>
          categories.some(
            (cat: any) =>
              cat.categoryId === child.categoryId
          )
      );
    }

    return category;
  });

  return filteredCategories;
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

  // Update selected category at last
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

    type: body.type ?? existingCategory.type,

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

export const updateCategoryOrder = async (
  data: any[],
  userId: number
) => {

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid data");
  }

  // Optional validation
  for (const item of data) {

    if (!item.categoryId || item.sort_order == null) {
      throw new Error(
        "categoryId and sort_order are required"
      );
    }
  }

  // Update all categories
  await Promise.all(

    data.map(async (item) => {

      await categoryRepository.update(
        item.categoryId,
        {
          sort_order: item.sort_order,
          updated_by: userId,
        }
      );
    })
  );

  return await categoryRepository.find({
    order: {
      sort_order: "ASC",
    },
  });
};
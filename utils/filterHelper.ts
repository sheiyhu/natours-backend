export abstract class filterHelper {
  public static filter(query: any, filterOptions: any) {
    const filterObj = { ...filterOptions };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete filterObj[el]);

    let filterStr = JSON.stringify(filterObj);
    filterStr = filterStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    return query.find(JSON.parse(filterStr));
  }

  public static sorting(query: any, filterOptions: any) {
    return filterOptions.sort
      ? query.sort(filterOptions.sort.split(',').join(' '))
      : query.sort('-createdAt');
  }

  public static fieldLimit(query: any, filterOptions: any) {
    return filterOptions.fields
      ? query.select(filterOptions.fields.split(',').join(' '))
      : query.select('-__v');
  }

  public static pagination(query: any, filterOptions: any) {
    const page = filterOptions.page * 1 || 1;
    const limit = filterOptions.limit * 1 || 50;
    const skip = (page - 1) * limit;

    return query.skip(skip).limit(limit);
  }

  public static buildQuery(query: any, filterOptions: any) {
    const filter = this.filter(query, filterOptions);
    const sort = this.sorting(filter, filterOptions);
    const limit = this.fieldLimit(sort, filterOptions);
    const pagination = this.pagination(limit, filterOptions);
    return pagination;
  }
}

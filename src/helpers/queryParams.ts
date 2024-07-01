export const extractResourceSearchQueryParams = <T>(req: Req) => {
  const page = Number(req.query.page) - 1;
  const itemsPerPage = Number(req.query.items_per_page) || 20;
  const search = req.query.search as string;
  const sortColumn = req.query.sort_column as keyof T;
  const sortDirection = req.query.sort_direction as SortDirection;

  let orderBy;
  if (sortColumn && (sortColumn as string).includes(".")) {
    orderBy = {};
    const elements = (sortColumn as string).split(".");
    let prev = orderBy;
    elements.forEach((el, i) => {
      // @ts-ignore
      if (elements[i + 1]) prev[el] = {};
      // @ts-ignore
      else prev[el] = sortDirection;
      // @ts-ignore
      prev = prev[el];
    });
  }

  if (sortColumn && !orderBy) orderBy = { [sortColumn]: sortDirection };

  return { page, itemsPerPage, search, orderBy };
};

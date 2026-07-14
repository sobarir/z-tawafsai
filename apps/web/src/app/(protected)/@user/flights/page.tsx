import { requireUser } from '@/features/auth/rbac/require';
import { SearchPageContent } from '@/features/flight-search/search-page-content';

const SearchPage = async () => {
  await requireUser();
  return <SearchPageContent />;
};

export default SearchPage;

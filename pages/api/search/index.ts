import  {  NextApiResponse , NextApiRequest } from 'next/types';
import database from '../../../pages/lib/search/database.json';
import { ISearchData } from '../../../pages/lib/search/types';

interface IApiSearchRequest extends NextApiRequest {
  body: { searchTerm?: string };
}

export type IApiSearchResponseData = ISearchData[];

export default function handler(
  req: IApiSearchRequest,
  res: NextApiResponse<IApiSearchResponseData>
) {
  const {
    body: { searchTerm },
  } = req;

  if (req.method === 'POST' && searchTerm && searchTerm.length > 0) {
    // Creates a regex search pattern for a case insensitive match from the user's search term
    const searchPattern = new RegExp(searchTerm, 'i');

    const filteredResults = database.filter((result) => {
      return (
        // Check the user's search term again either the title or the text of the database entry
        searchPattern.test(result.title) || searchPattern.test(result.text)
      );
    });
    res.status(200).json(filteredResults);
  } else {
    res.status(400).json([]);
  }
}
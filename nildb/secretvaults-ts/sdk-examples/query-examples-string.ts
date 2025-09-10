// Query that finds a specific contact by name and returns their ID
// This demonstrates exact matching on unencrypted fields
export const findContactByNameQuery = {
  _id: '',
  name: 'Find Contact by Exact Name',
  collection: '',
  variables: {
    name: {
      description: 'The exact name to search for',
      path: '$.pipeline[0].$match.name',
    },
  },
  pipeline: [
    {
      $match: {
        name: '', // Matching on unencrypted field works
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ],
};

// Query that counts all contacts in the collection
// This demonstrates basic aggregation without relying on encrypted fields
export const countAllContactsQuery = {
  _id: '',
  name: 'Count Total Contacts',
  collection: '',
  variables: {},
  pipeline: [
    {
      $count: 'total_contacts',
    },
  ],
};

// Query that searches contacts by partial name match
export const searchContactsByPartialNameQuery = {
  _id: '',
  name: 'Search Contacts by Partial Name',
  collection: '',
  variables: {
    searchTerm: {
      description: 'Partial name to search for',
      path: '$.pipeline[0].$match.name.$regex',
    },
  },
  pipeline: [
    {
      $match: {
        name: { $regex: '', $options: 'i' },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ],
};

// Query that sorts contacts alphabetically and limits results
export const getContactsAlphabeticallyQuery = {
  _id: '',
  name: 'Get Contacts Alphabetically with Limit',
  collection: '',
  variables: {
    limit: {
      description: 'Maximum number of results to return',
      path: '$.pipeline[1].$limit',
    },
  },
  pipeline: [
    {
      $sort: { name: 1 }, // 1 for ascending, -1 for descending
    },
    {
      $limit: 3,
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ],
};

// Query that gets contacts with specific fields only (demonstrating field exclusion)
export const getContactsWithoutSensitiveDataQuery = {
  _id: '',
  name: 'Get Contacts Without Phone Numbers',
  collection: '',
  variables: {},
  pipeline: [
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ],
};

// Query that checks if a name exists (returns count)
export const checkIfNameExistsQuery = {
  _id: '',
  name: 'Check If Name Exists',
  collection: '',
  variables: {
    nameToCheck: {
      description: 'The name to check for existence',
      path: '$.pipeline[0].$match.name',
    },
  },
  pipeline: [
    {
      $match: {
        name: '',
      },
    },
    {
      $count: 'exists',
    },
  ],
};

// Query that demonstrates filtering with name patterns only
export const findContactsWithNamePatternsQuery = {
  _id: '',
  name: 'Find Contacts with Multiple Name Patterns',
  collection: '',
  variables: {
    firstNamePattern: {
      description: 'First name pattern to match',
      path: '$.pipeline[0].$match.$and[0].name.$regex',
    },
    lastNamePattern: {
      description: 'Last name pattern to match',
      path: '$.pipeline[0].$match.$and[1].name.$regex',
    },
  },
  pipeline: [
    {
      $match: {
        $and: [
          { name: { $regex: '', $options: 'i' } }, // e.g., '^[A-Z]' for starts with capital
          { name: { $regex: '', $options: 'i' } }, // e.g., 'son$' for ends with 'son'
        ],
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ],
};

// Query that demonstrates skip and limit for pagination
export const getPaginatedContactsQuery = {
  _id: '',
  name: 'Get Paginated Contacts',
  collection: '',
  variables: {
    page: {
      description: 'Page number (0-based)',
      path: '$.pipeline[0].$skip',
    },
    pageSize: {
      description: 'Number of items per page',
      path: '$.pipeline[1].$limit',
    },
  },
  pipeline: [
    {
      $skip: 0, // Will be replaced with page * pageSize
    },
    {
      $limit: 2,
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ],
};

// Query that gets the most recent N contacts
export const getRecentContactsQuery = {
  _id: '',
  name: 'Get Most Recent Contacts',
  collection: '',
  variables: {
    limit: {
      description: 'Number of recent contacts to return',
      path: '$.pipeline[1].$limit',
    },
  },
  pipeline: [
    {
      $sort: { _id: -1 }, // Sort by _id descending (most recent first)
    },
    {
      $limit: 3,
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ],
};

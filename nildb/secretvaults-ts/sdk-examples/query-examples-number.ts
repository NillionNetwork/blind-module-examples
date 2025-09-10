// Age-based query examples for the contact collection

// Query to find contacts by exact age
export const findContactsByExactAgeQuery = {
  _id: '',
  name: 'Find Contacts by Exact Age',
  collection: '',
  variables: {
    age: {
      description: 'The exact age to search for',
      path: '$.pipeline[0].$match.age',
    },
  },
  pipeline: [
    {
      $match: {
        age: 0, // Will be replaced with variable
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        age: 1,
      },
    },
  ],
};

// Query to find contacts within an age range
export const findContactsByAgeRangeQuery = {
  _id: '',
  name: 'Find Contacts by Age Range',
  collection: '',
  variables: {
    minAge: {
      description: 'Minimum age (inclusive)',
      path: '$.pipeline[0].$match.age.$gte',
    },
    maxAge: {
      description: 'Maximum age (inclusive)',
      path: '$.pipeline[0].$match.age.$lte',
    },
  },
  pipeline: [
    {
      $match: {
        age: {
          $gte: 0, // Will be replaced with minAge
          $lte: 0, // Will be replaced with maxAge
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        age: 1,
      },
    },
  ],
};

// Query to find contacts older than a certain age
export const findContactsOlderThanQuery = {
  _id: '',
  name: 'Find Contacts Older Than',
  collection: '',
  variables: {
    minAge: {
      description: 'Minimum age (exclusive)',
      path: '$.pipeline[0].$match.age.$gt',
    },
  },
  pipeline: [
    {
      $match: {
        age: { $gt: 0 }, // Will be replaced with variable
      },
    },
    {
      $sort: { age: 1 }, // Sort by age ascending
    },
    {
      $project: {
        _id: 1,
        name: 1,
        age: 1,
      },
    },
  ],
};

// Query to find contacts younger than a certain age
export const findContactsYoungerThanQuery = {
  _id: '',
  name: 'Find Contacts Younger Than',
  collection: '',
  variables: {
    maxAge: {
      description: 'Maximum age (exclusive)',
      path: '$.pipeline[0].$match.age.$lt',
    },
  },
  pipeline: [
    {
      $match: {
        age: { $lt: 0 }, // Will be replaced with variable
      },
    },
    {
      $sort: { age: -1 }, // Sort by age descending
    },
    {
      $project: {
        _id: 1,
        name: 1,
        age: 1,
      },
    },
  ],
};

// Query to calculate average age
export const calculateAverageAgeQuery = {
  _id: '',
  name: 'Calculate Average Age',
  collection: '',
  variables: {},
  pipeline: [
    {
      $group: {
        _id: null,
        averageAge: { $avg: '$age' },
        totalContacts: { $sum: 1 },
      },
    },
  ],
};

// Query to group contacts by age ranges
export const groupContactsByAgeRangeQuery = {
  _id: '',
  name: 'Group Contacts by Age Range',
  collection: '',
  variables: {},
  pipeline: [
    {
      $bucket: {
        groupBy: '$age',
        boundaries: [0, 18, 30, 50, 65, 100], // age ranges: 0-17, 18-29, 30-49, 50-64, 65+
        default: 'Unknown',
        output: {
          count: { $sum: 1 },
          names: { $push: '$name' },
        },
      },
    },
  ],
};

// Query to find the oldest and youngest contacts
export const findOldestAndYoungestQuery = {
  _id: '',
  name: 'Find Oldest and Youngest Contacts',
  collection: '',
  variables: {},
  pipeline: [
    {
      $group: {
        _id: null,
        oldestAge: { $max: '$age' },
        youngestAge: { $min: '$age' },
        totalContacts: { $sum: 1 },
      },
    },
  ],
};

// Query to sort contacts by age with pagination
export const getContactsByAgeWithPaginationQuery = {
  _id: '',
  name: 'Get Contacts Sorted by Age with Pagination',
  collection: '',
  variables: {
    page: {
      description: 'Page number (0-based)',
      path: '$.pipeline[1].$skip',
    },
    pageSize: {
      description: 'Number of items per page',
      path: '$.pipeline[2].$limit',
    },
    sortOrder: {
      description: 'Sort order: 1 for ascending, -1 for descending',
      path: '$.pipeline[0].$sort.age',
    },
  },
  pipeline: [
    {
      $sort: { age: 1 }, // Will be replaced with sortOrder variable
    },
    {
      $skip: 0, // Will be replaced with page * pageSize
    },
    {
      $limit: 10, // Will be replaced with pageSize
    },
    {
      $project: {
        _id: 1,
        name: 1,
        age: 1,
      },
    },
  ],
};

// Query to find contacts with missing age data
export const findContactsWithMissingAgeQuery = {
  _id: '',
  name: 'Find Contacts with Missing Age',
  collection: '',
  variables: {},
  pipeline: [
    {
      $match: {
        $or: [
          { age: { $exists: false } },
          { age: null },
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

// Query to calculate age statistics
export const calculateAgeStatisticsQuery = {
  _id: '',
  name: 'Calculate Age Statistics',
  collection: '',
  variables: {},
  pipeline: [
    {
      $match: {
        age: { $exists: true, $ne: null }, // Only include contacts with age
      },
    },
    {
      $group: {
        _id: null,
        averageAge: { $avg: '$age' },
        minAge: { $min: '$age' },
        maxAge: { $max: '$age' },
        totalWithAge: { $sum: 1 },
        standardDeviation: { $stdDevPop: '$age' },
      },
    },
  ],
};
// Additional interesting query examples combining string and number fields

// Query to find contacts with names starting with a letter and specific age
export const findContactsByInitialAndAgeQuery = {
  _id: '',
  name: 'Find Contacts by Name Initial and Age',
  collection: '',
  variables: {
    initial: {
      description: 'First letter of name (case-insensitive)',
      path: '$.pipeline[0].$match.$and[0].name.$regex',
    },
    age: {
      description: 'Exact age to match',
      path: '$.pipeline[0].$match.$and[1].age',
    },
  },
  pipeline: [
    {
      $match: {
        $and: [
          { name: { $regex: '^A', $options: 'i' } }, // Will be replaced with ^${initial}
          { age: 0 }, // Will be replaced with age variable
        ],
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

// Query to get age distribution with names
export const getAgeDistributionWithNamesQuery = {
  _id: '',
  name: 'Get Age Distribution with Names',
  collection: '',
  variables: {},
  pipeline: [
    {
      $group: {
        _id: '$age',
        count: { $sum: 1 },
        names: { $push: '$name' },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by age
    },
  ],
};

// Query to find contacts with names containing multiple words
export const findContactsWithMultiWordNamesQuery = {
  _id: '',
  name: 'Find Contacts with Multi-Word Names',
  collection: '',
  variables: {},
  pipeline: [
    {
      $match: {
        name: { $regex: '\\s', $options: 'i' }, // Contains whitespace
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

// Query to find duplicate names
export const findDuplicateNamesQuery = {
  _id: '',
  name: 'Find Duplicate Names',
  collection: '',
  variables: {},
  pipeline: [
    {
      $group: {
        _id: '$name',
        count: { $sum: 1 },
        ids: { $push: '$_id' },
        ages: { $push: '$age' },
      },
    },
    {
      $match: {
        count: { $gt: 1 }, // More than one occurrence
      },
    },
    {
      $sort: { count: -1 }, // Most duplicates first
    },
  ],
};

// Query to rank contacts by age (add ranking)
export const rankContactsByAgeQuery = {
  _id: '',
  name: 'Rank Contacts by Age',
  collection: '',
  variables: {},
  pipeline: [
    {
      $sort: { age: -1 }, // Sort by age descending
    },
    {
      $group: {
        _id: null,
        contacts: {
          $push: {
            name: '$name',
            age: '$age',
            id: '$_id',
          },
        },
      },
    },
    {
      $unwind: {
        path: '$contacts',
        includeArrayIndex: 'rank',
      },
    },
    {
      $project: {
        _id: '$contacts.id',
        name: '$contacts.name',
        age: '$contacts.age',
        rank: { $add: ['$rank', 1] }, // 1-based ranking
      },
    },
  ],
};

// Query to find contacts within N years of a target age
export const findContactsNearAgeQuery = {
  _id: '',
  name: 'Find Contacts Near Target Age',
  collection: '',
  variables: {
    targetAge: {
      description: 'Target age to search around',
      path: '$.pipeline[0].$addFields.ageDiff.$abs.$subtract[1]',
    },
    maxDifference: {
      description: 'Maximum age difference allowed',
      path: '$.pipeline[1].$match.ageDiff.$lte',
    },
  },
  pipeline: [
    {
      $addFields: {
        ageDiff: {
          $abs: {
            $subtract: ['$age', 0], // Will be replaced with targetAge
          },
        },
      },
    },
    {
      $match: {
        ageDiff: { $lte: 0 }, // Will be replaced with maxDifference
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        age: 1,
        ageDifference: '$ageDiff',
      },
    },
    {
      $sort: { ageDifference: 1 }, // Closest ages first
    },
  ],
};

// Query to calculate median age
export const calculateMedianAgeQuery = {
  _id: '',
  name: 'Calculate Median Age',
  collection: '',
  variables: {},
  pipeline: [
    {
      $sort: { age: 1 },
    },
    {
      $group: {
        _id: null,
        ages: { $push: '$age' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        medianAge: {
          $cond: {
            if: { $eq: [{ $mod: ['$count', 2] }, 0] },
            // Even count: average of two middle values
            then: {
              $avg: [
                { $arrayElemAt: ['$ages', { $divide: ['$count', 2] }] },
                { $arrayElemAt: ['$ages', { $subtract: [{ $divide: ['$count', 2] }, 1] }] },
              ],
            },
            // Odd count: middle value
            else: {
              $arrayElemAt: ['$ages', { $floor: { $divide: ['$count', 2] } }],
            },
          },
        },
        totalContacts: '$count',
      },
    },
  ],
};

// Query to find contacts with longest/shortest names
export const findContactsByNameLengthQuery = {
  _id: '',
  name: 'Find Contacts by Name Length',
  collection: '',
  variables: {
    lengthType: {
      description: 'Type: "longest" or "shortest"',
      path: '$.pipeline[1].$sort.nameLength',
    },
    limit: {
      description: 'Number of results to return',
      path: '$.pipeline[2].$limit',
    },
  },
  pipeline: [
    {
      $addFields: {
        nameLength: { $strLenCP: '$name' },
      },
    },
    {
      $sort: { nameLength: -1 }, // -1 for longest, 1 for shortest
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 1,
        name: 1,
        age: 1,
        nameLength: 1,
      },
    },
  ],
};

// Query to get contacts grouped by first letter of name
export const groupContactsByFirstLetterQuery = {
  _id: '',
  name: 'Group Contacts by First Letter',
  collection: '',
  variables: {},
  pipeline: [
    {
      $addFields: {
        firstLetter: { $toUpper: { $substr: ['$name', 0, 1] } },
      },
    },
    {
      $group: {
        _id: '$firstLetter',
        count: { $sum: 1 },
        contacts: {
          $push: {
            name: '$name',
            age: '$age',
          },
        },
      },
    },
    {
      $sort: { _id: 1 }, // Alphabetical order
    },
  ],
};

// Query to find contacts with age as prime number
export const findContactsWithPrimeAgeQuery = {
  _id: '',
  name: 'Find Contacts with Prime Number Ages',
  collection: '',
  variables: {},
  pipeline: [
    {
      $match: {
        $expr: {
          $in: [
            '$age',
            [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97],
          ],
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
    {
      $sort: { age: 1 },
    },
  ],
};

// Query to sample random contacts
export const getRandomContactsQuery = {
  _id: '',
  name: 'Get Random Contacts Sample',
  collection: '',
  variables: {
    sampleSize: {
      description: 'Number of random contacts to return',
      path: '$.pipeline[0].$sample.size',
    },
  },
  pipeline: [
    {
      $sample: {
        size: 3, // Will be replaced with variable
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

// Query to find contacts whose age matches name length
export const findContactsAgeMatchesNameLengthQuery = {
  _id: '',
  name: 'Find Contacts Where Age Matches Name Length',
  collection: '',
  variables: {},
  pipeline: [
    {
      $addFields: {
        nameLength: { $strLenCP: '$name' },
      },
    },
    {
      $match: {
        $expr: { $eq: ['$age', '$nameLength'] },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        age: 1,
        nameLength: 1,
      },
    },
  ],
};
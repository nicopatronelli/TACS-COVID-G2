const { inspect } = require('util');

const logger = require('../logger');
const {
  Country,
  sequelizePackage: { Op, literal },
  CountryByList,
  List,
  User
} = require('../models');
const { deleteUndefined } = require('../utils/objects');
const { databaseError, notFound } = require('../errors/builders');

exports.getAllCountries = params => {
  logger.info(`Attempting to get countries with params: ${inspect(params)}`);
  const filters = {
    iso2: params.isocode2 && { [Op.iLike]: `%${params.isocode2}%` },
    iso3: params.isocode3 && { [Op.iLike]: `%${params.isocode3}%` },
    name: params.name && { [Op.iLike]: `%${params.name}%` }
  };
  const sequelizeOptions = {
    where: deleteUndefined(filters),
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: params.orderColumn ? [[params.orderColumn, params.orderType || 'ASC']] : undefined
  };
  return Country.findAndCountAll(sequelizeOptions).catch(err => {
    /* istanbul ignore next */
    logger.error(inspect(err));
    /* istanbul ignore next */
    throw databaseError(`Error getting countries, reason: ${err.message}`);
  });
};

exports.getCountry = filters => {
  logger.info(`Attempting to get country with filters: ${inspect(filters)}`);
  return Country.findByPk(filters.id).catch(error => {
    /* istanbul ignore next */
    logger.error(inspect(error));
    /* istanbul ignore next */
    throw databaseError(`There was an error getting country: ${error.message}`);
  });
};

exports.getCountryBy = params => {
  logger.info(`Attempting to get country with params: ${inspect(params)}`);
  const filters = {
    name: params.name && { [Op.iLike]: `%${params.name}%` }
  };
  const sequelizeOptions = {
    where: filters
  };
  return Country.findAndCountAll(sequelizeOptions).catch(err => {
    /* istanbul ignore next */
    logger.error(inspect(err));
    /* istanbul ignore next */
    throw databaseError(`Error getting country, reason: ${err.message}`);
  });
};

exports.getCountryWithList = filters => {
  logger.info(`Attempting to get country with filters: ${inspect(filters)}`);
  return Country.findOne({
    where: { id: filters.id },
    include: [
      {
        model: List,
        as: 'lists',
        where: { userId: filters.userId }
      }
    ]
  }).catch(error => {
    /* istanbul ignore next */
    logger.error(inspect(error));
    /* istanbul ignore next */
    throw databaseError(`There was an error getting country: ${error.message}`);
  });
};

exports.getCountryBy = params => {
  logger.info(`Attempting to get country with params: ${inspect(params)}`);
  const filters = {
    name: params.name && { [Op.iLike]: `%${params.name}%` }
  };
  const sequelizeOptions = {
    where: filters
  };
  return Country.findAndCountAll(sequelizeOptions).catch(err => {
    /* istanbul ignore next */
    logger.error(inspect(err));
    throw databaseError(`Error getting country, reason: ${err.message}`);
  });
};

exports.getCountriesInList = filters => {
  logger.info(`Attempting to get countries with filters: ${inspect(filters)}`);
  return Country.findAll({
    include: [
      {
        model: CountryByList,
        as: 'listByCountry',
        on: literal(
          `"listByCountry"."country_id" = "Country"."id" AND "listByCountry"."list_id" IN (${filters.listIds})`
        ),
        attributes: []
      }
    ],
    group: ['Country.id'],
    having: literal(`count(*) = ${filters.listIds.length}`)
  }).catch(error => {
    /* istanbul ignore next */
    logger.error(inspect(error));
    /* istanbul ignore next */
    throw databaseError(`There was an error getting countries: ${error.message}`);
  });
};

exports.getInterestedByCountry = id => {
  logger.info(`Attempting to check if exist the country with id: ${id}`);
  return Country.count({ where: { id } })
    .catch(error => {
      /* istanbul ignore next */
      logger.error(inspect(error));
      /* istanbul ignore next */
      throw databaseError(`There was an error checking if exist the country, reason: ${error.message}`);
    })
    .then(count => {
      if (!count) throw notFound('The provided country was not found');
      return CountryByList.count({
        where: { countryId: id },
        include: [
          {
            model: List,
            as: 'list',
            include: [
              {
                model: User,
                as: 'user'
              }
            ]
          }
        ],
        group: ['"list->user"."id"'],
        subQuery: false
      })
        .catch(error => {
          /* istanbul ignore next */
          logger.error(inspect(error));
          /* istanbul ignore next */
          throw databaseError(`There was an error getting interested: ${error.message}`);
        })
        .then(amount => amount.length);
    });
};

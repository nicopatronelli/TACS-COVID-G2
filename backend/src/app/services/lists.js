const { inspect } = require('util');

const logger = require('../logger');
const { List, CountryByList, sequelizeInstance, Country } = require('../models');
const { databaseError, notFound, invalidCountries } = require('../errors/builders');
const { getCountry } = require('./countries');

const getCountriesToDeleteAndCreate = (list, attributes) => {
  const countriesByListToDelete = list.countryByList.filter(
    countryByList => !attributes.countriesIds.includes(countryByList.countryId)
  );
  const countriesByListToKeep = list.countryByList.filter(countryByList =>
    attributes.countriesIds.includes(countryByList.countryId)
  );
  const countriesIdsToKeep = countriesByListToKeep.map(countryByList => countryByList.countryId);
  const countriesIdsToCreate = attributes.countriesIds.filter(
    countryId => !countriesIdsToKeep.includes(countryId)
  );
  const countriesByListToCreate = countriesIdsToCreate.map(countryId => ({
    listId: attributes.id,
    countryId
  }));
  return { countriesByListToDelete, countriesByListToCreate };
};

exports.getAllList = filters => {
  logger.info(`Attempting to get lists with filters: ${inspect(filters)}`);
  return List.findAndCountAll({
    where: {
      userId: filters.userId
    },
    offset: (filters.page - 1) * filters.limit,
    limit: filters.limit,
    order: filters.orderColumn ? [[filters.orderColumn, filters.orderType || 'ASC']] : undefined
  }).catch(err => {
    /* istanbul ignore next */
    logger.error(inspect(err));
    /* istanbul ignore next */
    throw databaseError(`There was an error getting the lists: ${err.message}`);
  });
};

exports.getList = (filters, options = {}) => {
  logger.info(`Attempting to get list with filters: ${inspect(filters)}`);
  return List.findOne({
    where: {
      id: filters.id,
      userId: filters.userId
    },
    ...options
  }).catch(err => {
    /* istanbul ignore next */
    logger.error(inspect(err));
    /* istanbul ignore next */
    throw databaseError(`There was an error getting the list: ${err.message}`);
  });
};

exports.getListWithCountries = filters =>
  this.getList(filters, {
    include: [
      {
        model: Country,
        as: 'countries'
      }
    ]
  });

exports.deleteList = filters => {
  logger.info(`Attempting to delete list with filters: ${inspect(filters)}`);
  return this.getListWithCountries(filters).then(list => {
    if (!list) {
      throw notFound('The list was not found');
    }
    return sequelizeInstance
      .transaction(transaction =>
        Promise.all(
          list.countries.map(({ CountryByList: countryByList }) => countryByList.destroy({ transaction }))
        ).then(() => list.destroy({ transaction }))
      )
      .catch(err => {
        /* istanbul ignore next */
        logger.error(inspect(err));
        /* istanbul ignore next */
        throw databaseError(`There was an error deleting the list: ${err.message}`);
      });
  });
};

exports.createList = attributes => {
  logger.info(`Attempting to create list with attributes: ${inspect(attributes)}`);
  return Country.count({ where: { id: attributes.countriesIds } })
    .catch(err => {
      /* istanbul ignore next */
      logger.error(inspect(err));
      /* istanbul ignore next */
      throw databaseError(`There was an error verifying the countries: ${err.message}`);
    })
    .then(count => {
      if (attributes.countriesIds.length !== count) throw invalidCountries();
      return sequelizeInstance
        .transaction(transaction =>
          List.create(attributes, { transaction }).then(({ id: listId }) => {
            const countriesByListPromises = attributes.countriesIds.map(countryId =>
              CountryByList.create({ countryId, listId }, { transaction })
            );
            return Promise.all([countriesByListPromises]);
          })
        )
        .catch(err => {
          /* istanbul ignore next */
          logger.error(inspect(err));
          /* istanbul ignore next */
          throw databaseError(`There was an error creating the list: ${err.message}`);
        });
    });
};

exports.updateList = attributes => {
  logger.info(`Attempting to update list with attributes: ${inspect(attributes)}`);
  const options = { include: [{ model: CountryByList, as: 'countryByList' }] };
  return this.getList(attributes, options).then(list => {
    if (!list) {
      throw notFound('The list was not found');
    }
    return Country.count({ where: { id: attributes.countriesIds } })
      .catch(err => {
        /* istanbul ignore next */
        logger.error(inspect(err));
        /* istanbul ignore next */
        throw databaseError(`There was an error verifying the countries: ${err.message}`);
      })
      .then(count => {
        if (attributes.countriesIds.length !== count) throw invalidCountries();
        return sequelizeInstance
          .transaction(transaction => {
            const { countriesByListToDelete, countriesByListToCreate } = getCountriesToDeleteAndCreate(
              list,
              attributes
            );
            return Promise.all([
              ...countriesByListToDelete.map(countryByList => countryByList.destroy({ transaction })),
              CountryByList.bulkCreate(countriesByListToCreate, { transaction })
            ]);
          })
          .catch(err => {
            /* istanbul ignore next */
            logger.error(inspect(err));
            /* istanbul ignore next */
            throw databaseError(`There was an error updating the list: ${err.message}`);
          });
      });
  });
};

exports.getCountriesByList = filters => {
  logger.info(`Attempting to get countries with filters: ${inspect(filters)}`);
  return this.getList(filters).then(list => {
    if (!list) {
      throw notFound('The list was not found');
    }
    return CountryByList.findAndCountAll({
      where: {
        listId: filters.id
      },
      offset: (filters.page - 1) * filters.limit,
      limit: filters.limit,
      order: filters.orderColumn ? [[filters.orderColumn, filters.orderType || 'ASC']] : undefined,
      include: [{ model: Country, as: 'country' }]
    })
      .then(countriesByList => ({
        rows: countriesByList.rows.map(countryByList => countryByList.country).filter(country => country),
        count: countriesByList.count
      }))
      .catch(err => {
        /* istanbul ignore next */
        logger.error(inspect(err));
        /* istanbul ignore next */
        throw databaseError(`There was an error getting countries of the list: ${err.message}`);
      });
  });
};

exports.createCountriesByList = attributes => {
  logger.info(`Attempting to create countries by list with attributes: ${inspect(attributes)}`);
  return this.getList(attributes).then(list => {
    if (!list) {
      throw notFound('The list was not found');
    }
    return getCountry({ id: attributes.countryId }).then(country => {
      if (!country) {
        throw notFound('The country was not found');
      }
      return CountryByList.create({
        countryId: attributes.countryId,
        listId: attributes.id
      }).catch(err => {
        /* istanbul ignore next */
        logger.error(inspect(err));
        /* istanbul ignore next */
        throw databaseError(`There was an error creating country of the list: ${err.message}`);
      });
    });
  });
};

exports.deleteCountriesByList = attributes => {
  logger.info(`Attempting to delete countries by list with attributes: ${inspect(attributes)}`);
  return this.getList(attributes).then(list => {
    if (!list) {
      throw notFound('The list was not found');
    }
    return CountryByList.destroy({
      where: {
        countryId: attributes.countryId,
        listId: attributes.id
      }
    }).catch(err => {
      /* istanbul ignore next */
      logger.error(inspect(err));
      /* istanbul ignore next */
      throw databaseError(`There was an error deleting country of the list: ${err.message}`);
    });
  });
};
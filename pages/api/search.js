import { getCollection } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { query, type, date, departureCity, destinationCity } = req.query;
    
    if (!query && !date && !departureCity && !destinationCity) {
      return res.status(400).json({ error: 'Search query, date, or city is required' });
    }

    const searchQuery = query ? query.toLowerCase() : '';
    const departure = departureCity ? departureCity.toLowerCase() : '';
    const destination = destinationCity ? destinationCity.toLowerCase() : '';


    const flightsCollection = await getCollection('flights');
    const busesCollection = await getCollection('buses');
    const tripsCollection = await getCollection('trips');

    let results = {
      flights: [],
      buses: [],
      trips: []
    };


    const parseDate = (dateString) => {
      if (!dateString) return null;
      
      try {

        const parsedDate = new Date(dateString);
        
        if (isNaN(parsedDate.getTime())) {
          console.error('Invalid date format:', dateString);
          return null;
        }
        
        parsedDate.setUTCHours(0, 0, 0, 0);
        
        return parsedDate;
      } catch (error) {
        console.error('Error parsing date:', error);
        return null;
      }
    };

  
    const buildSearchConditions = (dateField, fromField = 'from', toField = 'to') => {
      const conditions = [];
      

      if (searchQuery) {
        conditions.push({ [fromField]: { $regex: searchQuery, $options: 'i' } });
        conditions.push({ [toField]: { $regex: searchQuery, $options: 'i' } });
      }
      

      if (departure) {
        conditions.push({ [fromField]: { $regex: departure, $options: 'i' } });
      }

      if (destination) {
        conditions.push({ [toField]: { $regex: destination, $options: 'i' } });
      }
      
  
      if (date) {
  t
        const selectedDate = parseDate(date);
        

        if (selectedDate) {

          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          conditions.push({ 
            [dateField]: { 
              $gte: selectedDate, 
              $lt: nextDay 
            } 
          });
        }
      }
      

      if (departure && destination) {
        return { 
          $and: [
            { [fromField]: { $regex: departure, $options: 'i' } },
            { [toField]: { $regex: destination, $options: 'i' } }
          ]
        };
      }
      
      return conditions.length > 0 ? { $or: conditions } : {};
    };


    if (type) {
      switch (type) {
        case 'flights':
          const flightConditions = buildSearchConditions('departureDate', 'from', 'to');
          if (searchQuery && !departure && !destination) {
            if (flightConditions.$or) {
              flightConditions.$or.push({ airline: { $regex: searchQuery, $options: 'i' } });
            }
          }
          results.flights = await flightsCollection.find(flightConditions).toArray();
          break;
        case 'buses':
          const busConditions = buildSearchConditions('departureDate', 'from', 'to');
          if (searchQuery && !departure && !destination) {
            if (busConditions.$or) {
              busConditions.$or.push({ busCompany: { $regex: searchQuery, $options: 'i' } });
            }
          }
          results.buses = await busesCollection.find(busConditions).toArray();
          break;
        case 'trips':

          let tripConditions = {};
          

          const textConditions = [];
          if (searchQuery) {
            textConditions.push({ name: { $regex: searchQuery, $options: 'i' } });
            textConditions.push({ description: { $regex: searchQuery, $options: 'i' } });
            textConditions.push({ origin: { $regex: searchQuery, $options: 'i' } });
            textConditions.push({ destination: { $regex: searchQuery, $options: 'i' } });
          }
          
          if (departure) {
            textConditions.push({ origin: { $regex: departure, $options: 'i' } });
          }
          
          if (destination) {
            textConditions.push({ destination: { $regex: destination, $options: 'i' } });
          }
          

          if (textConditions.length > 0) {
            if (departure && destination) {
              tripConditions = {
                $and: [
                  { origin: { $regex: departure, $options: 'i' } },
                  { destination: { $regex: destination, $options: 'i' } }
                ]
              };
            } else {
              tripConditions = { $or: textConditions };
            }
          }
          

          if (date) {

            const selectedDate = parseDate(date);
            

            if (selectedDate) {
              console.log('Searching for trips with date:', selectedDate);
              
              const dateCondition = { 
                $and: [
                  { startDate: { $lte: selectedDate } },
                  { endDate: { $gte: selectedDate } }
                ]
              };
              

              if (Object.keys(tripConditions).length > 0) {
                tripConditions = {
                  $and: [
                    tripConditions,
                    { $and: dateCondition.$and }
                  ]
                };
              } else {
                tripConditions = dateCondition;
              }
            }
          }
          
          console.log('Trip search conditions:', JSON.stringify(tripConditions));
          results.trips = await tripsCollection.find(tripConditions).toArray();
          break;
      }
    } else {
      
      const [flights, buses, trips] = await Promise.all([
        flightsCollection.find((() => {
          const conditions = buildSearchConditions('departureDate', 'from', 'to');
          if (searchQuery && !departure && !destination) {
            if (conditions.$or) {
              conditions.$or.push({ airline: { $regex: searchQuery, $options: 'i' } });
            }
          }
          return conditions;
        })()).toArray(),
        
        busesCollection.find((() => {
          const conditions = buildSearchConditions('departureDate', 'from', 'to');
          if (searchQuery && !departure && !destination) {
            if (conditions.$or) {
              conditions.$or.push({ busCompany: { $regex: searchQuery, $options: 'i' } });
            }
          }
          return conditions;
        })()).toArray(),
        
        tripsCollection.find((() => {
          
          let conditions = {};
          
          
          const textConditions = [];
          if (searchQuery) {
            textConditions.push({ name: { $regex: searchQuery, $options: 'i' } });
            textConditions.push({ description: { $regex: searchQuery, $options: 'i' } });
            textConditions.push({ origin: { $regex: searchQuery, $options: 'i' } });
            textConditions.push({ destination: { $regex: searchQuery, $options: 'i' } });
          }
          
          if (departure) {
            textConditions.push({ origin: { $regex: departure, $options: 'i' } });
          }
          
          if (destination) {
            textConditions.push({ destination: { $regex: destination, $options: 'i' } });
          }
          
          
          if (textConditions.length > 0) {
            if (departure && destination) {
              conditions = {
                $and: [
                  { origin: { $regex: departure, $options: 'i' } },
                  { destination: { $regex: destination, $options: 'i' } }
                ]
              };
            } else {
              conditions = { $or: textConditions };
            }
          }
          
          
          if (date) {

            const selectedDate = parseDate(date);
            

            if (selectedDate) {
              const dateCondition = { 
                $and: [
                  { startDate: { $lte: selectedDate } },
                  { endDate: { $gte: selectedDate } }
                ]
              };
              
              
              if (Object.keys(conditions).length > 0) {
                conditions = {
                  $and: [
                    conditions,
                    { $and: dateCondition.$and }
                  ]
                };
              } else {
                conditions = dateCondition;
              }
            }
          }
          
          return conditions;
        })()).toArray()
      ]);

      results = {
        flights,
        buses,
        trips
      };
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
} 
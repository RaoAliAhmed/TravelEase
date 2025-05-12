import { getCollection } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { query, type, date, departureCity, destinationCity } = req.query;
    
    if (!query && !date && !departureCity && !destinationCity) {
      return res.status(400).json({ error: 'Search query, date, or city is required' });
    }

    // Convert query to lowercase for case-insensitive search
    const searchQuery = query ? query.toLowerCase() : '';
    const departure = departureCity ? departureCity.toLowerCase() : '';
    const destination = destinationCity ? destinationCity.toLowerCase() : '';

    // Get collections
    const flightsCollection = await getCollection('flights');
    const busesCollection = await getCollection('buses');
    const tripsCollection = await getCollection('trips');

    let results = {
      flights: [],
      buses: [],
      trips: []
    };

    // Parse date properly - handles YYYY-MM-DD format from HTML date input
    const parseDate = (dateString) => {
      if (!dateString) return null;
      
      try {
        // Create a date object - the date input sends YYYY-MM-DD format
        const parsedDate = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(parsedDate.getTime())) {
          console.error('Invalid date format:', dateString);
          return null;
        }
        
        // Set to start of day in UTC to avoid timezone issues
        parsedDate.setUTCHours(0, 0, 0, 0);
        
        return parsedDate;
      } catch (error) {
        console.error('Error parsing date:', error);
        return null;
      }
    };

    // Build search conditions
    const buildSearchConditions = (dateField, fromField = 'from', toField = 'to') => {
      const conditions = [];
      
      // Text search conditions for general query
      if (searchQuery) {
        conditions.push({ [fromField]: { $regex: searchQuery, $options: 'i' } });
        conditions.push({ [toField]: { $regex: searchQuery, $options: 'i' } });
      }
      
      // Specific departure city search
      if (departure) {
        conditions.push({ [fromField]: { $regex: departure, $options: 'i' } });
      }
      
      // Specific destination city search
      if (destination) {
        conditions.push({ [toField]: { $regex: destination, $options: 'i' } });
      }
      
      // Date condition - if date is provided
      if (date) {
        // Parse the date string to a Date object
        const selectedDate = parseDate(date);
        
        // Only add date condition if the date is valid
        if (selectedDate) {
          // Create next day for range query
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
      
      // If we have both departure and destination, use $and to make sure both match
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

    // If type is specified, only search that type
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
          // For trips, we need special handling for date ranges
          let tripConditions = {};
          
          // Add text search conditions
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
          
          // Add text conditions to the query
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
          
          // Add date condition if provided
          if (date) {
            // Parse the date string to a Date object
            const selectedDate = parseDate(date);
            
            // Only proceed if the date is valid
            if (selectedDate) {
              console.log('Searching for trips with date:', selectedDate);
              
              const dateCondition = { 
                $and: [
                  { startDate: { $lte: selectedDate } },
                  { endDate: { $gte: selectedDate } }
                ]
              };
              
              // Combine with existing conditions
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
      // Search all types
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
          // For trips, we need special handling for date ranges
          let conditions = {};
          
          // Add text search conditions
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
          
          // Add text conditions to the query
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
          
          // Add date condition if provided
          if (date) {
            // Parse the date string to a Date object
            const selectedDate = parseDate(date);
            
            // Only proceed if the date is valid
            if (selectedDate) {
              const dateCondition = { 
                $and: [
                  { startDate: { $lte: selectedDate } },
                  { endDate: { $gte: selectedDate } }
                ]
              };
              
              // Combine with existing conditions
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
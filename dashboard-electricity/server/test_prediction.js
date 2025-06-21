const axios = require('axios');

// Test data for prediction
const testData = {
  temperature: 25,
  humidity: 60,
  squareFootage: 1000,
  occupancy: 5,
  hvacUsage: true,
  lightingUsage: true,
  isHoliday: false,
  hour: new Date().getHours(),
  dayOfWeek: new Date().getDay(),
  month: new Date().getMonth() + 1
};

console.log('Testing prediction endpoint with data:', testData);

// Test the public prediction endpoint
axios.post('http://localhost:5000/api/public/predict', testData)
  .then(response => {
    console.log('Success! Prediction response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });

/********************************************************************
 * EMISSION FACTORS & CONSTANTS
 ********************************************************************/
const EMISSION_FACTORS = {
    ELECTRICITY_KG_PER_KWH: 0.709,   // kg CO₂/kWh
    NATURAL_GAS_KG_PER_THERM: 5.3,     // kg CO₂/therm
    CAR: {
      gas: 0.411,
      diesel: 0.475,
      hybrid: 0.200,
      electric: 0.100
    },
    BUS_KG_PER_MILE: 0.089,
    TRAIN_KG_PER_MILE: 0.041,
    FLIGHT: {
      shortHaul: 255,
      longHaul: 195
    },
    DIET_MEAT: {
      high: 2000,
      medium: 1500,
      low: 1000,
      none: 700
    },
    DIET_DAIRY: {
      high: 1200,
      medium: 900,
      low: 500,
      none: 300
    },
    FOOD_WASTE_KG_PER_KG: 2.5,
    RECYCLING_OFFSET: {
      always: -200,
      often: -100,
      sometimes: -50,
      rarely: 0
    },
    PAPER_KG_PER_REAM: 6,
    CLOTHING_KG_PER_ITEM: 10
  };
  
  /********************************************************************
   * HELPER FUNCTIONS
   ********************************************************************/
  function weeklyToYearlyMiles(weeklyMiles) {
    return weeklyMiles * 52;
  }
  
  function toggleStepIndicator(currentStep) {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach(indicator => {
      const step = parseInt(indicator.getAttribute('data-step'));
      indicator.classList.toggle('active', step === currentStep);
    });
  }
  
  function showFormStep(step) {
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach(fs => {
      fs.classList.remove('active');
      if (parseInt(fs.getAttribute('data-step')) === step) {
        fs.classList.add('active');
      }
    });
    toggleStepIndicator(step);
  }
  
  /********************************************************************
   * MAIN CALCULATION FUNCTION
   ********************************************************************/
  function calculateFootprint(formData) {
    let totalKgCO2 = 0;
  
    // 1. Household Energy
    const yearlyElectricity = formData.monthlyElectricity * 12;
    const electricityEmissions = yearlyElectricity * EMISSION_FACTORS.ELECTRICITY_KG_PER_KWH;
    const yearlyGas = formData.monthlyGas * 12;
    const gasEmissions = yearlyGas * EMISSION_FACTORS.NATURAL_GAS_KG_PER_THERM;
    const householdEmissions = (electricityEmissions + gasEmissions) / formData.peopleInHouse;
    totalKgCO2 += householdEmissions;
  
    // 2. Transportation
    const yearlyCarMiles = weeklyToYearlyMiles(formData.carMiles);
    const carFactor = EMISSION_FACTORS.CAR[formData.carType] || EMISSION_FACTORS.CAR.gas;
    const carEmissions = yearlyCarMiles * carFactor;
    const yearlyBusMiles = weeklyToYearlyMiles(formData.busMiles);
    const busEmissions = yearlyBusMiles * EMISSION_FACTORS.BUS_KG_PER_MILE;
    const yearlyTrainMiles = weeklyToYearlyMiles(formData.trainMiles);
    const trainEmissions = yearlyTrainMiles * EMISSION_FACTORS.TRAIN_KG_PER_MILE;
    const flightShortEmissions = formData.flightHoursShort * EMISSION_FACTORS.FLIGHT.shortHaul;
    const flightLongEmissions = formData.flightHoursLong * EMISSION_FACTORS.FLIGHT.longHaul;
    const transportEmissions = carEmissions + busEmissions + trainEmissions + flightShortEmissions + flightLongEmissions;
    totalKgCO2 += transportEmissions;
  
    // 3. Food & Diet
    let dietEmissions = 0;
    switch (formData.meatFrequency) {
      case 'high':
        dietEmissions += EMISSION_FACTORS.DIET_MEAT.high;
        break;
      case 'medium':
        dietEmissions += EMISSION_FACTORS.DIET_MEAT.medium;
        break;
      case 'low':
        dietEmissions += EMISSION_FACTORS.DIET_MEAT.low;
        break;
      case 'none':
        dietEmissions += EMISSION_FACTORS.DIET_MEAT.none;
        break;
    }
    switch (formData.dairyFrequency) {
      case 'high':
        dietEmissions += EMISSION_FACTORS.DIET_DAIRY.high;
        break;
      case 'medium':
        dietEmissions += EMISSION_FACTORS.DIET_DAIRY.medium;
        break;
      case 'low':
        dietEmissions += EMISSION_FACTORS.DIET_DAIRY.low;
        break;
      case 'none':
        dietEmissions += EMISSION_FACTORS.DIET_DAIRY.none;
        break;
    }
    const yearlyFoodWaste = formData.foodWaste * 52;
    const foodWasteEmissions = yearlyFoodWaste * EMISSION_FACTORS.FOOD_WASTE_KG_PER_KG;
    dietEmissions += foodWasteEmissions;
    totalKgCO2 += dietEmissions;
  
    // 4. Consumables & Waste
    let wasteEmissions = 0;
    const recyclingOffset = EMISSION_FACTORS.RECYCLING_OFFSET[formData.recycleHabit] || 0;
    const paperCO2 = formData.paperUsage * EMISSION_FACTORS.PAPER_KG_PER_REAM;
    const clothingCO2 = formData.clothingPurchases * EMISSION_FACTORS.CLOTHING_KG_PER_ITEM;
    wasteEmissions = recyclingOffset + paperCO2 + clothingCO2;
    totalKgCO2 += wasteEmissions;
  
    const totalTonsCO2 = totalKgCO2 / 1000;
  
    return {
      totalKgCO2: totalKgCO2,
      totalTonsCO2: totalTonsCO2,
      breakdown: {
        Household: +householdEmissions.toFixed(1),
        Transportation: +transportEmissions.toFixed(1),
        Food: +dietEmissions.toFixed(1),
        Waste: +wasteEmissions.toFixed(1)
      }
    };
  }
  
  /********************************************************************
   * FUN FACT HELPER FUNCTION (Jet Comparison)
   ********************************************************************/
  function getFunFact(tons) {
    // Assume one commercial jet flight emits ~7 metric tons CO₂.
    const jets = (tons / 7).toFixed(1);
    return `Fun Fact: The average commercial jet emits roughly 7 metric tons of CO₂ per flight. Your annual carbon footprint is equivalent to the emissions of about <strong>${jets}</strong> jet flights!`;
  }
  
  /********************************************************************
   * EYE-OPENING COMPARISONS FUNCTION
   ********************************************************************/
  function getComparisons(tons) {
    // Conversion factors based on sample data:
    // 1. Driving (gasoline car): 0.411 kg/mile → miles = (tons*1000)/0.411
    const miles = (tons * 1000) / 0.411;
    const km = miles * 1.60934;
    
    // 2. Flights: assume one NY–LA one-way flight emits ~0.235 metric tons
    const flights = (tons / 0.235).toFixed(0);
    
    // 3. Trees: assume one mature tree absorbs ~0.0613 metric tons/year
    const trees = (tons / 0.0613).toFixed(0);
    
    // 4. LED bulbs: assume 1 metric ton = ~113.5 bulbs per year
    const bulbs = Math.round(tons * 113.5);
    
    // 5. Cheeseburgers: assume 1 metric ton = ~333.3 burgers
    const burgers = Math.round(tons * 333.3);
    
    // 6. Glacier Melting: assume 1 metric ton = ~2.98 m² of Arctic ice melted
    const ice = Math.round(tons * 2.98);
    
    return `
      <h3>More Eye-Opening Comparisons</h3>
      <ul>
        <li><strong>🚗 Transportation:</strong> Equivalent to driving <strong>${Math.round(km).toLocaleString()} km</strong> (${Math.round(miles).toLocaleString()} miles) in an average gasoline car. That’s like circling the Earth over <strong>${(km/40075).toFixed(1)}</strong> times! 🌍</li>
        <li><strong>✈️ Flights:</strong> Equivalent to taking about <strong>${flights}</strong> one-way flights from New York to Los Angeles. ✈️</li>
        <li><strong>🌳 Nature’s Workload:</strong> It would take roughly <strong>${trees}</strong> mature trees to absorb this CO₂ in a year. 🌲🌳</li>
        <li><strong>🔋 Energy Usage:</strong> Your emissions could power approximately <strong>${bulbs}</strong> LED light bulbs for an entire year. 💡</li>
        <li><strong>🍔 Food Impact:</strong> Producing around <strong>${burgers}</strong> cheeseburgers releases the same amount of CO₂ as your annual footprint. 🍔</li>
        <li><strong>🌊 Glacier Melting:</strong> Your emissions contribute to melting about <strong>${ice}</strong> m² of Arctic ice each year. 🧊</li>
      </ul>
    `;
  }
  
  /********************************************************************
   * CREATE CHART USING CHART.JS
   ********************************************************************/
  let chartInstance; // to hold our Chart instance
  
  function createEmissionChart(breakdown) {
    const ctx = document.getElementById('emissionChart').getContext('2d');
    const labels = Object.keys(breakdown);
    const dataValues = Object.values(breakdown);
  
    // If chart instance already exists, update data.
    if (chartInstance) {
      chartInstance.data.labels = labels;
      chartInstance.data.datasets[0].data = dataValues;
      chartInstance.update();
    } else {
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Emissions (kg CO₂)',
            data: dataValues,
            backgroundColor: ['#003366', '#1f5baa', '#ffd700', '#ff6f61'],
            borderColor: ['#002244', '#153d7e', '#e6c200', '#cc5a50'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              },
              title: {
                display: true,
                text: 'kg CO₂'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }
  
  /********************************************************************
   * DOMContentLoaded
   ********************************************************************/
  document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const maxStep = 5;
  
    const carbonForm = document.getElementById('carbonForm');
    const resultsSection = document.getElementById('results');
    const footprintValue = document.getElementById('footprintValue');
    const funFactEl = document.getElementById('funFact');
    const comparisonsDiv = document.getElementById('comparisons');
    const recommendationsDiv = document.getElementById('recommendations');
  
    // Navigation buttons
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
  
    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep < maxStep) {
          currentStep++;
          showFormStep(currentStep);
        }
      });
    });
  
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          showFormStep(currentStep);
        }
      });
    });
  
    // Initialize first step
    showFormStep(currentStep);
  
    // Handle form submission
    carbonForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      // Gather form data
      const formData = {
        monthlyElectricity: parseFloat(document.getElementById('monthlyElectricity').value) || 0,
        monthlyGas: parseFloat(document.getElementById('monthlyGas').value) || 0,
        peopleInHouse: parseInt(document.getElementById('peopleInHouse').value) || 1,
  
        carType: document.getElementById('carType').value || 'gas',
        carMiles: parseFloat(document.getElementById('carMiles').value) || 0,
        busMiles: parseFloat(document.getElementById('busMiles').value) || 0,
        trainMiles: parseFloat(document.getElementById('trainMiles').value) || 0,
        flightHoursShort: parseFloat(document.getElementById('flightHoursShort').value) || 0,
        flightHoursLong: parseFloat(document.getElementById('flightHoursLong').value) || 0,
  
        meatFrequency: document.getElementById('meatFrequency').value || 'medium',
        dairyFrequency: document.getElementById('dairyFrequency').value || 'medium',
        foodWaste: parseFloat(document.getElementById('foodWaste').value) || 0,
  
        recycleHabit: document.getElementById('recycleHabit').value || 'sometimes',
        paperUsage: parseFloat(document.getElementById('paperUsage').value) || 0,
        clothingPurchases: parseFloat(document.getElementById('clothingPurchases').value) || 0
      };
  
      // Calculate footprint
      const result = calculateFootprint(formData);
      const tonsCO2 = result.totalTonsCO2.toFixed(2);
  
      // Display results and fun fact
      footprintValue.innerHTML = `Your annual carbon footprint is approximately <strong>${tonsCO2}</strong> metric tons of CO<sub>2</sub>.`;
      funFactEl.innerHTML = getFunFact(result.totalTonsCO2);
      resultsSection.classList.remove('hidden');
  
      // Create chart with breakdown data
      createEmissionChart(result.breakdown);
  
      // Generate and display additional comparisons
      comparisonsDiv.innerHTML = getComparisons(result.totalTonsCO2);
      comparisonsDiv.classList.remove('hidden');
  
      // Reveal recommendations (if hidden)
      recommendationsDiv.classList.remove('hidden');
  
      // Smooth scroll to results section
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    });
  
    // Handle form reset
    carbonForm.addEventListener('reset', () => {
      currentStep = 1;
      showFormStep(currentStep);
      resultsSection.classList.add('hidden');
      comparisonsDiv.classList.add('hidden');
      recommendationsDiv.classList.add('hidden');
    });
  });
  
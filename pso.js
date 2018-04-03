/*
 * Particle Swarm Optimization Simplified Algorithm
 */

// Person
class Person {
  constructor({ x, y }, consumption) {
    this.position = { x, y }
    this.consumption = consumption
  }
}

// Particle
class Particle {
  constructor(position, velocity) {
    this.position = position // { x, y }
    this.velocity = velocity // { x, y }
    this.pbest = position //Initially pbest get the initial position once ir had never moved
    this.fitness //result from the fitness function
  }
}

// Person Vector
const people = new Array(4).fill(0).map(
  () =>
    new Person(
      {
        x: Math.random() * 0.01 - 5.835,
        y: Math.random() * 0.01 - 35.204,
      },
      Math.random() * 10,
    ),
)

// Particle Vector
const pVector = new Array(4).fill(0).map(
  () =>
    new Particle(
      {
        x: Math.random() * 0.01 - 5.835,
        y: Math.random() * 0.01 - 35.204,
      },
      {
        x: Math.random() * 0.01 - 5.835,
        y: Math.random() * 0.01 - 35.204,
      },
    ),
)

// const allPositions = [];
let gbest = { x: 1e6, y: 1e6 } //Best position global, random value to begin
const w = 0.6 //Inertial coeficient, how much the prev velocity influences at the new one
const c1 = 0.9 //c1 is how much personal experiences matters
const c2 = 1 //c2 is how much global experiences matters
const error = 0.005 //Minimum solution's error
const maxInteraction = 1e6 //Number of interactions that the algorithm will work

const fitness = ({ x, y }) => {
  let sum = 0
  people.forEach(
    person =>
      (sum +=
        Math.sqrt(
          Math.pow(person.position.x - x, 2) +
            Math.pow(person.position.y - y, 2),
        ) / person.consumption),
  )
  return sum
}

const updateVelocity = (position, velocity, pbest) => ({
  x:
    w * velocity.x +
    Math.random() * c1 * (pbest.x - position.x) +
    Math.random() * c2 * (gbest.x - position.x),
  y:
    w * velocity.y +
    Math.random() * c1 * (pbest.y - position.y) +
    Math.random() * c2 * (gbest.y - position.y),
})

//get the position which has the best position from all particles in that interaction
const getmin = vector => {
  let minFitness = 1e6
  let pos
  vector.forEach(particle => {
    const pbestFitness = fitness(particle.pbest)
    if (minFitness > pbestFitness) {
      minFitness = pbestFitness
      pos = particle.pbest
    }
  })
  return pos
}

//Algorithm
for (interaction = 0; interaction < maxInteraction; interaction++) {
  pVector.forEach(particle => {
    const pFitness = fitness(particle.position)
    const pbest =
      pFitness <= fitness(particle.pbest) ? particle.position : particle.pbest
    return Object.assign(particle, { pbest, fitness: pFitness })
  })

  const bestPbest = getmin(pVector)

  if (Math.abs(fitness(bestPbest) - fitness(gbest)) < error) break

  if (fitness(bestPbest) < fitness(gbest)) {
    gbest = bestPbest
    // allPositions.push(bestPbest)
  }

  //update new velocities and positions
  pVector.forEach(particle => {
    const velocity = updateVelocity(
      particle.position,
      particle.velocity,
      particle.pbest,
    )
    const position = {
      x: particle.position.x + velocity.x,
      y: particle.position.y + velocity.y,
    }
    return Object.assign(particle, { velocity, position })
  })
}

console.log(`
  Melhor solução é [${gbest.x},${gbest.y}]
  encontrada com ${interaction} interações - ${Math.abs(fitness(gbest))}.
`)

function initMap() {
  /*
  var directionsService = new google.maps.DirectionsService()
  var directionsRenderer = []
  function renderDirections(result, color) {
      directionsRenderer.push(new google.maps.DirectionsRenderer({
          map: map,
          directions: result,
          polylineOptions: {
              strokeColor: color
          }, suppressMarkers: true, preserveViewport: true
      }))
  }
  function requestDirections(color, start, end) {
      directionsService.route({
          origin: start,
          destination: end,
          travelMode: google.maps.DirectionsTravelMode.DRIVING
      }, function (result, status) {
          renderDirections(result, color);
      });
  }
  requestDirections(escolasColors[result[i].escolaIndex], new google.maps.LatLng(result[i].pessoa.lat, result[i].pessoa.lng), new google.maps.LatLng(result[i].escola.lat, result[i].escola.lng))
  */
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: { lat: -5.839597, lng: -35.209195 },
  })
  people.forEach(
    person =>
      new google.maps.Marker({
        position: { lat: person.position.x, lng: person.position.y },
        title: `Gasto: ${person.consumption}`,
        map,
      }),
  )
  const gbestMarker = new google.maps.Marker({
    map,
    position: { lat: gbest.x, lng: gbest.y },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
    },
  })
}

/*
google.charts.load('current', { packages: ['corechart'] })
google.charts.setOnLoadCallback(drawChart)

function drawChart() {
  var data = google.visualization.arrayToDataTable([['X', 'Y'], ...res])

  var options = {
    title: '',
    hAxis: { title: 'X', minValue: 0, maxValue: 15 },
    vAxis: { title: 'Y', minValue: 0, maxValue: 15 },
    legend: 'none',
  }

  var chart = new google.visualization.ScatterChart(
    document.getElementById('chart_div'),
  )

  chart.draw(data, options)
}
*/

// console.log('allPositions', allPositions)

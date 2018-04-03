/*
 * Particle Swarm Optimization Simplified Algorithm
 */

// Person
class Person {
  constructor({ x, y }) {
    this.position = { x, y }
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
const people = [
  new Person({ x: 40, y: 40 }),
  new Person({ x: 20, y: 20 }),
  // new Person({ x: Math.random() * 100, y: Math.random() * 100 }),
]

const pVector = [
  new Particle(
    { x: Math.random() * 100, y: Math.random() * 100 },
    { x: Math.random() * 100, y: Math.random() * 100 },
  ),
  new Particle(
    { x: Math.random() * 100, y: Math.random() * 100 },
    { x: Math.random() * 100, y: Math.random() * 100 },
  ),
  new Particle(
    { x: Math.random() * 100, y: Math.random() * 100 },
    { x: Math.random() * 100, y: Math.random() * 100 },
  ),
]

const allPositions = []
let gbest = { x: 1e6, y: 1e6 } //Best position global, random value to begin
const w = 0.5 //Inertial coeficient, how much the prev velocity influences at the new one
const p1 = Math.random()
const p2 = Math.random() //Coeficients random
const c1 = 0.2 //c1 is how much personal experiences matters
const c2 = 0.8 //c2 is how much global experiences matters
const error = 0.09 //Minimum solution's error
const maxInteraction = 1000 //Number of interactions that the algorithm will work

// função de avaliação
const fitness = ({ x, y }) => {
  let sum = 0
  people.forEach(
    person =>
      (sum += Math.sqrt(
        Math.pow(person.position.x - x, 2) + Math.pow(person.position.y - y, 2),
      )),
  )
  return sum
}

const updateVelocity = (position, velocity, pbest) => ({
  x:
    w * velocity.x +
    p1 * c1 * (pbest.x - position.x) +
    p2 * c2 * (gbest.x - position.x),
  y:
    w * velocity.y +
    p1 * c1 * (pbest.y - position.y) +
    p2 * c2 * (gbest.y - position.y),
})

//get the position which has the best position from all particles in that interaction
const getmin = vector => {
  let minFitness = 1e6
  let pos
  vector.forEach(particle => {
    const pbestFitness = fitness(particle.pbest)
    if (minFitness > pbestFitness) {
      minFitness = pbestFitness
      return (pos = particle.pbest)
    }
  })
  console.log('pos', pos)
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
  if (fitness(bestPbest) < fitness(gbest)) {
    gbest = bestPbest
    allPositions.push(bestPbest)
  }

  if (Math.abs(gbest) < error) break

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
  Melhor solução é [${gbest.x.toFixed(0)},${gbest.y.toFixed(0)}]
  encontrada com ${interaction} interações.
`)
const res = allPositions.map(i => ['', i.x, i.y, 20])

google.charts.load('current', { packages: ['corechart'] })
google.charts.setOnLoadCallback(drawChart)
function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ['ID', 'X', 'Y', ''],
    ...res,
  ])

  var options = {
    colorAxis: { colors: ['green', 'darkgreen'] },
  }

  var chart = new google.visualization.BubbleChart(
    document.getElementById('chart_div'),
  )
  chart.draw(data, options)
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

// process.exit(0)

/*
 * Particle Swarm Optimization Simplified Algorithm
 */

// Person
class Person {
  constructor({ lat, lng }, consumption) {
    this.position = { lat, lng }
    this.consumption = consumption
  }
}

// Particle
class Particle {
  constructor(position, velocity) {
    this.position = position // { lat, lng }
    this.velocity = velocity // { lat, lng }
    this.pbest = position //Initially pbest get the initial position once ir had never moved
    this.fitness //result from the fitness function
  }
}

const w = 0.6 //Inertial coeficient, how much the prev velocity influences at the new one
const c1 = 0.9 //c1 is how much personal experiences matters
const c2 = 1 //c2 is how much global experiences matters
const error = 0.06 //Minimum solution's error
const maxInteraction = 3e3 //Number of interactions that the algorithm will work
let map = null

const getLocation = () => ({
  lat: Math.random() * 0.01 - 5.846,
  lng: Math.random() * 0.01 - 35.207,
})

// Person Vector
const nPeople = 4
const people = new Array(nPeople)
  .fill(0)
  .map(() => new Person(getLocation(), Math.random() * 10))

const calcularDistancia = async (lat, lng, person) => {
  let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${
    person.lat
  },${person.lng}&key=AIzaSyBcMFCfbdJdD3__pdiZWMU9Ab5PS2N-pYo`
  // let response = await fetch(url)
  // let data = await response.json()
  // return data
}

const fitness = async ({ lat, lng }) =>
  (await Promise.all(
    people.map(async person => {
      await calcularDistancia(lat, lng, person.position)
      return (
        Math.sqrt(
          Math.pow(person.position.lat - lat, 2) +
            Math.pow(person.position.lng - lng, 2),
        ) * person.consumption
      )
    }),
  )).reduce((a, b) => a + b)

const updateVelocity = (position, velocity, pbest, gbest) => ({
  lat:
    w * velocity.lat +
    Math.random() * c1 * (pbest.lat - position.lat) +
    Math.random() * c2 * (gbest.lat - position.lat),
  lng:
    w * velocity.lng +
    Math.random() * c1 * (pbest.lng - position.lng) +
    Math.random() * c2 * (gbest.lng - position.lng),
})

//get the position which has the best position from all particles in that interaction
const getmin = async particles => {
  let minFitness = 1e6
  let pos = null
  const pbests = await Promise.all(
    particles.map(particle => fitness(particle.pbest)),
  )
  pbests.forEach((pbestFitness, i) => {
    if (minFitness > pbestFitness) {
      minFitness = pbestFitness
      pos = particles[i].pbest
    }
  })
  return pos
}

//Algorithm
async function run() {
  const nParticle = 4
  const pVector = new Array(nParticle)
    .fill(0)
    .map(() => new Particle(getLocation(), getLocation()))
  const vGBestMarker = new Array(0)
  let gbest = { lat: 1e6, lng: 1e6 } // Best position global, big value to begin
  let fitGBest = 1e6
  let interaction = 0

  for (interaction; interaction < maxInteraction; interaction += 1) {
    await Promise.all(
      pVector.map(async particle => {
        const pFitness = await fitness(particle.position)
        const pbest =
          pFitness <= (await fitness(particle.pbest))
            ? particle.position
            : particle.pbest
        return Object.assign(particle, { pbest, fitness: pFitness })
      }),
    )

    const bestPbest = await getmin(pVector)
    fitGBest = await fitness(gbest)

    if (Math.abs(fitGBest) < error) break

    if ((await fitness(bestPbest)) < fitGBest) {
      gbest = bestPbest
      vGBestMarker.push(
        new google.maps.Marker({
          map,
          position: { lat: gbest.lat, lng: gbest.lng },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 0.9,
            scale: 2,
          },
        }),
      )
    }

    //update new velocities and positions
    pVector.forEach(particle => {
      const velocity = updateVelocity(
        particle.position,
        particle.velocity,
        particle.pbest,
        gbest,
      )
      const position = {
        lat: particle.position.lat + velocity.lat,
        lng: particle.position.lng + velocity.lng,
      }
      return Object.assign(particle, { velocity, position })
    })
  }

  if (typeof window.orientation !== 'undefined') {
    alert(`
      [${gbest.lat},${gbest.lng}],
      i = ${interaction}, error = ${Math.abs(fitGBest).toFixed(8)}.
    `)
  }
  console.log(`
    gBest é [${gbest.lat},${gbest.lng}]
    com ${interaction} interações e
    erro ${Math.abs(fitGBest)}.
  `)

  // generate markers
  const gbestMarker = new google.maps.Marker({
    map,
    position: { lat: gbest.lat, lng: gbest.lng },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillOpacity: 0.8,
      scale: 1,
      strokeColor: 'gray',
      strokeWeight: 40,
    },
  })
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -5.840076, lng: -35.203144 },
    zoom: 15,
  })

  // generate markers
  people.forEach(
    person =>
      new google.maps.Marker({
        position: { lat: person.position.lat, lng: person.position.lng },
        title: `Gasto: ${person.consumption}`,
        label: person.consumption.toFixed(0),
        map,
      }),
  )
  run()
}

document.getElementById('reload').addEventListener('click', run)
window.onload = initMap

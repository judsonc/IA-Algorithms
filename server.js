/*
 * Particle Swarm Optimization Simplified Algorithm
 */

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const w = 0.4 //Inertial coeficient, how much the prev velocity influences at the new one
const c1 = 0.9 //c1 is how much personal experiences matters
const c2 = 1 //c2 is how much global experiences matters
const maxInteraction = 4e3 //Number of interactions that the algorithm will work

server.listen(process.env.PORT || 3000, () => console.log('server up'))

app.use('/static', express.static('static'))

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

/*
 * Models
 */

// Particle
class Particle {
  constructor(position, velocity) {
    this.position = position // { lat, lng }
    this.velocity = velocity // { lat, lng }
    this.pbest = position //Initially pbest get the initial position once ir had never moved
    this.fitness //result from the fitness function
  }
}

const getLocation = () => ({
  lat: Math.random() * 0.01 - 5.856,
  lng: Math.random() * 0.01 - 35.211,
})

/*
const calcularDistancia = async (lat, lng, person) => {
  let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${
    person.lat
  },${person.lng}&key=AIzaSyBcMFCfbdJdD3__pdiZWMU9Ab5PS2N-pYo`
  const response = await axios(url, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    withCredentials: true,
    credentials: 'same-origin',
  })
  console.log('\n\nmap', response)
  let response = await fetch(url)
  let data = await response.json()
  return data
}
*/

const fitness = async ({ lat, lng }, people) =>
  (await Promise.all(
    people.map(
      async person =>
        Math.sqrt(
          Math.pow(person.position.lat - lat, 2) +
            Math.pow(person.position.lng - lng, 2),
        ) * person.consumption,
    ),
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
const getmin = async (particles, people) => {
  let minFitness = 1e6
  let pos = null
  const pbests = await Promise.all(
    particles.map(particle => fitness(particle.pbest, people)),
  )
  pbests.forEach((pbestFitness, i) => {
    if (minFitness > pbestFitness) {
      minFitness = pbestFitness
      pos = particles[i].pbest
    }
  })
  return { position: pos, bestPbestFitness: minFitness }
}

io.on('connection', socket => {
  console.log('new client')

  socket.on('calculate', async people => {
    const nParticle = 8
    const pVector = new Array(nParticle)
      .fill(0)
      .map(() => new Particle(getLocation(), getLocation()))

    let bestPbest = { lat: 1e6, lng: 1e6 }
    let gbest = { lat: 1e6, lng: 1e6 } // Best position global, big value to begin
    let fitGBest = 1e6

    for (let interaction = 0; interaction < maxInteraction; interaction += 1) {
      await Promise.all(
        pVector.map(async particle => {
          const pFitness = await fitness(particle.position, people)
          const pbest =
            pFitness <= (await fitness(particle.pbest, people))
              ? particle.position
              : particle.pbest
          return Object.assign(particle, { pbest, fitness: pFitness })
        }),
      )

      bestPbest = await getmin(pVector, people)
      if (bestPbest.bestPbestFitness < fitGBest) {
        gbest = bestPbest.position
        fitGBest = bestPbest.bestPbestFitness
        socket.emit('newParticle', gbest)
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
    socket.emit('bestParticle', gbest)
  })
})

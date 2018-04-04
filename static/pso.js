/*
 * Particle Swarm Optimization Simplified Algorithm
 */

const socket = io('https://ia-alg.herokuapp.com/')
let map = null

// Person
class Person {
  constructor({ lat, lng }, consumption) {
    this.position = { lat, lng }
    this.consumption = consumption
  }
}

const getLocation = () => ({
  lat: Math.random() * 0.01 - 5.856,
  lng: Math.random() * 0.01 - 35.211,
})

// Person Vector
const nPeople = 10
const people = new Array(nPeople)
  .fill(0)
  .map(() => new Person(getLocation(), Math.random() * 10))

socket.on('newParticle', data => {
  new google.maps.Marker({
    map,
    position: { lat: data.lat, lng: data.lng },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillOpacity: 0.9,
      scale: 2,
    },
  })
})

socket.on('bestParticle', data => {
  document.getElementById('reload').disabled = false
  document.getElementById('svg-reload').classList.remove('rotating')
  // generate markers
  const gbestMarker = new google.maps.Marker({
    map,
    position: { lat: data.gbest.lat, lng: data.gbest.lng },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillOpacity: 0.8,
      scale: 1,
      strokeColor: 'gray',
      strokeWeight: 40,
    },
  })
  if (typeof window.orientation !== 'undefined') {
    alert(`
        [${gbest.lat},${gbest.lng}],
        i = ${interaction}, error = ${Math.abs(fitGBest).toFixed(8)}.
      `)
  }
  console.log(`
      gBest é [${data.gbest.lat},${data.gbest.lng}]
      com ${data.interaction} interações e
      erro ${Math.abs(data.error)}.
    `)
})

//Algorithm
function run() {
  socket.emit('calculate', people)
  document.getElementById('svg-reload').classList.add('rotating')
  document.getElementById('reload').disabled = true
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -5.849312, lng: -35.204799 },
    zoom: 16,
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

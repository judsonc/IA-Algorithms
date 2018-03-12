/*
* Particle Swarm Optimization Simplified Algorithm
*/

let pVector = []; //Particle Vector
let gbest = Math.random(); //Best position global, random value to begin
let w = 0.5; //Inertial coeficient, how much the prev velocity influences at the new one
let p1 = Math.random(), p2 = Math.random(); //Coeficients random
let c1 = 0.2, c2 = 0.8; //c1 is how much personal experiences matters, c2 is how much global experiences matters
let nParticle = 5; //Number of particles
let erro = 0.0000001; //Minimum solution's error 
let bestPbest; //canditade to a global best position
let nGeneration = 10000; //Number of generations or repetitions that the algorithm will work

class Particle{
	constructor(posicao, velocidade){
		this.posicao = posicao;
		this.velocidade = velocidade;
		this.pbest = posicao; //Initially pbest get the initial position once ir had never moved
		this.fitness; //result from the fitness function
	}
};

fitness = (posicao) => {
	return Math.pow(posicao, 2) + 1
}

updateVelocidade = (posicao, velocidade, pbest) => {
	return ((w*velocidade) + (p1*c1) * (pbest - posicao) + (p2*c2) * (gbest - posicao))
}

//get the position which has the best position from all particles in that generation
getmin = (vetor) => {
	let min = 9999999;
	let pos;
	for(i = 0; i < nParticle; i++){
		if(fitness(min) > fitness(vetor[i].pbest)){
			min = vetor[i].pbest
			pos = vetor[i].posicao;
		}
	}
	return pos;
}

//Create the particles
for(i = 0; i < nParticle; i++){
	pVector[i] = new Particle(
		Math.random()*1000,
		Math.random()*3000
	);
}

//Algorithm
for(generation = 0; generation < nGeneration; generation++){
	for(i = 0; i < nParticle; i++){
		pVector[i].fitness = fitness(pVector[i].posicao);
		if(pVector[i].fitness <= fitness(pVector[i].pbest)){
			pVector[i].pbest = pVector[i].posicao 
		}
	}
	
	bestPbest = getmin(pVector);
	if(fitness(bestPbest) < fitness(gbest)){
		gbest = bestPbest;
	}
  
	if(Math.abs(gbest-0.0000000) < erro)
		break; //get out of for loop

  //update new velocities and positions
	for(i = 0; i < nParticle; i++){
		pVector[i].velocidade = updateVelocidade(pVector[i].posicao, pVector[i].velocidade, pVector[i].pbest);
		pVector[i].posicao += pVector[i].velocidade;
	}
}

//give the best result
console.log("Melhor solução: " + gbest);

/*
* Generic Algorithm Simplified
* Due to the diversity of problems and ways that this algorithm can handle
* this example focus in a mathematic function which points are the individuals and they are codified 
* in binary arrays
*/

nIndividual = 10;
iVector = [];
nGeneration = 10;
let i1, i2; //individuals for crossover

class Individual{
	constructor(genCode){
		this.genCode = genCode;
		this.fitness;
		this.relativeFitness;
		this.relativeBoundaries = {min: 0, max: 0}
		this.chosen = false;
		this.mutation = 0.0;
	}
};

fitness = (x) => {
	return Math.pow(x,2) + 1;
}


updateProportions = (v) => {
	let sumFitness = 0;
	v.forEach(individual => {
		sumFitness += individual.fitness;
	});
	
	v.forEach(individual => {
		individual.relativeFitness = 100 * individual.fitness/sumFitness; 
	});
	
	v[0].relativeBoundaries.min = 0;
	v[0].relativeBoundaries.max = v[i].relativeFitness;
	for(i = 1; i < nIndividual; i++){
		v[i].relativeBoundaries.min = v[i-1].relativeBoundaries.max;
		v[i].relativeBoundaries.max = v[i].relativeBoundaries.min + v[i.relativeFitness]; 
	}
}

getIndividual = (key, v) => {
	v.forEach(individual => {
		if( Math.min(individual.relativeBoundaries.max,key) == Math.max(individual.relativeBoundaries.min, key)){
			return individual;
		}
	});
}

crossover = (i1, i2) => {
	let i1Aux = i1.code;
	let i2Aux = i2.code;
	const i1Mask =  0xf0; //0b11110000
	const i2Mask = 0x0f; //0b00001111
	i1.code &= (i1Mask); //mask to preserve the lasts 4 bits
	i1.code |= (i2.code & i2Mask); //preserve the firsts 4 bits in i2 and add to i1 code
	i2.code &= (i2Mask);
	i2.code |= (i1Aux & i1Mask);
}

hasMutation = (v) => {
	v.forEach(individual => {
		if(individual.mutation < 0.1){
			individual.code &= 0b11100111;
		}
	});
} 
//Create all Individuals
for(i = 0; i < nIndividual; i++){
	iVector[i] = new Individual(round(Math.random()*255));
}

//Algorithm
for(generation = 0; generation < nGeneration; generation++){
	iVector[i].fitness = fitness(iVector[i].genCode);
	iVector[i].mutation = Math.random()*100;
}

updateProportions(iVector);

for(i = 0; i < nIndividual/2; i++){
	i1 = getIndividual(Math.random()*100, iVector);
	i2 = getIndividual(Math.random()*100, iVector);
	crossover(i1,i2);
}

hasMutation(iVector);

//continues...
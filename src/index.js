
import { transpose312, reshape3d, wellFormedArray } from './utils.js'
import population from '../data/population.json'
import matrices from '../data/matrices.json'
import beta from '../data/betas.json'
import pars from '../data/pars.json'

export const getCountries = () => Object.keys(population);
export const getPopulation = (country) => { return population[country] };
export const getMixingMatrix = (country) => { return matrices[country] };
export const getBeta = (country) => { return beta[country] };

export const runModel = function(
  population,
  ttMatrix,
  mixMatSet,
  ttBeta,
  betaSet,
  nBeds,
  nICUBeds,
  timeStart = 0,
  timeEnd = 250
  ) {

  if (timeStart > timeEnd) {
    throw Error("timeStart is greater than timeEnd");
  }

  if (!wellFormedArray(mixMatSet, [mixMatSet.length, population.length, population.length])) {
    throw Error("mixMatSet must have the dimensions t * nAge * nAge");
  }

  if (population.length !== mixMatSet[0].length) {
    throw Error("mismatch between population and mixing matrix size");
  }

  if (ttBeta.length !== betaSet.length) {
    throw Error("mismatch between ttBeta and betaSet size");
  }

  if (ttMatrix.length !== mixMatSet.length) {
    throw Error("mismatch between ttMatrix and mixMatSet size");
  }

  if (nBeds < 0 || nICUBeds < 0) {
    throw Error("Bed counts must be greater than or equal to 0");
  }

  const model = Object.values(odin)[0];
  const nGroups = population.length;

  const user = {
    ...pars,
    S_0: population,
    tt_matrix: ttMatrix,
    mix_mat_set: transpose312(
      reshape3d(mixMatSet, [nGroups, nGroups, ttMatrix.length])
    ),
    tt_beta: ttBeta,
    beta_set: betaSet
  };

  const mod = new model(user);
  const dt = 1;
  let t = [];
  for (let i = 0; i < (timeEnd - timeStart) / dt; ++i) {
    t.push(timeStart + i * dt);
  }

  return mod.run(t);
}

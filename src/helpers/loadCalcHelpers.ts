export function totalWeight(plates: number[], barWeight: number): number {
  let total = 0;
  for (let i = 0; i < plates.length; i++) {
    total += 2 * plates[i];
  }

  return total + barWeight;
}

export function greedyApproach(
  oneSideWeight: number,
  availablePlates: number[]
): number[] {
  const plates = availablePlates.slice().sort(function (a, b) {
    return b - a;
  });
  const platesToLoad = [];
  let plateNum = 0;

  while (oneSideWeight > 0 && plateNum < plates.length) {
    if (plates[plateNum] <= oneSideWeight) {
      platesToLoad.push(plates[plateNum]);
      oneSideWeight -= plates[plateNum];
      plateNum = 0;
    } else {
      plateNum++;
    }
  }
  return platesToLoad;
}

export function mathApproach(
  oneSideWeight: number,
  availablePlates: number[]
): number[] | null {
  let plates = null;
  let rangeObj = [2, 3, 4]; // Array Number of sets

  if (oneSideWeight * 2 <= 40) {
    rangeObj = [1, 2];
  }

  const helper = (oneSideWeight: number, numOfSets: number) => {
    plates = Math.floor(oneSideWeight / numOfSets);
    if (availablePlates.indexOf(plates) !== -1) {
      return Array(numOfSets).fill(plates);
    }
  };

  while (oneSideWeight > 0 && !plates) {
    for (let i = 0; i < rangeObj.length; i++) {
      plates = helper(oneSideWeight, rangeObj[i]);
      if (plates) {
        break;
      }
    }
    oneSideWeight -= 2.5;
  }

  return plates;
}

export function robustApproach(
  load: number,
  barWeight: number,
  availablePlates: number[]
): number[] {
  const oneSideWeight = calcOneSideWeight(load, barWeight);

  // Attempt the mathematical approach first
  const initialPlates = mathApproach(oneSideWeight, availablePlates);

  // If the mathematical approach yields a valid solution, validate and return it
  if (initialPlates) {
    const calcTotalWeight = totalWeight(initialPlates, barWeight);
    if (calcTotalWeight === load) {
      return initialPlates;
    }

    // If the calculated weight is slightly off, adjust using the greedy approach
    const remainingWeight = load - calcTotalWeight;
    const remainingPlates = greedyApproach(
      remainingWeight / 2,
      availablePlates
    );
    return initialPlates.concat(remainingPlates);
  }

  // Fall back to the greedy approach if the mathematical approach fails
  return greedyApproach(oneSideWeight, availablePlates);
}

export function calcOneSideWeight(load: number, barWeight: number): number {
  if (load > barWeight) {
    return (load - barWeight) / 2;
  } else {
    return 0;
  }
}

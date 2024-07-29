type Coordinates = number[];
interface VectorTrait {
  location: Coordinates;
}

interface IVectorSpace<T extends VectorTrait> {
  add(value: T): void;
  remove(location: Coordinates): boolean;
  query(location: Coordinates, radius: number): Iterable<T>;
}

type IntoVectorSpace<T> = (value: T) => T & VectorTrait;

interface IVectorDataStructure<T> {
  add(value: T): void;
  remove(location: Coordinates): boolean;
  query(location: Coordinates, radius: number): Iterable<T & VectorTrait>;
}

class VectorSpace<T extends VectorTrait> implements IVectorSpace<T> {
  private data: Map<string, T> = new Map();

  add(value: T): void {
    const key = value.location.toString();
    this.data.set(key, value);
  }

  remove(location: Coordinates): boolean {
    const key = location.toString();
    return this.data.delete(key);
  }

  *query(location: Coordinates, radius: number): Iterable<T> {
    for (const value of this.data.values()) {
      if (this.isWithinRadius(location, value.location, radius)) {
        yield value;
      }
    }
  }

  private isWithinRadius(
    location1: Coordinates,
    location2: Coordinates,
    radius: number
  ): boolean {
    // This might be better to do in a standard for..in loop and break if one dimension is a match
    const distance = location1.reduce(
      (sum, coordinates, dimension) =>
        sum + (coordinates - location2[dimension]) ** 2,
      0
    );

    return distance < radius;
  }
}

class SimpleVectorStructure<T> implements IVectorDataStructure<T> {
  private vectorSpace: VectorSpace<T & VectorTrait> = new VectorSpace();

  private transform: IntoVectorSpace<T>;

  constructor(transformFunction: IntoVectorSpace<T>) {
    this.transform = transformFunction;
  }

  add(value: T): void {
    const vectorEntry = this.transform(value);
    this.vectorSpace.add(vectorEntry);
  }

  remove(location: Coordinates): boolean {
    return this.vectorSpace.remove(location);
  }

  // Return a generator function to allow lazy evaluation
  query(location: Coordinates, radius: number): Iterable<T & VectorTrait> {
    return this.vectorSpace.query(location, radius);
  }
}

// Test Cases
// 1Dimensional Structure
console.log("initializing");
const valuesA = [
  { name: "Jane", age: 10 },
  { name: "Jack", age: 14 },
  { name: "Jhon", age: 20 },
  { name: "Ana", age: 30 },
  { name: "Chris", age: 40 },
  { name: "Kim", age: 50 },
];

const transformA: IntoVectorSpace<(typeof valuesA)[0]> = (value) => ({
  ...value,
  location: [value.age],
});

const oneDimensionalDb = new SimpleVectorStructure<(typeof valuesA)[0]>(
  transformA
);

valuesA.forEach((value) => oneDimensionalDb.add(value));

console.log("======= 1D Querry ========");
const resultsA = oneDimensionalDb.query([10], 5);
for (const result of resultsA) {
  console.log(result);
}
console.log("==========================");

// 2Dimensional Structure
const transformB: IntoVectorSpace<(typeof valuesA)[0]> = (value) => ({
  ...value,
  location: [value.age, value.name.length],
});

const twoDimensionalDb = new SimpleVectorStructure<(typeof valuesA)[0]>(
  transformB
);

valuesA.forEach((value) => twoDimensionalDb.add(value));

console.log("======= 2D Querry ========");
const resultsB = twoDimensionalDb.query([20, 3], 10);
for (const result of resultsB) {
  console.log(result);
}
console.log("==========================");

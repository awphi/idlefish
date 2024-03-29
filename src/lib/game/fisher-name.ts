import { randomElement } from "./utils";

const namesBasis = {
  prefixes: [
    "Sir",
    "Ol'",
    "Trusty",
    "Buccaneer",
    "Dr.",
    "Prof.",
    "Capt.",
    "Commodore",
    "Commander",
    "Admiral",
    "Chief",
    "Officer",
    "Reliable",
    "Lil'",
    "Big",
    "Skinny",
    "",
  ],
  first_names: [
    "Adam",
    "Rory",
    "Charles",
    "Lucas",
    "Nathan",
    "Jacob",
    "Benjamin",
    "William",
    "Christopher",
    "Ethan",
    "Alexander",
    "Michael",
    "Daniel",
    "Andrew",
    "Jack",
    "Tom",
    "Ben",
    "Jim",
    "Bill",
    "Harry",
    "Ned",
    "Bob",
    "Joe",
    "Sam",
    "George",
    "Henry",
    "Dick",
    "Will",
    "Dan",
    "Arthur",
    "Fred",
    "Ed",
    "Charley",
    "Frank",
    "Tommy",
    "Dave",
    "Bert",
    "Alfred",
    "Pete",
    "Rob",
    "Walter",
    "Ted",
    "Louie",
    "Mack",
  ],
  last_names: [
    "Fishton",
    "Season",
    "Shipwright",
    "Coastman",
    "Anchorage",
    "Harbor",
    "Seafarer",
    "Seascape",
    "Sailor",
    "Merman",
    "Oceanview",
    "Skipper",
    "Surfenturf",
    "Trawlers",
    "Yachty",
    "Seaside",
    "Beacher",
    "Wharfmaster",
    "Sirensong",
    "Waven",
    "Black",
    "Sawyer",
    "Smith",
    "Jones",
    "Green",
    "Walker",
    "Cooper",
    "Turner",
    "Fisher",
    "Morgan",
    "Taylor",
    "Brown",
    "Gray",
    "Johnson",
    "Bell",
    "Hawkins",
    "Robinson",
    "Reed",
    "Baker",
    "Simpson",
    "Wright",
    "Porter",
    "Knight",
    "Stone",
    "Blake",
    "Nelson",
    "Steele",
    "Lowe",
    "Murphy",
    "Parker",
  ],
};

export function makeFisherName(): string {
  return (
    randomElement(namesBasis.prefixes) +
    " " +
    randomElement(namesBasis.first_names) +
    " " +
    randomElement(namesBasis.last_names)
  ).trim();
}

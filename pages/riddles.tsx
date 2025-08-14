'use client'
import { useState, useEffect } from "react";
import Layout from "../components/layout";

export type Riddle = {
  question: string;
  answer: string;
};

const riddlesList: Riddle[] = [
  { question: "What has to be broken before you can use it?", answer: "Eggs" },
  { question: "Two fathers and two sons went fishing one day. They were there the whole day and only caught 3 fish. One father said, that is enough for all of us, we will have one each. How can this be possible?", answer: "There was the father, his son, and his son's son. This equals 2 fathers and 2 sons for a total of 3!"},
  { question: "What can you catch but never throw?", answer: "A cold" },
  { 
    question: "What can you catch but never throw?", 
    answer: "A cold" 
  },
  {
    question: "No matter how little or how much you use me, you change me every month. What am I?",
    answer: "A calendar"
  },
  {
    question: "Before Mount Everest was discovered, what was the highest mountain on Earth?",
    answer: "Mount Everest"
  },
  {
    question: "What has keys but can't open locks?",
    answer: "A piano"
  },
  {
    question: "What has a neck but no head?",
    answer: "A bottle"
  },
  {
    question: "What has a thumb and four fingers but is not a hand?",
    answer: "A glove"
  },
  {
    question: "I make two people out of one. What am I?",
    answer: "A mirror!"
  },
  {
    question: "David's father has three sons: Snap, Crackle, and _____?",
    answer: "David"
  },
  {
    question: "Can you name three consecutive days without using the words Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday?",
    answer: "Yesterday, Today, and Tomorrow"
  },
  {
    question: "How do you make the number 7 even without addition, subtraction, multiplication, or division?",
    answer: "Remove the 's'"
  },
  {
    question: " How many sides does a circle have?",
    answer: "Two. The inside and the outside."
  },
  {
    question: "How many times can you subtract the number 5 from 25?",
    answer: "Once, because after you subtract 5 from 25 it becomes 20."
  },
  {
    question: "Mr. and Mrs. Mustard have six daughters and each daughter has one brother. How many people are in the Mustard family?",
    answer: "Nine. Each daughter shares the same brother."
  },
  {
    question: "A person dressed in black from head to toe is walking along a street. All of the street lamps are turned off. A black car is speeding behind the person, and its headlights are turned off. But somehow, the driver is able to stop the car without hitting the person. How? ",
    answer: "It is daytime."
  },
  {
    question: "What rotates but never moves, heats but doesn’t get hot and doesn’t have arms but waves?",
    answer: "A microwave"
  },
  {
    question: "What gets hot, but never sweats and has a door you can’t enter through?",
    answer: "A dishwasher"
  },
  {
    question: "I have a head and a tail but no body. What am I?",
    answer: "A coin"
  },
  {
    question: "What building has the most stories?",
    answer: "The library"
  },
  {
    question: "What has 13 hearts, but no other organs?",
    answer: "A deck of cards"
  },
  {
    question: "The answer I give is yes, but what I mean is no. What was the question?",
    answer: "Do you mind?"
  },
  {
    question: "What do you bury when it's alive and dig up when its dead?",
    answer: "A plant"
  },
  {
    question: "I speak without a mouth and hear without ears. I have no body but come alive with the wind. What am I?",
    answer: "An echo"
  },
  {
    question: "Only one color, but not one size, Stuck at the bottom, yet easily flies. Present in sun, but not in rain, Doing no harm, and feeling no pain. What is it?",
    answer: "A shadow"
  },
  {
    question: "How can you write down eight eights so that they add up to one thousand? ",
    answer: "888 + 88 + 8 + 8 + 8 = 1000."
  },
  {
    question: "What English word retains the same pronunciation, even after you take away four of its five letters?",
    answer: "Queue. Remove the \"ueue\" and you are left with \"Q\"."
  },
  {
    question: "Three playing cards in a row. Can you name them with these clues? There is a two to the right of a king. A diamond will be found to the left of a spade. An ace is to the left of a heart. A heart is to the left of a spade. Now, identify all three cards. ",
    answer: "Ace of Diamonds, King of Hearts, Two of Spades."
  },
  {
    question: "What is it that given one, you'll have either two or none?",
    answer: "A choice"
  },
  {
    question: " George, Helen, and Steve are drinking coffee. Bert, Karen, and Dave are drinking soda. Using logic, is Elizabeth drinking coffee or soda?",
    answer: "Elizabeth is drinking coffee. The letter E appears twice in her name, as it does in the names of the others that are drinking coffee."
  },
  {
    question: "I am four times as old as my daughter. In 20 years time I shall be twice as old as her. How old are we now?",
    answer: "I am 40 and my daughter is 10."
  },
  {
    question: "Which of the following words don't belong in the group and why? CORSET, COSTER, SECTOR, ESCORT, COURTS",
    answer: "Courts. All the others are anagrams of each other."
  },
  {
    question: "What goes on four legs in the morning, two legs in the afternoon, and three legs in the evening.",
    answer: "Man, who crawls as a baby, walks on two legs as an adult, and uses a walking stick in his twilight years. "
  },
  {
    question: "Lighter than what I am made of, More of me is hidden Than is seen. What am I?",
    answer: "An iceberg"
  },
  {
    question: "My thunder comes before the lightning; My lightning comes before the clouds; My rain dries all the land it touches. What am I?",
    answer: "A volcano"
  },
  {
    question: "I have a head body and arm but no blood. I have eyes but can't see a nose but can't smell. I have a stage but haven't seen anyone perform. I have arms but can not carry anything you see things with me but you can't see what I am made of. What am I?",
    answer: "A microscope."
  },
  {
    question: "I'm fatherless and motherless and born without sin. Roaring when entering the world, I never speak again. What am I? ",
    answer: "Thunder"
  },
  {
    question: "	Six glasses are in a row. The first three are filled with milk, and the last three are empty. By moving only one glass, can you arrange them so that the full and the empty glasses alternate?",
    answer: "Pick up the second glass and pour the milk into the fifth glass and then put it back in the second position. "
  },
  {
    question: "My tongue is long, my breath is strong, And yet I breed no strife; My voice you hear both far and near, And yet I have no life. What am I?",
    answer: "A bell"
  },
  {
    question: "The day before yesterday, Chris was 7 years old. Next year, she'll turn 10. How is this possible? ",
    answer: "Today is Jan. 1st. Yesterday, December 31, was Chris's 8th birthday. On December 30, she was still 7. This year she will turn 9, and next year, she'll turn 10. "
  },
  {
    question: "	A structure with two occupants, sometimes one, rarely three. Break the walls, eat the borders, then throw away me. What am I? ",
    answer: "A peanut"
  }
];

export default function Riddles() {
  const [currentRiddle, setCurrentRiddle] = useState<Riddle | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const rand = Math.floor(Math.random() * riddlesList.length);
    setCurrentRiddle(riddlesList[rand]);
  }, []);

  const revealAnswer = () => {
    setRevealed(true);
  };

  return (
    <Layout>
    <div className="flex flex-col text-center">
      <h4 className="">I currently have <span className="text-sky-400">{riddlesList.length}</span> riddles for you</h4>
      
      {currentRiddle ? (
        <div>
          <h2 className="text-4xl font-bold">{currentRiddle.question}</h2>
          <div className="mt-8 text-sky-400">
            {revealed && <p className="text-3xl">{currentRiddle.answer}</p>}
          </div>
          {!revealed ? <button className="button-bg font-bold px-6 py-3 rounded-3xl" onClick={revealAnswer}>Reveal Answer</button> : null}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
    </Layout>
  );
}
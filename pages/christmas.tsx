import { useState, useEffect } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";

export type ChristmasTriviaQuestion = {
  question: string;
  answer: string;
  day: number;
};

const triviaQuestions: ChristmasTriviaQuestion[] = [
  {
    question:
      "Which country started the tradition of putting up a Christmas tree?",
    answer: "Germany",
    day: 9,
  },
  {
    question:
      "In the song '12 Days of Christmas' if you added up all the gifts, how many would you have received?",
    answer: "364",
    day: 10,
  },
  {
    question: "How many reindeer drive Santa's sleigh (including Rudolph)?",
    answer: "9",
    day: 11,
  },
  {
    question: "What do children in Sweden leave out for Santa?",
    answer: "A cup of coffee so he doesn’t get tired",
    day: 12
  },
  {
    question: "How many tips do traditional snowflakes have?",
    answer: "6",
    day: 13
  },
  {
    question: "Who wrote the classic story A Christmas Carol?",
    answer: "Charles Dickens",
    day: 14
  },
  {
    question: "In Home Alone, what are the names of the two burglars trying to break into Kevin McCallister's house?",
    answer: "Harry and Marv",
    day: 15
  },
  {
    question: "During WW1, a famous 'Christmas Truce' took place, when soldiers agreed to a cease fire to celebrate the occasion and play football. But which year did it take place?",
    answer: "1914",
    day: 16
  },
  {
    question: "Which country is often credited with the tradition of hanging stockings by the fireplace for Santa Claus to fill with gifts?",
    answer: "United States",
    day: 17
  },
  {
    question: "What is the most popular meal for Christmas in Japan?",
    answer: "KFC",
    day: 18
  },
  {
    question: "Which actor voiced six different roles in the film 'The Polar Express'?",
    answer: "Tom Hanks",
    day: 19
  },
  {
    question: "HOH OHO is Santa's official Postcode in which country?",
    answer: "Canada",
    day: 20
  },
  {
    question: "What is the significance of the red and white stripes on a traditional peppermint candy cane?",
    answer: " The red stripes are said to represent the blood and sacrifice of Jesus Christ, and the white lines symbolize his purity.",
    day: 21
  },
  {
    question: "Which state in the U.S. is known for growing the most Christmas trees?",
    answer: "Oregon",
    day: 22
  },
  {
    question:
      "Which country started the tradition of putting up a Christmas tree?",
    answer: "Germany",
    day: 23,
  },
  {
    question: "In Greek legend, who is Santa Claus derived from?",
    answer: "St. Nicholas of Myra",
    day: 24
  },
  {
    question: "What day is it?",
    answer: "Christmas Day! 🎄🎅🎁",
    day: 25
  }
];

export default function Christmas() {
  const [currentQuestion, setCurrentQuestion] =
    useState<ChristmasTriviaQuestion | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const date = new Date();
    const day = date.getDate();
    const question = triviaQuestions.find((q) => q.day === day);

    setCurrentQuestion(question ?? null);
  }, []);

  const revealAnswer = () => {
    setRevealed(true);
  };

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className="flex flex-col text-center">
        {currentQuestion ? (
          <div>
            <h3 className="mb-4 text-white text-2xl font-bold">Brightmines Christmas Trivia</h3>
            <h2 className="text-6xl text-green-500 font-bold">
            <div className="flex">
            {currentQuestion.question}
            </div>
            </h2>
            <div className="mt-8 text-red-500">
              {revealed && <p className="text-5xl">{currentQuestion.answer}</p>}
            </div>
            {!revealed ? (
              <button
                className="button-bg font-bold px-6 py-3 rounded-3xl"
                onClick={revealAnswer}
              >
                Reveal Answer
              </button>
            ) : null}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Layout>
  );
}

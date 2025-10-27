'use client'
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import Head from "next/head";

type Question = {
  question: string;
  answer: boolean;
  category: string;
};

type GameState =
  | { phase: 'boot' }
  | { phase: 'question', index: number, typed: string, answered: boolean }
  | { phase: 'feedback', correct: boolean, index: number }
  | { phase: 'complete' };

export default function TrueFalse() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameState, setGameState] = useState<GameState>({ phase: 'boot' });
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [bootText, setBootText] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load questions
  useEffect(() => {
    fetch('/data/tf-questions.json')
      .then(res => res.json())
      .then(data => {
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
      });
  }, []);

  // Boot sequence
  useEffect(() => {
    if (gameState.phase === 'boot' && questions.length > 0) {
      const bootMessages = [
        "> INITIALIZING BRAIN.EXE...",
        "> LOADING QUESTIONS DATABASE...",
        "> ESTABLISHING SECURE CONNECTION...",
        "> CONNECTION ESTABLISHED",
        "> SYSTEM READY",
        "> [READY]",
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < bootMessages.length) {
          setBootText(prev => [...prev, bootMessages[index]]);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setGameState({ phase: 'question', index: 0, typed: '', answered: false });
          }, 800);
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [gameState.phase, questions]);

  // Typing effect for questions
  useEffect(() => {
    if (gameState.phase === 'question' && !gameState.answered) {
      const currentQuestion = questions[gameState.index];
      if (!currentQuestion) return;

      const fullText = currentQuestion.question;
      let charIndex = 0;

      const interval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setGameState(prev =>
            prev.phase === 'question'
              ? { ...prev, typed: fullText.slice(0, charIndex) }
              : prev
          );
          charIndex++;
        } else {
          clearInterval(interval);
          // Focus input when typing is done
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [gameState.phase, gameState.phase === 'question' ? gameState.index : 0, questions]);

  const handleSubmit = () => {
    if (gameState.phase !== 'question') return;

    const normalized = input.toLowerCase().trim();
    const validTrue = ['true', 't', '1', 'yes', 'y'];
    const validFalse = ['false', 'f', '0', 'no', 'n'];

    let userAnswer: boolean | null = null;
    if (validTrue.includes(normalized)) {
      userAnswer = true;
    } else if (validFalse.includes(normalized)) {
      userAnswer = false;
    }

    if (userAnswer === null) {
      // Invalid command
      setInput("");
      return;
    }

    const currentQuestion = questions[gameState.index];
    const correct = userAnswer === currentQuestion.answer;

    if (correct) {
      setScore(prev => prev + 1);
    }

    setGameState({ phase: 'feedback', correct, index: gameState.index });
    setInput("");

    setTimeout(() => {
      if (gameState.index + 1 < questions.length) {
        setGameState({ phase: 'question', index: gameState.index + 1, typed: '', answered: false });
      } else {
        setGameState({ phase: 'complete' });
      }
    }, 2000);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getFinalMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "> ELITE STATUS ACHIEVED. WELCOME TO THE GIBSON.";
    if (percentage >= 80) return "> ACCESS GRANTED. YOU ARE ONE OF US.";
    if (percentage >= 60) return "> PARTIAL ACCESS GRANTED. KEEP LEARNING.";
    if (percentage >= 40) return "> UNAUTHORIZED. UPGRADE YOUR WETWARE.";
    return "> CRASH AND BURN. BACK TO THE BASICS, SCRIPT KIDDIE.";
  };

  return (
    <>
      <Head>
        <title>True/False Terminal - WreckItRob</title>
      </Head>
      <div className="terminal-container">
        <style jsx>{`
          .terminal-container {
            min-height: 100vh;
            background: #000000;
            color: #00ff00;
            font-family: 'Courier New', Courier, Monaco, monospace;
            padding: 2rem;
            position: relative;
            overflow: hidden;
          }

          .terminal-header {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #00ff00;
          }

          .terminal-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 10px #00ff00;
          }

          .terminal-output {
            margin-bottom: 1rem;
            line-height: 1.6;
          }

          .boot-line {
            margin: 0.3rem 0;
            opacity: 0;
            animation: fadeIn 0.3s forwards;
          }

          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }

          .question-header {
            color: #00ff00;
            margin-bottom: 1rem;
            font-weight: bold;
          }

          .question-text {
            color: #00ff00;
            margin-bottom: 2rem;
            font-size: 1.1rem;
            min-height: 3rem;
          }

          .cursor {
            animation: blink 1s infinite;
          }

          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }

          .terminal-prompt {
            display: flex;
            align-items: center;
            margin-top: 1rem;
          }

          .prompt-symbol {
            color: #00ff00;
            margin-right: 0.5rem;
            font-weight: bold;
          }

          .terminal-input {
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: 'Courier New', Courier, Monaco, monospace;
            font-size: 1rem;
            outline: none;
            flex: 1;
            caret-color: #00ff00;
          }

          .feedback-message {
            margin: 1rem 0;
            font-weight: bold;
            font-size: 1.1rem;
          }

          .feedback-correct {
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
          }

          .feedback-wrong {
            color: #ff0000;
            text-shadow: 0 0 10px #ff0000;
          }

          .score-display {
            color: #00ff00;
            font-weight: bold;
            margin: 0.5rem 0;
          }

          .complete-screen {
            text-align: center;
            padding: 2rem;
          }

          .final-score {
            font-size: 2rem;
            margin: 2rem 0;
            text-shadow: 0 0 20px #00ff00;
          }

          .final-message {
            font-size: 1.2rem;
            margin: 1rem 0;
          }

          .scanline {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              to bottom,
              transparent 50%,
              rgba(0, 255, 0, 0.03) 51%
            );
            background-size: 100% 4px;
            pointer-events: none;
            animation: scan 8s linear infinite;
          }

          @keyframes scan {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 0 100%;
            }
          }

          .crt-effect {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
            pointer-events: none;
          }

          @media (max-width: 768px) {
            .terminal-container {
              padding: 1rem;
            }

            .terminal-title {
              font-size: 1.2rem;
            }

            .question-text {
              font-size: 1rem;
            }
          }
        `}</style>

        {/* CRT Effects */}
        <div className="scanline"></div>
        <div className="crt-effect"></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="terminal-header">
            <div className="terminal-title">
              {">"} BRAIN.EXE - TRUE/FALSE PROTOCOL
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              root@wreckitrob:~#
            </div>
          </div>

          {gameState.phase === 'boot' && (
            <div className="terminal-output">
              {bootText.map((line, idx) => (
                <div key={idx} className="boot-line" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {line}
                </div>
              ))}
            </div>
          )}

          {gameState.phase === 'question' && (
            <div>
              <div className="question-header">
                [QUESTION {gameState.index + 1}/{questions.length}] [SCORE: {score}/{gameState.index}]
              </div>
              <div className="question-text">
                {">"} {gameState.typed}
                {gameState.typed.length < questions[gameState.index]?.question.length && (
                  <span className="cursor">█</span>
                )}
              </div>
              {gameState.typed.length === questions[gameState.index]?.question.length && (
                <div className="terminal-prompt">
                  <span className="prompt-symbol">root@wreckitrob:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="terminal-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="true or false?"
                    autoFocus
                  />
                  <span className="cursor">█</span>
                </div>
              )}
            </div>
          )}

          {gameState.phase === 'feedback' && (
            <div>
              <div className="question-header">
                [QUESTION {gameState.index + 1}/{questions.length}] [SCORE: {score}/{gameState.index + 1}]
              </div>
              {gameState.correct ? (
                <div className="feedback-message feedback-correct">
                  {">"} ACCESS GRANTED
                  <br />
                  {">"} LOADING NEXT QUERY...
                </div>
              ) : (
                <div className="feedback-message feedback-wrong">
                  {">"} ERROR 404: Brains not found, please try another command
                  <br />
                  {">"} LOADING NEXT QUERY...
                </div>
              )}
            </div>
          )}

          {gameState.phase === 'complete' && (
            <div className="complete-screen">
              <div className="final-score">
                {">"} FINAL SCORE: {score}/{questions.length}
              </div>
              <div className="final-message">
                {getFinalMessage()}
              </div>
              <div style={{ marginTop: '3rem', fontSize: '0.9rem', opacity: 0.7 }}>
                {">"} PROTOCOL COMPLETE
                <br />
                {">"} CONNECTION TERMINATED
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
